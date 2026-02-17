
// Fluid Property Database (at 25°C / standard conditions for simplification)
const FLUID_PROPERTIES = {
    "water": { rho: 997, mu: 0.00089, cp: 4.18, k: 0.607 },
    "air": { rho: 1.18, mu: 0.000018, cp: 1.005, k: 0.026 },
    "engine_oil": { rho: 884, mu: 0.486, cp: 1.91, k: 0.145 },
    "kerosene": { rho: 820, mu: 0.00164, cp: 2.0, k: 0.12 },
    "benzene": { rho: 876, mu: 0.0006, cp: 1.74, k: 0.14 },
    "ethanol": { rho: 789, mu: 0.0012, cp: 2.44, k: 0.17 },
    "acetone": { rho: 784, mu: 0.0003, cp: 2.15, k: 0.16 },
    "user_defined": { rho: 0, mu: 0, cp: 0, k: 0 }
};

// Standard Schedule 40 Steel Pipes (for Tubes)
const STANDARD_TUBES = [
    { name: "19 mm (3/4 in)", od: 0.019, id: 0.016 }, // Approx BWG 16
    { name: "25 mm (1 in)", od: 0.025, id: 0.021 },   // Approx BWG 14
    { name: "32 mm (1.25 in)", od: 0.032, id: 0.028 },
    { name: "38 mm (1.5 in)", od: 0.038, id: 0.033 }
];

