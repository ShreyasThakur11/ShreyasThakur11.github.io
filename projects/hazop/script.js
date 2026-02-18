/**
 * AI Safety & HAZOP Assistant - Logic Engine
 * 
 * 1. Node Extraction: Parse text to find equipment.
 * 2. Param Mapping: Assign Flow/Temp/Pressure to nodes.
 * 3. Deviation Generator: Apply Guidewords.
 * 4. Knowledge Base: Cause -> Consequence -> Safeguard lookup.
 * 5. Risk Ranking: Severity * Likelihood.
 */

// --- 1. KNOWLEDGE BASE ---
const HAZOP_DB = {
    // Equipment Definitions
    NODES: {
        "reactor": { params: ["Temperature", "Pressure", "Flow", "Level", "Agitation"] },
        "cstr": { type: "reactor", params: ["Temperature", "Pressure", "Flow", "Level", "Agitation"] },
        "column": { params: ["Pressure", "Temperature", "Level", "Flow (Reflux)"] },
        "distillation": { type: "column", params: ["Pressure", "Temperature", "Level", "Flow (Reflux)"] },
        "pump": { params: ["Flow", "Pressure"] },
        "exchanger": { params: ["Flow (Hot)", "Flow (Cold)", "Temperature"] },
        "tank": { params: ["Level", "Pressure"] },
        "compressor": { params: ["Pressure", "Flow", "Temperature"] }
    },

    // Deviation Logic
    RULES: [
        // FLOW
        {
            param: "Flow", guide: "No", deviations: ["No Flow"],
            causes: ["Pump failure", "Blockage in line", "Control valve closed", "Power failure"],
            consequences: ["Loss of production", "Pump cavitation", "Overheating in downstream unit"],
            safeguards: ["Flow Alarm Low (FAL)", "Pump minimum flow recycle", "Running status indication"]
        },

        {
            param: "Flow", guide: "More", deviations: ["High Flow"],
            causes: ["Control valve stuck open", "Pump overspeed", "Bypass valve open"],
            consequences: ["Overflow in downstream vessel", "Reduced residence time", "Off-spec product"],
            safeguards: ["Flow Control Loop", "High Level Alarm downstream"]
        },

        {
            param: "Flow", guide: "Less", deviations: ["Low Flow"],
            causes: ["Filter clogging", "Valve partially closed", "Leakage"],
            consequences: ["Reduced cooling/heating", "Product degradation", "Cavitation"],
            safeguards: ["low flow alarm", "Regular maintenance"]
        },

        {
            param: "Flow", guide: "Reverse", deviations: ["Reverse Flow"],
            causes: ["Pump trip", "Higher pressure downstream"],
            consequences: ["Contamination of upstream", "Damage to pump", "Exothermic reaction in feed tank"],
            safeguards: ["Check Valve (NRV)", "Reverse rotation lock"]
        },

        // TEMPERATURE
        {
            param: "Temperature", guide: "More", deviations: ["High Temperature"],
            causes: ["Cooling water failure", "Fire", "Heat exchanger fouling", "Runaway reaction"],
            consequences: ["Runaway reaction", "Explosion", "Material degradation", "Overpressure"],
            safeguards: ["Temp Alarm High (TAH)", "Emergency Shutdown (ESD)", "PSV", "Deluge system"]
        },

        {
            param: "Temperature", guide: "Less", deviations: ["Low Temperature"],
            causes: ["Loss of heating", "Weather extreme", "Control failure"],
            consequences: ["Freezing/Solidification", "Viscosity increase", "Incomplete reaction"],
            safeguards: ["Temp Alarm Low (TAL)", "Steam tracing", "Insulation"]
        },

        // PRESSURE
        {
            param: "Pressure", guide: "More", deviations: ["High Pressure"],
            causes: ["Outlet blockage", "Thermal expansion", "Runaway reaction", "Regulator failure"],
            consequences: ["Vessel rupture", "Leakage", "Explosion"],
            safeguards: ["Pressure Safety Valve (PSV)", "Pressure Alarm High (PAH)", "Rupture Disk"]
        },

        {
            param: "Pressure", guide: "Less", deviations: ["Low Pressure"],
            causes: ["Piping leak", "Compressor failure", "Vacuum generation"],
            consequences: ["Vessel collapse (vacuum)", "Air ingress (flammable mix)"],
            safeguards: ["Vacuum breaker", "Nitrogen padding", "Pressure Alarm Low (PAL)"]
        },

        // LEVEL
        {
            param: "Level", guide: "More", deviations: ["High Level"],
            causes: ["Outlet valve closed", "Inlet flow too high", "Level controller failure"],
            consequences: ["Overflow", "Liquid carryover to gas line", "Vessel overpressure"],
            safeguards: ["Level Alarm High (LAH)", "High Level Trip (LAHH)"]
        },

        {
            param: "Level", guide: "Less", deviations: ["Low Level"],
            causes: ["Outlet valve stuck open", "Leak", "Inlet stops"],
            consequences: ["Gas blow-by to liquid line", "Pump run dry", "Heater tube exposure"],
            safeguards: ["Level Alarm Low (LAL)", "Low Level Trip (LALL)"]
        },

        // AGITATION
        {
            param: "Agitation", guide: "No", deviations: ["Loss of Agitation"],
            causes: ["Motor trip", "Mechanical failure (shaft break)", "Power loss"],
            consequences: ["Hot spots", "Runaway reaction", "Product settling/solidification"],
            safeguards: ["Agitator current monitor", "Low speed alarm", "Emergency quench"]
        }
    ]
};

