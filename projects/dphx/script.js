
// Fluid Property Database (at 25°C / standard conditions for simplification)
// In a real app, these would be functions of temperature.
const FLUID_PROPERTIES = {
    "water": { rho: 997, mu: 0.00089, cp: 4.18, k: 0.607 },
    "air": { rho: 1.18, mu: 0.000018, cp: 1.005, k: 0.026 },
    "engine_oil": { rho: 884, mu: 0.486, cp: 1.91, k: 0.145 },
    "kerosene": { rho: 820, mu: 0.00164, cp: 2.0, k: 0.12 },
    "benzene": { rho: 876, mu: 0.0006, cp: 1.74, k: 0.14 },
    "ethanol": { rho: 789, mu: 0.0012, cp: 2.44, k: 0.17 },
    "acetone": { rho: 784, mu: 0.0003, cp: 2.15, k: 0.16 },
    "user_defined": { rho: 0, mu: 0, cp: 0, k: 0 } // Placeholder
};

// Standard Schedule 40 Steel Pipes
// OD is Outer Diameter, ID is Inner Diameter (Approx Sch 40)
const STANDARD_PIPES = [
    { name: "1/2 inch", od: 0.0213, id: 0.0158 },
    { name: "3/4 inch", od: 0.0267, id: 0.0209 },
    { name: "1 inch", od: 0.0334, id: 0.0266 },
    { name: "1.25 inch", od: 0.0422, id: 0.0351 },
    { name: "1.5 inch", od: 0.0483, id: 0.0409 },
    { name: "2 inch", od: 0.0603, id: 0.0525 },
    { name: "2.5 inch", od: 0.0730, id: 0.0627 },
    { name: "3 inch", od: 0.0889, id: 0.0779 },
    { name: "4 inch", od: 0.1143, id: 0.1023 },
    { name: "6 inch", od: 0.1683, id: 0.1541 }
];

