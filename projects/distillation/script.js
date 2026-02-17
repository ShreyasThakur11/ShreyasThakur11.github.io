/**
 * Distillation Tower Design Tool - McCabe Thiele Method
 * Professional Grade Implementation
 * 
 * Features:
 * - Constant Alpha VLE Generation
 * - q-Line Analysis
 * - Minimum Reflux Calculation
 * - Theoretical Stage Stepping
 * - Feed Stage Location
 * - Mechanical Sizing (H, D)
 */

class McCabeThiele {
    constructor(inputs) {
        // Unpack Inputs
        this.F = inputs.F;      // Feed Flow (kmol/h)
        this.xF = inputs.xF;    // Feed Comp
        this.xD = inputs.xD;    // Distillate Comp
        this.xB = inputs.xB;    // Bottoms Comp
        this.q = inputs.q;      // Thermal Condition
        this.R = inputs.R;      // Reflux Ratio
        this.alpha = inputs.alpha || 2.5; // Relative Volatility
        this.pressure = inputs.pressure || 1.0; // atm

        // Mechanical Inputs
        this.tray_spacing = inputs.tray_spacing || 0.6; // m
        this.efficiency = inputs.efficiency || 0.7; // 0-1

        // Computed State
        this.points = { equilibrium: [], diagonal: [], op_rect: [], op_strip: [], q_line: [], stages: [] };
        this.results = {};

        this.init();
    }

    init() {
        this.generateVLE();
        this.calcQLineIntersection();
        this.calcMinReflux();

        // If R not provided (Design Mode), set heuristic
        if (!this.R) {
            this.R = 1.3 * this.results.R_min;
        }

        this.calcOperatingLines();
        this.countStages();
        this.sizeColumn();
    }

    // --- 1. VLE GENERATION ---
    generateVLE() {
        const pts = [];
        for (let x = 0; x <= 1.01; x += 0.01) {
            // y = alpha*x / (1 + (alpha-1)*x)
            let y = (this.alpha * x) / (1 + (this.alpha - 1) * x);
            pts.push({ x: x, y: y });
        }
        this.points.equilibrium = pts;
        this.points.diagonal = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    }

    // --- 2. Q-LINE ANALYSIS ---
    calcQLineIntersection() {
        // Intersection of q-line and Diagonal is at (xF, xF)
        // Slope = q / (q-1)
        // We find intersection with Equilibrium Curve for R_min pinch? 
        // No, Q-Line intersection with Equilibrium is needed for pinch if q != 1

        // Find x_pinch where q-line intersects equilibrium
        // q-line eq: y = (q/q-1)x - (xF/q-1)
        // VLE eq: y = ax / (1 + (a-1)x)
        // Equate and solve quadratic for x_pinch (if q!=1)

        let x_pinch, y_pinch;

        if (Math.abs(this.q - 1) < 0.001) {
            // q=1 (Saturated Liquid) -> Vertical Line at xF
            x_pinch = this.xF;
            y_pinch = (this.alpha * x_pinch) / (1 + (this.alpha - 1) * x_pinch);
        } else if (this.q === 0) {
            // Saturated Vapor -> Horizontal at y=xF? No, slope 0.
            // y = xF. Find x on VLE where y=xF
            y_pinch = this.xF;
            x_pinch = y_pinch / (this.alpha - y_pinch * (this.alpha - 1));
        } else {
            // Quadratic Intersection
            // A*x^2 + B*x + C = 0
            // Derived from equating Y_qline = Y_vle
            const m = this.q / (this.q - 1);
            const c = -this.xF / (this.q - 1);
            const A = m * (this.alpha - 1);
            const B = m + c * (this.alpha - 1) - this.alpha;
            const C = c;

            // Quadratic formula
            const det = Math.sqrt(B * B - 4 * A * C);
            const x1 = (-B + det) / (2 * A);
            const x2 = (-B - det) / (2 * A);

            // Valid root is between 0 and 1 (usually the smaller one unless strange params)
            x_pinch = (x1 >= 0 && x1 <= 1) ? x1 : x2;
            y_pinch = m * x_pinch + c;
        }

        this.results.pinchPoint = { x: x_pinch, y: y_pinch };

        // Q-Line visual points (extending a bit)
        if (Math.abs(this.q - 1) < 0.001) {
            this.points.q_line = [{ x: this.xF, y: this.xF }, { x: this.xF, y: y_pinch }];
        } else {
            this.points.q_line = [{ x: this.xF, y: this.xF }, { x: x_pinch, y: y_pinch }];
        }
    }

    // --- 3. MINIMUM REFLUX ---
    calcMinReflux() {
        // R_min occurs when ROL passes through the Intersection of Q-line and Equilibrium Curve (Pinch Point)
        // ROL passes through (xD, xD) and (x_pinch, y_pinch)
        // Slope = R / (R+1) = (xD - y_pinch) / (xD - x_pinch)

        const pp = this.results.pinchPoint;
        const slope_min = (this.xD - pp.y) / (this.xD - pp.x);

        // slope = R / (R+1)  =>  R = slope / (1 - slope)
        this.results.R_min = slope_min / (1 - slope_min);

        // Safety: if xD < x_pinch (impossible for rectifier), handle error
        if (this.results.R_min < 0) this.results.R_min = 0; // Should not happen in normal distillation
    }

