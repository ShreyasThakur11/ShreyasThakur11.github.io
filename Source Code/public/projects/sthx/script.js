
// --- 1. INDUSTRIAL FLUID DATABASE ---
// Properties at approx 25°C or standard processing temps
const FLUID_DB = {
    "water": { name: "Water", rho: 997, mu: 0.00089, cp: 4180, k: 0.607, fouling: 0.0001, type: "utility" },
    "sea_water": { name: "Sea Water", rho: 1025, mu: 0.00107, cp: 3993, k: 0.6, fouling: 0.0003, type: "corrosive" },
    "air": { name: "Air (1 atm)", rho: 1.184, mu: 0.0000185, cp: 1005, k: 0.026, fouling: 0.0002, type: "gas" },
    "engine_oil": { name: "Engine Oil (SAE 40)", rho: 884, mu: 0.486, cp: 1910, k: 0.145, fouling: 0.0002, type: "viscous" },
    "crude_oil": { name: "Crude Oil (34 API)", rho: 850, mu: 0.007, cp: 2000, k: 0.13, fouling: 0.0006, type: "fouling" },
    "kerosene": { name: "Kerosene", rho: 820, mu: 0.00164, cp: 2000, k: 0.12, fouling: 0.00025, type: "hc" },
    "benzene": { name: "Benzene", rho: 876, mu: 0.0006, cp: 1740, k: 0.14, fouling: 0.0002, type: "solvent" },
    "steam_lp": { name: "Steam (Low Pressure)", rho: 0.6, mu: 0.000012, cp: 2000, k: 0.025, fouling: 0.0, type: "utility" },
    "user_defined": { name: "User Defined", rho: 1000, mu: 0.001, cp: 4180, k: 0.6, fouling: 0.0002, type: "custom" }
};

// --- 2. CONFIG & STANDARDS ---
const TEMA_STANDARDS = {
    tubes: [
        { od: 0.01905, id: 0.01575, name: "3/4 inch BWG 14" },
        { od: 0.0254, id: 0.02118, name: "1 inch BWG 14" },
        { od: 0.03175, id: 0.026, name: "1.25 inch" },
        { od: 0.0381, id: 0.033, name: "1.5 inch" }
    ],
    shells: [8, 10, 12, 14, 16, 18, 20, 24, 30, 36, 42, 48, 60].map(d => d * 0.0254), // inches to meters
    clearance: {
        pull_through: 0.05, // m approx
        fixed_tubesheet: 0.015 // m approx
    }
};

// --- HELPER: Viscosity Correction ---
// Assume wall temp is average of bulk temps for now
function getViscosityCorrection(mu_bulk, mu_wall) {
    if (!mu_wall) return 1.0;
    return Math.pow(mu_bulk / mu_wall, 0.14);
}

// --- 3. CORE LOGIC ---

function calculateSTHX(inputData) {
    const logs = [];
    const defaults = {
        Rf: 0.0002,
        U_guess: 500,
        tube_length: 3.0,
        tube_passes: 2,
        baffle_cut: 0.25,
        layout: "triangular"
    };

    // 1. Data Parsing & Validation
    const D = { ...defaults, ...inputData }; // Merge defaults

    // Auto-balance Energy
    // If mass flows missing, estimating from Q is handled inside specific methods or pre-calc
    // For now assume logic similar to older script but strictly typed

    // 2. Fluid Allocation Logic (if Auto)
    if (D.allocation_mode === 'auto') {
        const h_visc = D.hot.mu > 0.1; // >100 cP
        const c_visc = D.cold.mu > 0.1;
        const h_pres = D.hot.P > 20; // bar
        const c_pres = D.cold.P > 20;

        let reason = "Default heuristic";

        if (h_visc && !c_visc) {
            D.allocation = "hot_shell";
            reason = "Hot fluid is viscous -> Shell Side";
        } else if (c_visc && !h_visc) {
            D.allocation = "cold_shell";
            reason = "Cold fluid is viscous -> Shell Side";
        } else if (h_pres && !c_pres) {
            D.allocation = "cold_shell"; // Hot (High P) -> Tubes
            reason = "Hot fluid High Pressure -> Tube Side";
        } else if (c_pres && !h_pres) {
            D.allocation = "hot_shell"; // Cold (High P) -> Tubes
            reason = "Cold fluid High Pressure -> Tube Side";
        } else if (D.hot.fouling > D.cold.fouling * 5) {
            D.allocation = "cold_shell"; // Hot (Foul) -> Tubes
            reason = "Hot fluid High Fouling -> Tube Side";
        } else {
            D.allocation = "hot_shell"; // Default
            reason = "No critical constraints, defaulting Hot=Shell";
        }
        logs.push(`ℹ️ Auto Allocation: ${reason}`);
    }

    // Assign Shell/Tube Sides
    let ShellSide, TubeSide;
    if (D.allocation === 'hot_shell') {
        ShellSide = D.hot; TubeSide = D.cold;
    } else {
        ShellSide = D.cold; TubeSide = D.hot;
    }

    // 3. Design Mode vs Rating Mode
    if (D.mode === 'design') {
        return runDesignIteration(ShellSide, TubeSide, D, logs);
    } else {
        return runRatingCalculation(ShellSide, TubeSide, D, logs);
    }
}