function calculateDPHX(data) {
    try {
        // --- 1. PARSE INPUTS ---
        let m_h = parseFloat(data.m_h);
        const T_h_in = parseFloat(data.T_h_in);
        let T_h_out = parseFloat(data.T_h_out || -1);

        let m_c = parseFloat(data.m_c);
        const T_c_in = parseFloat(data.T_c_in);
        let T_c_out = parseFloat(data.T_c_out || -1);

        // Fluid Properties
        // Note: Cp inputs are expected in kJ/kg.K, converted to J/kg.K
        let Cp_h = parseFloat(data.Cp_h) * 1000;
        let rho_h = parseFloat(data.rho_h);
        let mu_h = parseFloat(data.mu_h);
        let k_h = parseFloat(data.k_h);

        let Cp_c = parseFloat(data.Cp_c) * 1000;
        let rho_c = parseFloat(data.rho_c);
        let mu_c = parseFloat(data.mu_c);
        let k_c = parseFloat(data.k_c);

        const flow_type = parseInt(data.flow_type || 1);
        const foul_h = parseFloat(data.Rf_h || 0.0002);
        const foul_c = parseFloat(data.Rf_c || 0.0002);

        // --- 2. ENERGY BALANCE & UNKNOWNS ---

        // Validation: At least mass flows or logic to find them
        if (isNaN(m_h) && isNaN(m_c)) return { error: "Provide at least one Mass Flow Rate." };

        let Q; // Heat Duty (Watts)

        // Case A: Missing Mass Flow (Perfect Tool Logic)
        if (isNaN(m_h) || isNaN(m_c)) {
            if (T_h_out === -1 || T_c_out === -1) {
                return { error: "To find Mass Flow, ALL 4 temperatures must be known." };
            }
            if (isNaN(m_h)) {
                Q = m_c * Cp_c * (T_c_out - T_c_in);
                m_h = Q / (Cp_h * (T_h_in - T_h_out));
            } else {
                Q = m_h * Cp_h * (T_h_in - T_h_out);
                m_c = Q / (Cp_c * (T_c_out - T_c_in));
            }
        }
        // Case B: Convert Temperatures (Standard)
        else {
            if (T_h_out === -1) {
                Q = m_c * Cp_c * (T_c_out - T_c_in);
                T_h_out = T_h_in - Q / (m_h * Cp_h);
            } else if (T_c_out === -1) {
                Q = m_h * Cp_h * (T_h_in - T_h_out);
                T_c_out = T_c_in + Q / (m_c * Cp_c);
            } else {
                const Qh = m_h * Cp_h * (T_h_in - T_h_out);
                const Qc = m_c * Cp_c * (T_c_out - T_c_in);
                if (Math.abs(Qh - Qc) > 0.05 * Qh) return { error: "Energy Balance Mismatch (>5%)" };
                Q = Qh;
            }
        }

        // Check Temp Cross
        if (flow_type === 1 && (T_h_out < T_c_in || T_h_in < T_c_out)) return { error: "Temp Cross in Counter-Current!" };

        // LMTD
        let dt1, dt2;
        if (flow_type === 1) { dt1 = T_h_in - T_c_out; dt2 = T_h_out - T_c_in; }
        else { dt1 = T_h_in - T_c_in; dt2 = T_h_out - T_c_out; }

        if (dt1 <= 0 || dt2 <= 0) return { error: "Invalid LMTD (Check Temps)" };
        const LMTD = (dt1 === dt2) ? dt1 : (dt1 - dt2) / Math.log(dt1 / dt2);


        // --- 3. PIPE OPTIMIZER ENGINE ---
        // Iterate through standard pipe pairs to find best fit
        // Criteria: 
        // 1. Inner Pipe velocity approx 1-3 m/s (Liq)
        // 2. Annulus velocity approx 0.5-2 m/s
        // 3. Pressure drop < Allowable (e.g. 70 kPa)

        const logs = [];
        let best_design = null;
        let min_cost_metric = Infinity; // Try to minimize Area while meeting constraints

        // Constraints
        const max_dp = parseFloat(data.allowable_dp_inner || 70000);

        for (let i = 0; i < STANDARD_PIPES.length - 1; i++) {
            const inner_pipe = STANDARD_PIPES[i];

            // Try larger pipes for annulus
            for (let j = i + 1; j < STANDARD_PIPES.length; j++) {
                const outer_pipe = STANDARD_PIPES[j];

                // Geometry
                const di = inner_pipe.id;
                const do_in = inner_pipe.od;
                const Di = outer_pipe.id;
                const Do_out = outer_pipe.od; // not used for flow calculation but for visuals

                // Clearance check (at least 5mm annulus gap)
                if ((Di - do_in) < 0.005) continue;

                // Area Calculation
                const A_inner = Math.PI * di * di / 4;
                const A_ann = Math.PI * (Di * Di - do_in * do_in) / 4;
                const De_ann = (Di * Di - do_in * do_in) / do_in; // Equivalent diameter for heat transfer

                // Velocities
                const v_inner = m_h / (rho_h * A_inner);
                const v_ann = m_c / (rho_c * A_ann);

                // REYNOLDS
                const Re_inner = (rho_h * v_inner * di) / mu_h;
                const Re_ann = (rho_c * v_ann * De_ann) / mu_c;

                // PRANDTL
                const Pr_h = (Cp_h * mu_h) / k_h;
                const Pr_c = (Cp_c * mu_c) / k_c;

                // NUSSELT (Sieder-Tate / Dittus Boelter)
                // Nu = 0.023 * Re^0.8 * Pr^0.3 (Cooling) or 0.4 (Heating) - Simplified to 0.33 for generic
                const Nu_inner = 0.023 * Math.pow(Re_inner, 0.8) * Math.pow(Pr_h, 0.33);
                const Nu_ann = 0.023 * Math.pow(Re_ann, 0.8) * Math.pow(Pr_c, 0.33);

                // HEAT TRANSFER COEFF (h)
                const hi = Nu_inner * k_h / di;
                const ho = Nu_ann * k_c / De_ann;

                // OVERALL U (Based on Outer Surface of Inner Pipe)
                // 1/U = Ao/Ai(1/hi) + Ao/Ai*Rfi + Rfo + 1/ho + Wall
                // Simplified: Neglect wall resistance, refer all to do_in surface
                const U = 1 / ((do_in / di) * (1 / hi) + (do_in / di) * foul_h + foul_c + (1 / ho));

                // AREA & LENGTH
                const A_req = Q / (U * LMTD);
                const L_req = A_req / (Math.PI * do_in);

                // PRESSURE CHECKS
                // f = 0.316 * Re^-0.25 (Blasius)
                const f_in = 0.316 * Math.pow(Re_inner, -0.25);
                const f_ann = 0.316 * Math.pow(Re_ann, -0.25);

                // dP = f * (L/D) * 0.5 * rho * v^2
                const dP_in = f_in * (L_req / di) * 0.5 * rho_h * v_inner * v_inner;
                const Dh_ann = Di - do_in; // Hydraulic diameter for pressure drop
                const dP_ann = f_ann * (L_req / Dh_ann) * 0.5 * rho_c * v_ann * v_ann;

                // VALIDATION
                const velocity_ok = (v_inner < 4.0 && v_ann < 4.0); // Generic liquid limit
                const dp_ok = (dP_in < max_dp && dP_ann < max_dp);

                // LOG
                logs.push(`Trial [${inner_pipe.name} x ${outer_pipe.name}]: U=${U.toFixed(1)}, L=${L_req.toFixed(1)}m, dP_in=${(dP_in / 1000).toFixed(1)}kPa`);

                if (velocity_ok && dp_ok) {
                    // Score: Smaller Area is better (Cheaper)
                    if (A_req < min_cost_metric) {
                        min_cost_metric = A_req;
                        best_design = {
                            inner_pipe: inner_pipe,
                            outer_pipe: outer_pipe,
                            U: U,
                            A_req: A_req,
                            L_req: L_req,
                            dP_in: dP_in,
                            dP_ann: dP_ann,
                            Re_in: Re_inner,
                            Re_ann: Re_ann,
                            h_in: hi,
                            h_ann: ho,
                            v_in: v_inner,
                            v_ann: v_ann,
                            Q: Q,
                            LMTD: LMTD,
                            m_h: m_h,
                            m_c: m_c,
                            T_h_out: T_h_out,
                            T_c_out: T_c_out
                        };
                    }
                }
            }
        }

        if (!best_design) {
            return {
                error: "No standard pipe combination met the constraints (dP or Velocity). Try relaxing dP limits or increasing Flow Rate.",
                logs: logs
            };
        }

        // Return Best Design
        return {
            success: true,
            opt: best_design,
            logs: logs
        };

    } catch (e) {
        return { error: e.toString() };
    }
}
