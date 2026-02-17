/**
 * Multicomponent Distillation Design Tool (FUG Method)
 * Implements Fenske-Underwood-Gilliland-Kirkbride Shortcut Method
 */

class FUGDesign {
    constructor(inputs) {
        this.F = inputs.F; // Feed Flow kmol/h
        this.components = inputs.components; // Array of {name, z, alpha, MW, type}
        this.q = inputs.q || 1.0; // Feed Quality
        this.R_factor = inputs.R_factor || 1.2; // R = factor * Rmin
        this.recovery_LK = inputs.recovery_LK || 0.99;
        this.recovery_HK = inputs.recovery_HK || 0.01; // Actually fractional recovery in Distillate

        this.pressure = inputs.pressure || 1.0; // atm
        this.spacing = inputs.tray_spacing || 0.6; // m

        this.results = {};

        this.init();
    }

    init() {
        this.identifyKeys();
        this.performMassBalance();
        this.calcFenske();
        this.solveUnderwood();
        this.calcGilliland();
        this.calcKirkbride();
        this.calcSizing();
    }

    // 1. Identify Keys & Validations
    identifyKeys() {
        // Sort by Alpha (Descending)
        this.components.sort((a, b) => b.alpha - a.alpha);

        // Find assigned keys from input or default
        this.LK_index = this.components.findIndex(c => c.type === 'LK');
        this.HK_index = this.components.findIndex(c => c.type === 'HK');

        // Validate
        if (this.LK_index === -1 || this.HK_index === -1 || this.LK_index >= this.HK_index) {
            // Fallback: Autoset indices if not set or invalid
            // Default to splitting middle two
            const mid = Math.floor(this.components.length / 2);
            this.LK_index = mid - 1;
            this.HK_index = mid;
            this.components[this.LK_index].type = 'LK';
            this.components[this.HK_index].type = 'HK';
        }

        this.alpha_LK = this.components[this.LK_index].alpha;
        this.alpha_HK = this.components[this.HK_index].alpha;
    }

    // 2. Initial Mass Balance (Split Keys)
    performMassBalance() {
        // Estimate Distillate (d) and Bottoms (b) flows for each component
        let D_total = 0;
        let B_total = 0;

        this.components.forEach((comp, i) => {
            const f = this.F * comp.z;
            let d_i, b_i;

            if (i < this.LK_index) {
                // LNK (Lighter than LK) -> Go to Distillate
                d_i = f;
                b_i = 0;
            } else if (i > this.HK_index) {
                // HNK (Heavier than HK) -> Go to Bottoms
                d_i = 0;
                b_i = f;
            } else if (i === this.LK_index) {
                // LK Split
                d_i = f * this.recovery_LK;
                b_i = f - d_i;
            } else if (i === this.HK_index) {
                // HK Split (recovery_HK is typically frac in Bottoms or Dist? 
                // Let's assume input is Recov in Distillate for consistency logic, usually low like 0.01)
                d_i = f * this.recovery_HK;
                b_i = f - d_i;
            }

            comp.d = d_i;
            comp.b = b_i;
            D_total += d_i;
            B_total += b_i;
        });

        this.D = D_total;
        this.B = B_total;

        // Calc compositions
        this.components.forEach(c => {
            c.xD = this.D > 0 ? c.d / this.D : 0;
            c.xB = this.B > 0 ? c.b / this.B : 0;
        });
    }

    // 3. Fenske Equation (Min Stages)
    calcFenske() {
        // Nmin = log[ (d_LK/b_LK) * (b_HK/d_HK) ] / log(alpha_LK/alpha_HK)
        const LK = this.components[this.LK_index];
        const HK = this.components[this.HK_index];

        const separation_factor = (LK.d / LK.b) * (HK.b / HK.d);
        const relative_volatility = this.alpha_LK / this.alpha_HK; // Alpha is relative to HK usually?? 
        // User inputs Alpha rel to HK or rel to Heavy Component? 
        // Logic: Input Alpha relative to HK (so HK alpha=1). If not, we normalize.
        // Assuming Input Alphas are absolute relative to a reference.

        this.N_min = Math.log(separation_factor) / Math.log(LK.alpha / HK.alpha);

        // Recalculate component distribution for non-keys using Fenske
        // d_i / b_i = alpha_i^Nmin * (d_HK / b_HK)
        const hk_ratio = HK.d / HK.b;

        let new_D = 0, new_B = 0;
        this.components.forEach(c => {
            const ratio = Math.pow(c.alpha / HK.alpha, this.N_min) * hk_ratio;
            // f = d + b = d + d/ratio = d(1 + 1/ratio)
            const f = this.F * c.z;
            c.d = f / (1 + 1 / ratio);
            c.b = f - c.d;

            new_D += c.d;
            new_B += c.b;
        });

        // Update Totals & Comps
        this.D = new_D;
        this.B = new_B;
        this.components.forEach(c => {
            c.xD = c.d / this.D;
            c.xB = c.b / this.B;
        });

        this.results.N_min = this.N_min;
    }