// --- 4. DESIGN ENGINE (Iterative) ---
function runDesignIteration(ShellFluid, TubeFluid, D, logs) {
    logs.push("🚀 Starting Design Iteration...");

    // Initial Assumptions
    let U_assumed = parseFloat(D.U_guess) || 500;
    let converged = false;
    let bestDesign = null;
    const MaxIter = 20;

    // We iterate on Shell Diameter to find match
    // Simplified Logic: 
    // 1. Calc Area Req from U_assumed
    // 2. Calc # Tubes
    // 3. Find Shell Dia fitting tubes
    // 4. Calc h_shell, h_tube -> U_calc
    // 5. Check error, Update U_assumed

    // Q Calculation (Assumes m, Cp, dT known or calculable)
    const Q = calculateDuty(ShellFluid, TubeFluid);
    if (!Q) return { error: "Insufficient thermal data to calc Duty (Q)." };

    // LMTD
    const { LMTD, Ft } = calculateLMTD(D.hot, D.cold, D.tube_passes);

    let trial_Dos = 0; // Shell ID

    for (let i = 0; i < MaxIter; i++) {
        // Step A: Area Req
        const A_req = Q / (U_assumed * LMTD); // A = Q / U*dTm

        // Step B: Number of Tubes
        // A = pi * do * L * Nt
        const tube_od = D.tube_od;
        const Nt_ideal = A_req / (Math.PI * tube_od * D.tube_length);
        const Nt = Math.ceil(Nt_ideal * 1.05); // +5% safety

        // Step C: Shell Diameter (Approx bundle count)
        // Nt = K1 * (Ds/do)^n1  ... (Phadke / Kappel approx)
        // Reversing for Ds: Ds = do * (Nt/K1)^(1/n1)
        // Simplified square pitch approx: Ds approx tube_pitch * sqrt(Nt * 1.3)
        const Ds_est = D.tube_pitch * Math.sqrt(Nt) * 1.1;

        // Find closest standard shell > Ds_est
        const Ds_std = TEMA_STANDARDS.shells.find(s => s >= Ds_est) || TEMA_STANDARDS.shells[TEMA_STANDARDS.shells.length - 1];

        // Recalc Tube Count actually fitting in Ds_std (simplified)
        // In real code, use K1, n1 constants
        const Nt_real = Math.floor(0.785 * Math.pow(Ds_std / D.tube_pitch, 2)); // Approx packing

        // Step D: Run Rating on this Geometry
        const rating = performKernRating(ShellFluid, TubeFluid, {
            ...D,
            shell_ID: Ds_std,
            total_tubes: Nt_real,
            baffle_spacing: Ds_std * 0.4 // Rule of thumb
        });

        const U_calc = rating.U_clean; // Or U_design
        const error = (U_calc - U_assumed) / U_assumed;

        logs.push(`Iter ${i + 1}: Assumed U=${U_assumed.toFixed(1)}, Shell=${(Ds_std * 1000).toFixed(0)}mm, Calc U=${U_calc.toFixed(1)}, Err=${(error * 100).toFixed(1)}%`);

        if (Math.abs(error) < 0.1) { // 10% Convergence
            converged = true;
            bestDesign = rating;
            bestDesign.converged = true;
            break;
        }

        // Update U for next guessed
        // Damping: New = 0.5*Old + 0.5*Calc
        U_assumed = 0.5 * U_assumed + 0.5 * U_calc;
    }

    if (!bestDesign) {
        logs.push("⚠️ Max iterations reached. Returning last estimation.");
        // Rerun one last time
        bestDesign = performKernRating(ShellFluid, TubeFluid, { ...D, shell_ID: 0.6, total_tubes: 200 }); // Fallback
        bestDesign.converged = false;
    }

    bestDesign.logs = logs;
    return bestDesign;
}


function runRatingCalculation(ShellFluid, TubeFluid, D, logs) {
    logs.push("ℹ️ Running Single Rating Mode...");
    const res = performKernRating(ShellFluid, TubeFluid, D);
    res.logs = logs;
    return res;
}

