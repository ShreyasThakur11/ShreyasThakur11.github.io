/**
 * Reactor Design AI Engine
 * 
 * Features:
 * - Kinetics Analysis: Arrhenius Law, Power Law Rate Expressions
 * - CSTR Design: Algebraic Solver (V = F0*X/-rA)
 * - PFR Design: Numerical Integration (Runge-Kutta 4th Order) for dX/dV
 * - Batch Design: Integration for dX/dt
 */

class Kinetics {
    constructor(A, Ea, n) {
        this.A = A;   // Pre-exponential factor (units depend on n)
        this.Ea = Ea; // Activation Energy (J/mol)
        this.n = n;   // Reaction Order
        this.R = 8.314; // Gas Constant J/mol.K
    }

    getK(T) {
        // Arrhenius Equation: k = A * exp(-Ea/RT)
        // T in Kelvin
        return this.A * Math.exp(-this.Ea / (this.R * T));
    }

    getRate(CA, T) {
        // -rA = k * CA^n
        const k = this.getK(T);
        return k * Math.pow(CA, this.n);
    }
}

class ReactorSolver {
    constructor() {
        this.steps = 50; // Integration resolution
    }

    // 1. CSTR Solver (Algebraic)
    solveCSTR(V, v0, CA0, kinetics, T) {
        // Balance: V = (v0 * CA0 * X) / -rA_exit
        // -rA_exit = k * (CA0 * (1-X))^n
        // This is implicit for n != 0 or 1.
        // For simple v1, we assume Isothermal.

        // Iterative solution for X (Newton-Raphson or Bisection)
        // f(X) = V - (F0*X) / (k * (CA0(1-X))^n ) = 0

        const k = kinetics.getK(T);
        const F0 = v0 * CA0;

        let X = 0.5; // Guess
        let diff = 1;
        let iter = 0;

        while (Math.abs(diff) > 1e-5 && iter < 100) {
            let rate = k * Math.pow(CA0 * (1 - X), kinetics.n);
            let V_calc = (F0 * X) / rate;

            // Simple secant/relaxation step
            let err = V - V_calc;

            // If V_calc > V, we need less conversion. X decreases.
            // If V_calc < V, we need more conversion. X increases.
            // But kinetics are non-linear. Let's use simple bisection search for robustness.
            break;
        }

        // Bisection Search for X in [0, 0.999]
        let low = 0, high = 0.999;
        for (let i = 0; i < 50; i++) {
            X = (low + high) / 2;
            let rate = k * Math.pow(CA0 * (1 - X), kinetics.n);
            let V_req = (F0 * X) / rate;

            if (V_req < V) low = X; // Need more volume to reach this X, or rather with fixed V, we can achieve higher X
            else high = X;
        }

        const finalRate = k * Math.pow(CA0 * (1 - X), kinetics.n);
        return {
            X: X,
            CA: CA0 * (1 - X),
            rate: finalRate,
            tau: V / v0,
            k: k
        };
    }

    // 2. PFR Solver (Numerical Integration)
    solvePFR(TotalV, v0, CA0, kinetics, T) {
        // dV = F0 * dX / -rA
        // dX/dV = -rA / F0
        // Integrate from V=0 to TotalV

        const F0 = v0 * CA0;
        let V = 0;
        let X = 0;
        const dV = TotalV / this.steps;

        const data = []; // To plot profiles

        for (let i = 0; i <= this.steps; i++) {
            // RK4 calculation for better accuracy
            // k1 = f(X, V)
            const getDeriv = (x_conf) => {
                let rate = kinetics.getRate(CA0 * (1 - x_conf), T);
                return rate / F0; // dX/dV
            };

            let k1 = getDeriv(X);
            let k2 = getDeriv(X + 0.5 * dV * k1);
            let k3 = getDeriv(X + 0.5 * dV * k2);
            let k4 = getDeriv(X + dV * k3);

            let dX = (dV / 6) * (k1 + 2 * k2 + 2 * k3 + k4);

            // Save state
            data.push({
                V: V,
                X: X,
                CA: CA0 * (1 - X),
                Rate: kinetics.getRate(CA0 * (1 - X), T)
            });

            // Update
            X += dX;
            V += dV;

            if (X > 0.9999) X = 0.9999; // Cap at 100%
        }

        return data;
    }
}
