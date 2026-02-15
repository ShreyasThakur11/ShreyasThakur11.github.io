
function calculateDPHX(data) {
    try {
        // Extract inputs
        let m_h = parseFloat(data.m_h);
        let Cp_h = parseFloat(data.Cp_h);
        const T_h_in = parseFloat(data.T_h_in);
        const rho_h = parseFloat(data.rho_h);
        const mu_h = parseFloat(data.mu_h);
        const k_h = parseFloat(data.k_h);

        let m_c = parseFloat(data.m_c);
        let Cp_c = parseFloat(data.Cp_c);
        const T_c_in = parseFloat(data.T_c_in);
        const rho_c = parseFloat(data.rho_c);
        const mu_c = parseFloat(data.mu_c);
        const k_c = parseFloat(data.k_c);

        let T_h_out = parseFloat(data.T_h_out || -1);
        let T_c_out = parseFloat(data.T_c_out || -1);

        const flow_type = parseInt(data.flow_type || 1); // 1: Counter, 2: Co-current
        const U_assumed = parseFloat(data.U_assumed);

        // Pipe selection
        let pipe_name, d_o, d_i;
        const pipe_choice = parseInt(data.pipe_choice || 1);

        if (pipe_choice === 1) {
            const pipe_size_idx = parseInt(data.pipe_size_idx || 1);
            const standard_pipes_list = [
                { name: "19 mm", do: 0.019 },
                { name: "25 mm", do: 0.025 },
                { name: "32 mm", do: 0.032 },
                { name: "38 mm", do: 0.038 }
            ];

            if (pipe_size_idx >= 1 && pipe_size_idx <= standard_pipes_list.length) {
                const pipe = standard_pipes_list[pipe_size_idx - 1];
                pipe_name = pipe.name;
                d_o = pipe.do;
            } else {
                return { error: "Invalid pipe size selected" };
            }
        } else {
            d_o = parseFloat(data.d_o_custom);
            pipe_name = "User defined";
        }

        // Inner diameter selection
        const id_choice = parseInt(data.id_choice || 1);
        if (id_choice === 1) {
            const pipe_database = {
                0.019: 0.016,
                0.025: 0.021,
                0.032: 0.027,
                0.038: 0.033
            };
            if (pipe_database[d_o]) {
                d_i = pipe_database[d_o];
            } else {
                d_i = parseFloat(data.d_i_custom || (d_o * 0.85));
            }
        } else {
            d_i = parseFloat(data.d_i_custom);
        }

        let D_o = parseFloat(data.D_o);

        // Fouling factors
        let Rf_h, Rf_c;
        const foul_choice = parseInt(data.foul_choice || 2);
        if (foul_choice === 1) {
            Rf_h = parseFloat(data.Rf_h);
            Rf_c = parseFloat(data.Rf_c);
        } else if (foul_choice === 2) {
            Rf_h = 0.0002;
            Rf_c = 0.0002;
        } else {
            Rf_h = 0.0;
            Rf_c = 0.0;
        }

        // Pressure drop
        let allowable_dp_inner = data.allowable_dp_inner ? parseFloat(data.allowable_dp_inner) : null;
        let allowable_dp_ann = data.allowable_dp_ann ? parseFloat(data.allowable_dp_ann) : null;

        // --- Logic Start ---

        // Error checking for missing inputs
        if (isNaN(m_h) && isNaN(m_c)) {
            return { error: "At least one mass flow rate must be provided." };
        }

        // Convert Cp from kJ to J
        Cp_h *= 1000;
        Cp_c *= 1000;

        // Smart Calculation of Unknowns
        let Q;

        // CASE 1: Solve for Unknown Mass Flow Rate
        if (isNaN(m_h) || isNaN(m_c)) {
            // To calculate a mass flow, we need ALL 4 temperatures
            if (T_h_out === -1 || T_c_out === -1) {
                return { error: "To calculate an unknown mass flow rate, ALL inlet and outlet temperatures must be provided." };
            }

            if (isNaN(m_h)) {
                // Calculate Q from Cold side
                Q = m_c * Cp_c * (T_c_out - T_c_in);
                // Calculate m_h
                // Q = m_h * Cp_h * (T_h_in - T_h_out)
                m_h = Q / (Cp_h * (T_h_in - T_h_out));
            } else { // m_c is NaN
                // Calculate Q from Hot side
                Q = m_h * Cp_h * (T_h_in - T_h_out);
                // Calculate m_c
                // Q = m_c * Cp_c * (T_c_out - T_c_in)
                m_c = Q / (Cp_c * (T_c_out - T_c_in));
            }

        } else {
            // CASE 2: Both Mass Flows Known (Standard Case)
            // Heat duty calculation
            if (T_h_out === -1) {
                Q = m_c * Cp_c * (T_c_out - T_c_in);
                T_h_out = T_h_in - Q / (m_h * Cp_h);
            } else if (T_c_out === -1) {
                Q = m_h * Cp_h * (T_h_in - T_h_out);
                T_c_out = T_c_in + Q / (m_c * Cp_c);
            } else {
                const Qh = m_h * Cp_h * (T_h_in - T_h_out);
                const Qc = m_c * Cp_c * (T_c_out - T_c_in);
                if (Math.abs(Qh - Qc) > 0.05 * Qh) {
                    return { error: "Energy balance not satisfied (>5% difference). Check input temperatures or flow rates." };
                }
                Q = Qh;
            }
        }

        // Temperature feasibility check
        if (flow_type === 1) { // Counter-current
            if (T_h_in <= T_c_out || T_h_out <= T_c_in) {
                return { error: "Temperature cross detected in counter-current flow." };
            }
        } else if (flow_type === 2) { // Co-current
            if (T_h_in <= T_c_in || T_h_out <= T_c_out) {
                return { error: "Temperature cross detected in co-current flow." };
            }
        } else {
            return { error: "Invalid flow type selected." };
        }

        // LMTD calculation
        let deltaT1, deltaT2;
        if (flow_type === 1) {
            deltaT1 = T_h_in - T_c_out;
            deltaT2 = T_h_out - T_c_in;
        } else {
            deltaT1 = T_h_in - T_c_in;
            deltaT2 = T_h_out - T_c_out;
        }

        let LMTD;
        if (deltaT1 <= 0 || deltaT2 <= 0 || deltaT1 === deltaT2) {
            if (Math.abs(deltaT1 - deltaT2) < 1e-5) {
                LMTD = deltaT1;
            } else {
                return { error: "Invalid temperature difference for LMTD calculation." };
            }
        } else {
            LMTD = (deltaT1 - deltaT2) / Math.log(deltaT1 / deltaT2);
        }

        // Heat transfer area
        const A_required = Q / (U_assumed * LMTD);

        // Diameter sanity check
        if (d_i >= d_o) {
            return { error: "Inner diameter cannot be greater than or equal to outer diameter." };
        }

        // Length calculation
        const L_required = A_required / (Math.PI * d_o);

        // Iteration variables
        const U = U_assumed;
        let U_valid = false;
        const max_iterations = 10;
        let iteration = 1;

        let h_inner = 0, h_annulus = 0, U_calculated = 0;
        let v_inner = 0, v_annulus = 0;
        let deltaP_inner = 0, deltaP_ann = 0;

        const logs = [];

        while (!U_valid && iteration <= max_iterations) {
            // Flow areas
            const A_inner_flow = Math.PI * Math.pow(d_i, 2) / 4;
            const A_annulus_flow = Math.PI * (Math.pow(D_o, 2) - Math.pow(d_o, 2)) / 4;

            // Velocities
            v_inner = m_h / (A_inner_flow * rho_h);
            v_annulus = m_c / (A_annulus_flow * rho_c);

            // Reynolds numbers
            const Re_inner = (rho_h * v_inner * d_i) / mu_h;
            const Re_annulus = (rho_c * v_annulus * (D_o - d_o)) / mu_c;

            // Prandtl numbers
            const Pr_h = (Cp_h * mu_h) / k_h;
            const Pr_c = (Cp_c * mu_c) / k_c;

            // Nusselt numbers (Dittus-Boelter / Sieder-Tate simplified)
            const Nu_inner = 0.023 * Math.pow(Re_inner, 0.8) * Math.pow(Pr_h, 0.4);
            const Nu_annulus = 0.023 * Math.pow(Re_annulus, 0.8) * Math.pow(Pr_c, 0.4);

            h_inner = Nu_inner * k_h / d_i;
            h_annulus = Nu_annulus * k_c / (D_o - d_o);

            U_calculated = 1 / ((1 / h_inner) + Rf_h + Rf_c + (1 / h_annulus));

            const difference = Math.abs(U_calculated - U) / U;

            logs.push(`Iteration ${iteration}: Assumed U=${U.toFixed(1)}, Calculated U=${U_calculated.toFixed(1)}, Diff=${(difference * 100).toFixed(1)}%`);

            if (difference <= 0.2) {
                U_valid = true;
                break;
            } else {
                // Adjust dimensions to converge
                if (h_inner < h_annulus) {
                    if (v_inner < 0.6) d_i *= 0.90;
                    else if (v_inner > 2.0) d_i *= 1.10;
                } else {
                    if (v_annulus < 0.5) D_o *= 0.95;
                    else if (v_annulus > 1.5) D_o *= 1.05;
                }
            }
            iteration++;
        }

        // Pressure Drop Check
        let dp_valid = false;
        const max_dp_iterations = 5;
        let dp_iteration = 1;

        while (!dp_valid && dp_iteration <= max_dp_iterations) {
            const A_inner_flow = Math.PI * Math.pow(d_i, 2) / 4;
            const A_annulus_flow = Math.PI * (Math.pow(D_o, 2) - Math.pow(d_o, 2)) / 4;
            v_inner = m_h / (rho_h * A_inner_flow);
            v_annulus = m_c / (rho_c * A_annulus_flow);

            const Re_inner = (rho_h * v_inner * d_i) / mu_h;
            const Re_annulus = (rho_c * v_annulus * (D_o - d_o)) / mu_c;

            let f_inner, f_ann;
            if (Re_inner < 2300) f_inner = 64 / Re_inner;
            else f_inner = 0.3164 / Math.pow(Re_inner, 0.25);

            if (Re_annulus < 2300) f_ann = 64 / Re_annulus;
            else f_ann = 0.3164 / Math.pow(Re_annulus, 0.25);

            // Pressure drop formulas
            deltaP_inner = f_inner * (L_required / d_i) * 0.5 * rho_h * Math.pow(v_inner, 2);
            const Dh_ann = D_o - d_o;
            deltaP_ann = f_ann * (L_required / Dh_ann) * 0.5 * rho_c * Math.pow(v_annulus, 2);

            const inner_ok = (allowable_dp_inner === null || deltaP_inner <= allowable_dp_inner);
            const ann_ok = (allowable_dp_ann === null || deltaP_ann <= allowable_dp_ann);

            if (inner_ok && ann_ok) {
                dp_valid = true;
                break;
            } else {
                logs.push(`DP Iteration ${dp_iteration}: Inner dP=${deltaP_inner.toFixed(0)}/${allowable_dp_inner}, Annulus dP=${deltaP_ann.toFixed(0)}/${allowable_dp_ann}`);
                if (!inner_ok && (deltaP_inner > deltaP_ann || allowable_dp_ann === null)) {
                    d_i *= 1.05;
                } else {
                    D_o *= 1.05;
                }
                dp_iteration++;
            }
        }

        return {
            success: true,
            T_h_out: T_h_out,
            T_c_out: T_c_out,
            Q: Q,
            LMTD: LMTD,
            A_required: A_required,
            pipe_name: pipe_name,
            d_o: d_o,
            d_i: d_i,
            D_o: D_o,
            L_required: L_required,
            v_inner: v_inner,
            v_annulus: v_annulus,
            h_inner: h_inner,
            h_annulus: h_annulus,
            U_calculated: U_calculated,
            U_assumed: U,
            deltaP_inner: deltaP_inner,
            deltaP_annulus: deltaP_ann,
            m_h_calc: m_h,
            m_c_calc: m_c,
            logs: logs,
            U_valid: U_valid,
            dp_valid: dp_valid
        };

    } catch (e) {
        return { error: e.toString() };
    }
}