    // --- 4. OPERATING LINES ---
    calcOperatingLines() {
        // Rectifying Line (ROL): y = (R/R+1)x + xD/(R+1)
        // Intersects Q-line at new point (not pinch point unless R=Rmin)

        // 1. Solve ROL intersection with Q-Line
        const R = this.R;
        const slope_rol = R / (R + 1);
        const intercept_rol = this.xD / (R + 1);

        let x_int, y_int;

        if (Math.abs(this.q - 1) < 0.001) {
            // Q-line x = xF
            x_int = this.xF;
            y_int = slope_rol * x_int + intercept_rol;
        } else {
            // Solve: slope_rol*x + int_rol = (q/q-1)x - (xF/q-1)
            const mq = this.q / (this.q - 1);
            const cq = -this.xF / (this.q - 1);
            x_int = (cq - intercept_rol) / (slope_rol - mq);
            y_int = slope_rol * x_int + intercept_rol;
        }

        this.results.opPoint = { x: x_int, y: y_int };

        // ROL Points for graph: (xD, xD) to (x_int, y_int)
        this.points.op_rect = [{ x: this.xD, y: this.xD }, { x: x_int, y: y_int }];

        // SOL Points for graph: (xB, xB) to (x_int, y_int)
        this.points.op_strip = [{ x: this.xB, y: this.xB }, { x: x_int, y: y_int }];

        // Store equations for stepping
        this.ROL = { m: slope_rol, c: intercept_rol };
        // SOL eq: Two points (xB,xB) and (x_int,y_int)
        const m_sol = (y_int - this.xB) / (x_int - this.xB);
        const c_sol = this.xB - m_sol * this.xB;
        this.SOL = { m: m_sol, c: c_sol };
    }

    // --- 5. STAGE STEPPING ---
    countStages() {
        const stages = [];
        let x_curr = this.xD;
        let y_curr = this.xD;
        let iter = 0;
        let feed_stage = 0;

        // Start at (xD, xD)
        stages.push({ x: x_curr, y: y_curr });

        const MaxStages = 100;

        while (x_curr > this.xB && iter < MaxStages) {
            iter++;

            // 1. Horizontal Step: Equilibrium (y_curr -> x_eq)
            // Given y, find x on VLE: y = ax / (1+(a-1)x)
            // x = y / (alpha - y(alpha-1))
            const x_eq = y_curr / (this.alpha - y_curr * (this.alpha - 1));

            stages.push({ x: x_eq, y: y_curr }); // Point on VLE

            // 2. Vertical Step: Operating Line (x_eq -> y_op)
            // Which operating line? 
            let y_op;
            if (x_eq > this.results.opPoint.x) {
                // Rectifying Section
                y_op = this.ROL.m * x_eq + this.ROL.c;
            } else {
                // Stripping Section
                if (feed_stage === 0) feed_stage = iter; // Just crossed feed
                y_op = this.SOL.m * x_eq + this.SOL.c;
            }

            // Check if we passed xB
            if (x_eq < this.xB) {
                x_curr = x_eq; // Final composition
                break;
            }

            stages.push({ x: x_eq, y: y_op }); // Point on OP Line

            x_curr = x_eq;
            y_curr = y_op;
        }

        this.points.stages = stages;
        this.results.N_theo = iter;
        this.results.N_feed = feed_stage;
        this.results.N_actual = iter / this.efficiency;

        if (iter >= MaxStages) {
            this.results.warning = "Max stages reached (Pinch or R too low?)";
        }
    }

    // --- 6. MECHANICAL SIZING ---
    sizeColumn() {
        // Mass Balance
        // D = F(xF - xB)/(xD - xB)
        const D_flow = this.F * (this.xF - this.xB) / (this.xD - this.xB);
        const B_flow = this.F - D_flow;

        this.results.D_flow = D_flow;
        this.results.B_flow = B_flow;

        // Vapor Flow (Internal)
        // V = D * (R+1)
        const V_flow_kmol = D_flow * (this.R + 1);
        // Mass Flow approx (Assuming MW avg ~ 50 for generic HCs, or user input?)
        const MW = 50; // Estimation
        const V_flow_kg = V_flow_kmol * MW;

        // Sizing (Souders-Brown)
        // U_max = K * sqrt((rhoL - rhoV)/rhoV)
        // Generic params for organic solvents
        const rhoL = 800; // kg/m3
        const rhoV = 1.1 * this.pressure; // kg/m3 approx
        const K = 0.07; // Sieve tray constant (approx)

        const U_flood = K * Math.sqrt((rhoL - rhoV) / rhoV);
        const U_design = 0.7 * U_flood; // 70% flooding

        // Area = VolFlow / Velocity
        // VolFlow = Mass / rhoV
        const VolFlow = V_flow_kg / rhoV / 3600; // m3/s
        const Area = VolFlow / U_design;
        const Dia = Math.sqrt(4 * Area / Math.PI);

        // Height
        const Height = (this.results.N_actual * this.tray_spacing) + 2.0; // +2m for sump/top

        this.results.Diameter = Dia;
        this.results.Height = Height;
        this.results.VaporFlow = V_flow_kmol;
    }
}

// Expose to window
window.McCabeThiele = McCabeThiele;