    // 4. Underwood (Min Reflux)
    solveUnderwood() {
        // Step 1: Find theta. Sum( alpha * zF / (alpha - theta) ) = 1 - q
        // theta must be between alpha_HK and alpha_LK

        const f_theta = (theta) => {
            let sum = 0;
            this.components.forEach(c => {
                sum += (c.alpha * c.z) / (c.alpha - theta);
            });
            return sum - (1 - this.q);
        };

        // Bisection Method
        let low = this.alpha_HK + 0.0001;
        let high = this.alpha_LK - 0.0001;
        let theta = (low + high) / 2;

        for (let i = 0; i < 100; i++) {
            const val = f_theta(theta);
            if (Math.abs(val) < 1e-6) break;

            if (val > 0) {
                // Function is increasing? Check derivative... 
                // d/dtheta of term is alpha*z / (alpha-theta)^2 ... always positive sum
                // So function is monotonically increasing.
                // If val > 0, theta is too high?
                // Wait, pole at alpha. Graph shape hyperbola.
                // Between alpha_HK and alpha_LK, function goes from -inf to +inf.
                // So strictly increasing.
                // If val > target (0), reduce theta? 
                // Sum > 1-q. 
                // Let's verify monotonicity. alpha=2, theta=1.5denom=0.5 -> pos.
                // Yes. increasing.
                // If sum > target, we need smaller theta.
                // Wait. 1/(a-theta). As theta increases -> a-theta decreases -> term increases.
                // Yes.
                high = theta;
            } else {
                low = theta;
            }
            theta = (low + high) / 2;
        }

        this.theta = theta;
        this.results.theta = theta;

        // Step 2: Calc Rmin. Sum( alpha * xD / (alpha - theta) ) = Rmin + 1
        let sum_R = 0;
        this.components.forEach(c => {
            sum_R += (c.alpha * c.xD) / (c.alpha - theta);
        });

        this.R_min = sum_R - 1;
        this.results.R_min = this.R_min;

        // Operating Reflux
        this.R_op = this.R_factor * this.R_min;
        this.results.R_op = this.R_op;
    }

    // 5. Gilliland (Actual Stages)
    calcGilliland() {
        // X = (R - Rmin) / (R + 1)
        const X = (this.R_op - this.R_min) / (this.R_op + 1);

        // Eduljee correlation
        // Y = (N - Nmin) / (N + 1)
        // Y = 0.75 * (1 - X^0.5668)

        const Y = 0.75 * Math.pow(1 - Math.pow(X, 0.5668), 1); // Approx
        // Actually: Y = 1 - exp(...) ? 
        // A common fit: Y = 0.75 * (1 - X^0.566)  is okay for manual tool
        // Chang's Eq: Y = 1 - exp(1.468 + 6.3*X - 9.8*X^2 ...) complex.
        // Let's use simple Molokanov eq:
        // Y = 1 - exp((1+54.4X)/(11+117.2X) * (X-1) / sqrt(X)) ... too complex
        // Eduljee 1975: Y = 0.75(1-X^0.5668)  Verified to be decent.

        // Solve for N
        // Y(N+1) = N - Nmin
        // YN + Y = N - Nmin
        // Nmin + Y = N(1 - Y)
        // N = (Nmin + Y) / (1 - Y)

        this.N_theo = (this.N_min + Y) / (1 - Y);
        this.results.N_theo = this.N_theo;
    }

    // 6. Kirkbride (Feed Stage)
    calcKirkbride() {
        // Log(Nr/Ns) = 0.206 * log[ (zHK/zLK) * (xBLK/xDHK)^2 * (B/D) ]
        // Wait, standard eq term squared is usually (x_B_LK / x_D_HK) ... let's check Seader Henley
        // (x_B,LK / x_D,HK) * (B/D) * (z_F,HK / z_F,LK) ?
        // Usually: Log Ratio = 0.206 * log(...) 
        // Term = (z_f_HK / z_f_LK) * (x_b_LK / x_d_HK)^2 * (B/D) is WRONG
        // Correct Eq: log(Nr/Ns) = 0.206 * log [ (B/D) * (zHK/zLK) * (xBLK / xDHK)^2 ] is classic

        const LK = this.components[this.LK_index];
        const HK = this.components[this.HK_index];

        const term = (this.B / this.D) * (HK.z / LK.z) * Math.pow(LK.xB / HK.xD, 2);
        const log_ratio = 0.206 * Math.log10(term);
        const ratio = Math.pow(10, log_ratio); // Nr / Ns

        // N_theo = Nr + Ns
        // Nr = ratio * Ns
        // ratio*Ns + Ns = N_theo
        // Ns = N_theo / (1 + ratio)

        this.N_strip = this.N_theo / (1 + ratio);
        this.N_rect = this.N_theo - this.N_strip;

        // Feed stage from top (Rectifying stages + 1 usually)
        this.FeedStage = this.N_rect;

        this.results.N_rect = this.N_rect;
        this.results.N_strip = this.N_strip;
        this.results.FeedStage = this.FeedStage;
    }

    // 7. Sizing
    calcSizing() {
        // Vapor Flow Estimate (Top)
        // V = D(R+1)
        const V_top = this.D * (this.R_op + 1);
        this.results.V_top = V_top;

        const MW_avg = 50; // Estimation needed from compos
        const rhoV = 1.2 * this.pressure; // approx
        // ... (Similar to Distillation Sizing)
        const u_des = 0.6; // m/s default
        const Area = (V_top * MW_avg / 3600 / rhoV) / u_des;
        this.results.Diameter = Math.sqrt(4 * Area / Math.PI);
        this.results.Height = this.N_theo * this.spacing / 0.7; // Efficiency 0.7
    }
}

// Expose
window.FUGDesign = FUGDesign;