function calculateSTHX(data) {
    try {
        // --- 1. PARSE & VALIDATE INPUTS ---
        let m_h = parseFloat(data.m_h);
        const T_h_in = parseFloat(data.T_h_in);
        let T_h_out = parseFloat(data.T_h_out || -1);

        let m_c = parseFloat(data.m_c);
        const T_c_in = parseFloat(data.T_c_in);
        let T_c_out = parseFloat(data.T_c_out || -1);

        let Cp_h = parseFloat(data.Cp_h) * 1000; // kJ to J
        let rho_h = parseFloat(data.rho_h);
        let mu_h = parseFloat(data.mu_h);
        let k_h = parseFloat(data.k_h);
        let Rf_h = parseFloat(data.Rf_h || 0.0002);

        let Cp_c = parseFloat(data.Cp_c) * 1000;
        let rho_c = parseFloat(data.rho_c);
        let mu_c = parseFloat(data.mu_c);
        let k_c = parseFloat(data.k_c);
        let Rf_c = parseFloat(data.Rf_c || 0.0002);

        // Geometry Inputs
        const shell_ID = parseFloat(data.shell_ID); // Shell Inner Diameter (m)
        const tube_length = parseFloat(data.tube_length); // Tube Length (m)
        const tube_od = parseFloat(data.tube_od);
        const tube_id = parseFloat(data.tube_id);
        const tube_pitch = parseFloat(data.tube_pitch);
        const pitch_type = data.pitch_type; // 'square' or 'triangular'
        const baffles_n = parseFloat(data.baffles_n); // Number of baffles
        const baffle_spacing = parseFloat(data.baffle_spacing); // Baffle spacing (m)
        const tube_passes = parseFloat(data.tube_passes || 1);
        const total_tubes = parseFloat(data.total_tubes);

        // --- 2. ENERGY BALANCE ---
        if (isNaN(m_h) && isNaN(m_c)) return { error: "Provide at least one Mass Flow Rate." };

        let Q;
        if (isNaN(m_h)) {
            if (T_h_out === -1 || T_c_out === -1) return { error: "To find Mass Flow, ALL temps must be known." };
            Q = m_c * Cp_c * (T_c_out - T_c_in);
            m_h = Q / (Cp_h * (T_h_in - T_h_out));
        } else if (isNaN(m_c)) {
            if (T_h_out === -1 || T_c_out === -1) return { error: "To find Mass Flow, ALL temps must be known." };
            Q = m_h * Cp_h * (T_h_in - T_h_out);
            m_c = Q / (Cp_c * (T_c_out - T_c_in));
        } else {
            // Calculate unknown temps
            if (T_h_out === -1) {
                Q = m_c * Cp_c * (T_c_out - T_c_in);
                T_h_out = T_h_in - Q / (m_h * Cp_h);
            } else if (T_c_out === -1) {
                Q = m_h * Cp_h * (T_h_in - T_h_out);
                T_c_out = T_c_in + Q / (m_c * Cp_c);
            } else {
                Q = m_h * Cp_h * (T_h_in - T_h_out);
            }
        }

        // LMTD
        let dt1 = T_h_in - T_c_out;
        let dt2 = T_h_out - T_c_in;
        if (dt1 <= 0 || dt2 <= 0) return { error: "Temperature Cross or Invalid Temps." };
        const LMTD_counter = (dt1 - dt2) / Math.log(dt1 / dt2);

        // Ft Correction Factor (approx for 1-2 shell-tube)
        // R = (Th_in - Th_out) / (Tc_out - Tc_in)
        // P = (Tc_out - Tc_in) / (Th_in - Tc_in)
        // Simply use 0.9 for now as generic approximation for multipass
        const Ft = 0.9;
        const LMTD = LMTD_counter * Ft;


        // --- 3. FLUID ALLOCATION ---
        const allocation = data.fluid_allocation || "hot_shell";
        let ms, rhos, mus, ks, Cps, Rfs; // Shell Side
        let mt, rhot, mut, kt, Cpt, Rft; // Tube Side

        if (allocation === "hot_shell") {
            ms = m_h; rhos = rho_h; mus = mu_h; ks = k_h; Cps = Cp_h; Rfs = Rf_h;
            mt = m_c; rhot = rho_c; mut = mu_c; kt = k_c; Cpt = Cp_c; Rft = Rf_c;
        } else {
            ms = m_c; rhos = rho_c; mus = mu_c; ks = k_c; Cps = Cp_c; Rfs = Rf_c;
            mt = m_h; rhot = rho_h; mut = mu_h; kt = k_h; Cpt = Cp_h; Rft = Rf_h;
        }

        // --- 4. TUBE SIDE CALCULATION ---
        const Nt = total_tubes;
        const Np = tube_passes;
        const flow_area_tube = (Math.PI * tube_id * tube_id / 4) * (Nt / Np);
        const velocity_tube = mt / (rhot * flow_area_tube);
        const Re_t = (rhot * velocity_tube * tube_id) / mut;
        const Pr_t = (Cpt * mut) / kt;

        // Nu_t (Sieder Tate / Dittus Boelter)
        const Nu_t = 0.023 * Math.pow(Re_t, 0.8) * Math.pow(Pr_t, 0.33); // Simplified
        const h_t = Nu_t * kt / tube_id;

        // dP Tube
        const f_t = 0.316 * Math.pow(Re_t, -0.25);
        // Tube dP = Friction + Return Losses (4*V^2/2g * Np)
        const dP_tube_friction = (4 * f_t * (tube_length * Np) / tube_id) * (0.5 * rhot * velocity_tube * velocity_tube);
        const dP_tube_returns = 4 * Np * (0.5 * rhot * velocity_tube * velocity_tube); // Approx return head loss
        const dP_t = dP_tube_friction + dP_tube_returns;


        // --- 5. SHELL SIDE CALCULATION (KERN METHOD) ---
        // Clearance C' = Pitch - OD
        const clearance = tube_pitch - tube_od;
        // Bundle Crossflow Area As = (ID * C' * B) / Pitch
        const As = (shell_ID * clearance * baffle_spacing) / tube_pitch;

        const Gs = ms / As; // Shell Mass Velocity

        // Equivalent Diameter De
        let De;
        if (pitch_type === 'square') {
            De = (4 * (Math.pow(tube_pitch, 2) - (Math.PI * Math.pow(tube_od, 2) / 4))) / (Math.PI * tube_od);
        } else { // Triangular
            De = (4 * (0.5 * tube_pitch * 0.866 * tube_pitch - (0.5 * Math.PI * Math.pow(tube_od, 2) / 4))) / (0.5 * Math.PI * tube_od);
        }

        const Re_s = (Gs * De) / mus;
        const Pr_s = (Cps * mus) / ks;

        // Kern Correlations
        // h_s = 0.36 * (De * Gs / mu)^0.55 * Pr^0.33 * (mu/mu_w)^0.14 ... Simplified:
        // jH factor approx = 0.36 * Re^-0.45 ?? Using McAdams/Kern fit:
        // Nu = 0.36 * Re^0.55 * Pr^0.33
        const Nu_s = 0.36 * Math.pow(Re_s, 0.55) * Math.pow(Pr_s, 0.33);
        const h_s = Nu_s * ks / De;

        // dP Shell
        // f_s = 2 * b0 * Re^-0.15 ... Kern Friction Factor
        // Simplified: f = exp(0.576 - 0.19 ln Re)
        const f_s = Math.exp(0.576 - 0.19 * Math.log(Re_s));

        // dPs = (f * Gs^2 * Ds * (N+1)) / (2 * rho * De * (mu/mu_w)^0.14)
        const Nb = baffles_n + 1; // Number of crosses
        const dP_s = (f_s * Math.pow(Gs, 2) * shell_ID * Nb) / (2 * rhos * De);


        // --- 6. OVERALL COEFFICIENT ---
        // 1/U = 1/ho + Rfo + (do/di)(Rfi + 1/hi)
        const term_shell = 1 / h_s + Rfs;
        const term_tube = (tube_od / tube_id) * (1 / h_t + Rft);
        const U_clean = 1 / ((1 / h_s) + (tube_od / tube_id) * (1 / h_t));
        const U_design = 1 / (term_shell + term_tube);

        // --- 7. AREA ANALYSIS ---
        const A_prov = Math.PI * tube_od * tube_length * total_tubes;
        const A_req = Q / (U_design * LMTD);
        const overdesign = ((A_prov - A_req) / A_req) * 100;

        return {
            success: true,
            allocation: allocation,
            Q: Q,
            LMTD: LMTD,
            U_design: U_design,
            U_clean: U_clean,
            A_prov: A_prov,
            A_req: A_req,
            overdesign: overdesign,
            m_h: m_h, m_c: m_c,
            // Tube Data
            h_t: h_t, Re_t: Re_t, v_t: velocity_tube, dP_t: dP_t,
            // Shell Data
            h_s: h_s, Re_s: Re_s, v_s: Gs / rhos, dP_s: dP_s,
            // Temps
            T_h_out: T_h_out, T_c_out: T_c_out
        };

    } catch (e) {
        return { error: e.toString() };
    }
}