// --- 2. HAZOP ENGINE ---

class HAZOPEngine {
    constructor() { }

    // Find nodes in text
    extractNodes(text) {
        const found = [];
        const lower = text.toLowerCase();

        Object.keys(HAZOP_DB.NODES).forEach(key => {
            if (lower.includes(key)) {
                // If specific type exists (e.g. CSTR -> Reactor), use that
                const def = HAZOP_DB.NODES[key];
                const type = def.type || key;

                // Add unique nodes
                if (!found.some(n => n.type === type)) {
                    found.push({ name: key.toUpperCase(), type: type, params: HAZOP_DB.NODES[type].params });
                }
            }
        });

        // Fallback: If nothing found, assume "Generic Vessel"
        if (found.length === 0) {
            found.push({ name: "PROCESS NODE", type: "reactor", params: ["Pressure", "Temperature", "Flow"] });
        }

        return found;
    }

    // Generate worksheet
    generateStudy(text) {
        const nodes = this.extractNodes(text);
        const worksheet = [];

        nodes.forEach(node => {
            node.params.forEach(param => {
                // Find matching rules
                const pertinentRules = HAZOP_DB.RULES.filter(r => {
                    // Heuristic mapping: "Flow (Cold)" matches "Flow"
                    return param.includes(r.param);
                });

                pertinentRules.forEach(rule => {
                    // Specific Logic for Exothermic/Reactor
                    let severity = "Medium";
                    let likelihood = "Low";
                    let risk = "Low";

                    // Simple AI Risk Adjustment
                    if ((node.type === 'reactor' || node.type === 'cstr') && rule.consequences.some(c => c.includes("Runaway") || c.includes("Explosion"))) {
                        severity = "High";
                    }
                    if (rule.deviations[0].includes("High Pressure") || rule.deviations[0].includes("High Temperature")) {
                        if (node.type === 'reactor') severity = "Critical";
                    }

                    // Calculate Risk
                    risk = this.calculateRisk(severity, likelihood);

                    worksheet.push({
                        node: node.name,
                        param: param,
                        deviation: rule.deviations[0],
                        causes: this.pickRandom(rule.causes, 2),
                        consequences: rule.consequences.join(", "),
                        safeguards: rule.safeguards.join(", "),
                        severity: severity,
                        risk: risk
                    });
                });
            });
        });

        return worksheet;
    }

    // Helper to simulate variability
    pickRandom(arr, n) {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n).join("; ");
    }

    calculateRisk(severity, likelihood) {
        if (severity === "Critical") return "High";
        if (severity === "High") return "High";
        if (severity === "Medium") return "Medium";
        return "Low";
    }
}

// Expose
window.HAZOPEngine = HAZOPEngine;