// --- 5. KERN METHOD IMPLEMENTATION ---
function performKernRating(ShellFluid, TubeFluid, Geom) {
    // Unpack Geometry
    const Ds = Geom.shell_ID;
    const do_t = Geom.tube_od;
    const di_t = Geom.tube_id;
    const Lt = Geom.tube_length;
    const Nt = Geom.total_tubes;
    const Np = Geom.tube_passes;
    const Pitch = Geom.tube_pitch;
    const B = Geom.baffle_spacing || Ds * 0.4; // Default 0.4D
    const Nb = Geom.baffles_n || Math.ceil(Lt / B) - 1;

    // --- TUBE SIDE ---
    // Area per pass
    const at = (Math.PI * di_t * di_t / 4) * (Nt / Np);
    const m_t = TubeFluid.m;
    const Gt = m_t / at; // Mass vel
    const Vt = Gt / TubeFluid.rho;

    const Re_t = (TubeFluid.rho * Vt * di_t) / TubeFluid.mu;
    const Pr_t = (TubeFluid.cp * TubeFluid.mu) / TubeFluid.k;

    // Dittus Boelter (Heating/Cooling distinction ignored for simple DB)
    // h_t = 0.023 * Re^0.8 * Pr^0.4 (Heating)
    const Nu_t = 0.023 * Math.pow(Re_t, 0.8) * Math.pow(Pr_t, 0.33);
    const h_t = (Nu_t * TubeFluid.k) / di_t;

    // Tube dP
    const f_t = 0.046 * Math.pow(Re_t, -0.2); // Friction factor approx
    const dP_t_frict = (4 * f_t * Lt * Np / di_t) * (0.5 * TubeFluid.rho * Vt * Vt);
    const dP_t_return = 4 * Np * (0.5 * TubeFluid.rho * Vt * Vt);
    const dP_t = dP_t_frict + dP_t_return;


    // --- SHELL SIDE (KERN) ---
    // 1. Equivalent Dia (De)
    let De;
    if (Geom.pitch_type === 'square') {
        De = (4 * (Math.pow(Pitch, 2) - (Math.PI / 4) * Math.pow(do_t, 2))) / (Math.PI * do_t);
    } else {
        De = (4 * (0.5 * 0.866 * Math.pow(Pitch, 2) - 0.5 * (Math.PI / 4) * Math.pow(do_t, 2))) / (0.5 * Math.PI * do_t);
    }

    // 2. Shell Area (As)
    const Clearance = Pitch - do_t;
    const As = (Ds * Clearance * B) / Pitch;
    const Gs = ShellFluid.m / As;
    const Vs = Gs / ShellFluid.rho;

    // 3. Re & Pr
    const Re_s = (Gs * De) / ShellFluid.mu;
    const Pr_s = (ShellFluid.cp * ShellFluid.mu) / ShellFluid.k;

    // 4. h_shell (McAdams)
    // Nu = 0.36 * Re^0.55 * Pr^0.33
    const Nu_s = 0.36 * Math.pow(Re_s, 0.55) * Math.pow(Pr_s, 0.33);
    const h_s = (Nu_s * ShellFluid.k) / De;

    // 5. dP Shell
    // f = exp(0.576 - 0.19 ln Re)
    const f_s = Math.exp(0.576 - 0.19 * Math.log(Re_s));
    const dP_s = (f_s * Math.pow(Gs, 2) * Ds * (Nb + 1)) / (2 * ShellFluid.rho * De);

    // --- OVERALL U ---
    const Rft = parseFloat(Geom.Rf_t || 0);
    const Rfs = parseFloat(Geom.Rf_s || 0);
    const Kw = 50; // Steel

    // Based on OD
    const Inv_U_clean = (1 / h_s) + (do_t / di_t) * (1 / h_t) + (do_t * Math.log(do_t / di_t) / (2 * Kw));
    const Inv_U_dirty = Inv_U_clean + Rfs + (do_t / di_t) * Rft;

    const U_clean = 1 / Inv_U_clean;
    const U_dirty = 1 / Inv_U_dirty;

    // Duty & Area
    const Q = calculateDuty(ShellFluid, TubeFluid);
    const { LMTD } = calculateLMTD(ShellFluid, TubeFluid, Np); // Using Fluid dicts which have temps
    const A_req = Q / (U_dirty * LMTD);
    const A_prov = Math.PI * do_t * Lt * Nt;
    const Overdesign = ((A_prov - A_req) / A_req) * 100;

    return {
        U_clean, U_dirty,
        h_s, h_t,
        dP_s, dP_t,
        Re_s, Re_t,
        Vt, Vs,
        Area_Required: A_req, Area_Provided: A_prov, Overdesign_Pct: Overdesign,
        LMTD, Q,
        Geometry: { Ds, Nt, B, Lt, do_t }
    };
}

// --- UTILS ---
function calculateDuty(Hot, Cold) {
    // Try Hot
    if (Hot.m && Hot.Tin && Hot.Tout) return Hot.m * Hot.cp * (Hot.Tin - Hot.Tout);
    if (Cold.m && Cold.Tin && Cold.Tout) return Cold.m * Cold.cp * (Cold.Tout - Cold.Tin);
    // Assume Q is passed in D explicitly if needed, else estimated
    return 100000; // Placeholder 100kW
}

function calculateLMTD(Hot, Cold, passes) {
    const dt1 = Hot.Tin - Cold.Tout;
    const dt2 = Hot.Tout - Cold.Tin;
    const lmtd = (dt1 - dt2) / Math.log(dt1 / dt2);
    // Ft calc for 1-2
    // R = (Thin - Thout)/(Tcout - Tcin)
    // S = (Tcout - Tcin)/(Thin - Tcin)
    // Ft approx
    return { LMTD: lmtd * 0.9, Ft: 0.9 };
}

// Expose to window for UI
window.calculateSTHX_Pro = calculateSTHX;
window.FLUID_DB = FLUID_DB;
