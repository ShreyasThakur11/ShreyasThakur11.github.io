/**
 * Pressure Vessel Design Engine (ASME Section VIII Div. 1)
 * 
 * Features:
 * - Material Database (Allowable Stress values)
 * - UG-27 Cylindrical Shell Calculation
 * - UG-32 Head Calculations (Ellipsoidal, Torispherical, Hemispherical)
 * - Weight & Cost Estimation
 */

// 1. Material Database (Allowable Stress 'S' in psi)
// Source: ASME II-D (Simplified for educational purposes)
const MATERIALS = {
    "SA-516 Gr. 70": {
        name: "Carbon Steel (SA-516 Gr. 70)",
        density: 0.283, // lb/in³
        cost_factor: 1.0,
        S: {
            100: 20000, 200: 20000, 300: 20000, 400: 20000,
            500: 20000, 600: 19400, 700: 18100, 800: 14800
        }
    },
    "SA-516 Gr. 60": {
        name: "Carbon Steel (SA-516 Gr. 60)",
        density: 0.283,
        cost_factor: 0.9,
        S: {
            100: 17100, 200: 17100, 300: 17100, 400: 17100,
            500: 17100, 600: 16400, 700: 15800, 800: 13800
        }
    },
    "SA-240 Type 304": {
        name: "Stainless Steel (304)",
        density: 0.29,
        cost_factor: 3.5,
        S: {
            100: 20000, 200: 20000, 300: 18900, 400: 18300,
            500: 17500, 600: 16600, 700: 16100, 800: 15500
        }
    },
    "SA-240 Type 316": {
        name: "Stainless Steel (316)",
        density: 0.29,
        cost_factor: 4.5,
        S: {
            100: 20000, 200: 20000, 300: 20000, 400: 19300,
            500: 18000, 600: 17000, 700: 16300, 800: 15900
        }
    }
};

// 2. Helper Functions
function getAllowableStress(matName, tempF) {
    const mat = MATERIALS[matName];
    if (!mat) return 0;

    // Simple look-up logic (round up to nearest 100)
    let t_check = Math.ceil(tempF / 100) * 100;
    if (t_check < 100) t_check = 100;
    if (t_check > 800) return mat.S[800]; // Cap at 800F for this tool

    return mat.S[t_check];
}

class DesignEngine {
    constructor() {
        this.results = {};
    }

    calculate(inputs) {
        const { P, T, ID, L, Mat, E, CA, HeadType } = inputs;
        const S = getAllowableStress(Mat, T);
        const density = MATERIALS[Mat].density;

        if (S === 0) return { error: "Invalid Material or Temperature" };

        const R = (ID / 2) + CA; // Corroded Radius for calc (Inner Radius + CA)
        // Note: ASME formulas usually use inner radius in corroded condition or solve for t then add CA.
        // Standard practice: t_req = Formula(P, R_corroded, S, E) + CA

        // 1. Shell Design (UG-27)
        // t = (P * R) / (S*E - 0.6*P)
        let t_shell_calc = (P * (ID / 2)) / (S * E - 0.6 * P);
        let t_shell_req = t_shell_calc + CA;

        // MAWP Shell (Inverse)
        // P = (S * E * t) / (R + 0.6 * t)  (where t is corroded thickness, so t_nominal - CA)
        // We will calculate MAWP based on a nominal thickness later.

        // 2. Head Design (UG-32)
        let t_head_calc = 0;
        let head_desc = "";

        if (HeadType === "2:1 Ellipsoidal") {
            // t = (P * D) / (2*S*E - 0.2*P)
            // D is inside diameter
            t_head_calc = (P * ID) / (2 * S * E - 0.2 * P);
            head_desc = "2:1 Ellipsoidal";
        } else if (HeadType === "Hemispherical") {
            // t = (P * R) / (2*S*E - 0.2*P)
            t_head_calc = (P * (ID / 2)) / (2 * S * E - 0.2 * P);
            head_desc = "Hemispherical";
        } else if (HeadType === "Torispherical") {
            // t = (0.885 * P * ID) / (S*E - 0.1*P)  (Approximation for L=ID, r=0.06ID)
            t_head_calc = (0.885 * P * ID) / (S * E - 0.1 * P);
            head_desc = "Torispherical (F&D)";
        }

        let t_head_req = t_head_calc + CA;

        // 3. Commercial Selection (Round up to nearest 1/16th or 1mm)
        // Function to round to nearest 1/16 inch
        const roundTo16th = (val) => Math.ceil(val * 16) / 16;

        let t_shell_nom = roundTo16th(Math.max(t_shell_req, 0.25)); // Min 0.25 in
        let t_head_nom = roundTo16th(Math.max(t_head_req, 0.25));

        // 4. Weight Estimation
        // Shell Volume (approx cylinder) = pi * D_mean * t * L
        let D_mean_shell = ID + t_shell_nom;
        let vol_shell = Math.PI * D_mean_shell * t_shell_nom * L;

        // Head Volume (approx 2 * projected area * t) - Very rough
        // Better: Surface area * t
        // Surface Area 2:1 Ellip approx 1.084 * D^2
        // Surface Area Hemi = 2 * pi * R^2 = 0.5 * pi * D^2
        let area_head = 0;
        if (HeadType === "Hemispherical") area_head = 0.5 * Math.PI * Math.pow(ID + t_head_nom, 2);
        else area_head = 1.084 * Math.pow(ID + t_head_nom, 2); // approx for ellip/tori

        let vol_heads = 2 * area_head * t_head_nom; // 2 heads

        let weight_lbs = (vol_shell + vol_heads) * density;

        // Add 10% for Nozzles/Flanges
        let total_weight = weight_lbs * 1.1;

        // 5. Cost Estimation
        let cost = total_weight * MATERIALS[Mat].cost_factor * 3.5; // $3.5/lb base rate approx

        return {
            t_shell_req: t_shell_req,
            t_head_req: t_head_req,
            t_shell_nom: t_shell_nom,
            t_head_nom: t_head_nom,
            weight: total_weight,
            cost: cost,
            S_val: S,
            status: "Success"
        };
    }
}
