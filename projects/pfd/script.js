/**
 * Smart PFD Generator - AI Logic
 * 
 * Architecture:
 * 1. Process Database (Templates for known processes)
 * 2. Unit Ops Library (Mapping keywords to equipment)
 * 3. NLP Algo (Matching input -> Template or Chain-of-Thought)
 * 4. PFD Builder (Generating Mermaid Code)
 */

// --- 1. KNOWLEDGE BASE ---

const UNIT_OPS = {
    // Reaction
    "reformer": { type: "Reformer", shape: "stadium", icon: "🔥", style: "fill:#fca5a5,stroke:#ef4444" },
    "reactor": { type: "Reactor", shape: "stadium", icon: "⚗️", style: "fill:#fca5a5,stroke:#ef4444" },
    "furnace": { type: "Furnace", shape: "stadium", icon: "🔥", style: "fill:#fca5a5,stroke:#ef4444" },
    "burner": { type: "Burner", shape: "stadium", icon: "🔥", style: "fill:#fca5a5,stroke:#ef4444" },
    "converter": { type: "Converter", shape: "stadium", icon: "🔄", style: "fill:#fca5a5,stroke:#ef4444" },
    // Separation
    "column": { type: "Distillation Column", shape: "rect", icon: "🗼", style: "fill:#93c5fd,stroke:#3b82f6" },
    "absorber": { type: "Absorber", shape: "rect", icon: "💧", style: "fill:#93c5fd,stroke:#3b82f6" },
    "scrubber": { type: "Scrubber", shape: "rect", icon: "🚿", style: "fill:#93c5fd,stroke:#3b82f6" },
    "separator": { type: "Separator", shape: "rect", icon: "🌫️", style: "fill:#93c5fd,stroke:#3b82f6" },
    "stripper": { type: "Stripper", shape: "rect", icon: "♨️", style: "fill:#93c5fd,stroke:#3b82f6" },
    // Heat Transfer
    "exchanger": { type: "Heat Exchanger", shape: "circle", icon: "❄️", style: "fill:#fde68a,stroke:#f59e0b" },
    "cooler": { type: "Cooler", shape: "circle", icon: "❄️", style: "fill:#fde68a,stroke:#f59e0b" },
    "heater": { type: "Heater", shape: "circle", icon: "🔥", style: "fill:#fde68a,stroke:#f59e0b" },
    "condenser": { type: "Condenser", shape: "circle", icon: "💧", style: "fill:#fde68a,stroke:#f59e0b" },
    "boiler": { type: "Reboiler", shape: "circle", icon: "♨️", style: "fill:#fde68a,stroke:#f59e0b" },
    // Mechanical
    "compressor": { type: "Compressor", shape: "trapezoid", icon: "💨", style: "fill:#d1d5db,stroke:#4b5563" },
    "pump": { type: "Pump", shape: "circle", icon: "⛽", style: "fill:#d1d5db,stroke:#4b5563" }
};

const PROCESS_TEMPLATES = {
    "ammonia": {
        name: "Ammonia Production (Haber-Bosch)",
        blocks: [
            { id: "feed", label: "Natural Gas Feed" },
            { id: "desulf", label: "Desulfurizer", type: "reactor" },
            { id: "reformer", label: "Steam Reformer", type: "reformer" },
            { id: "shift", label: "Water Gas Shift", type: "converter" },
            { id: "co2_rem", label: "CO2 Removal", type: "absorber" },
            { id: "meth", label: "Methanator", type: "reactor" },
            { id: "comp", label: "SynGas Compressor", type: "compressor" },
            { id: "syn_loop", label: "Ammonia Converter", type: "reactor" },
            { id: "sep", label: "Flash Separator", type: "separator" },
            { id: "prod", label: "Liquid Ammonia" }
        ],
        streams: [
            { from: "feed", to: "desulf", label: "NG" },
            { from: "desulf", to: "reformer", label: "Sweet NG" },
            { from: "reformer", to: "shift", label: "SynGas (CO+H2)" },
            { from: "shift", to: "co2_rem", label: "Shifted Gas" },
            { from: "co2_rem", to: "meth", label: "CO2 Lean Gas" },
            { from: "meth", to: "comp", label: "Pure SynGas" },
            { from: "comp", to: "syn_loop", label: "HP Gas" },
            { from: "syn_loop", to: "sep", label: "NH3 + Gas" },
            { from: "sep", to: "prod", label: "Liquid NH3" },
            { from: "sep", to: "comp", label: "Recycle Gas", style: "stroke-dasharray: 5 5" }
        ]
    },
    "methanol": {
        name: "Methanol Synthesis",
        blocks: [
            { id: "feed", label: "Natural Gas" },
            { id: "reformer", label: "Steam Reformer", type: "reformer" },
            { id: "comp", label: "Make-up Compressor", type: "compressor" },
            { id: "reactor", label: "Methanol Reactor", type: "reactor" },
            { id: "sep", label: "Flash Separator", type: "separator" },
            { id: "column", label: "Distillation Column", type: "column" },
            { id: "prod", label: "Methanol Product" }
        ],
        streams: [
            { from: "feed", to: "reformer", label: "NG + Steam" },
            { from: "reformer", to: "comp", label: "SynGas" },
            { from: "comp", to: "reactor", label: "HP Gas" },
            { from: "reactor", to: "sep", label: "Raw MeOH" },
            { from: "sep", to: "column", label: "Liquid MeOH" },
            { from: "column", to: "prod", label: "Grade AA MeOH" },
            { from: "sep", to: "comp", label: "Unreacted Gas", style: "stroke-dasharray: 5 5" }
        ]
    },
    "crude": {
        name: "Crude Oil Distillation Unit (CDU)",
        blocks: [
            { id: "feed", label: "Crude Oil" },
            { id: "desalter", label: "Desalter", type: "separator" },
            { id: "train", label: "Preheat Train", type: "exchanger" },
            { id: "furnace", label: "Fired Heater", type: "furnace" },
            { id: "column", label: "Atmospheric Column", type: "column" },
            { id: "cond", label: "Overhead Condenser", type: "condenser" },
            { id: "acc", label: "Reflux Drum", type: "separator" },
            { id: "offgas", label: "Off Gas" },
            { id: "naphtha", label: "Naphtha" },
            { id: "kero", label: "Kerosene" },
            { id: "diesel", label: "Diesel" },
            { id: "resid", label: "Atmos Residue" }
        ],
        streams: [
            { from: "feed", to: "desalter", label: "Raw Crude" },
            { from: "desalter", to: "train", label: "Desalted Crude" },
            { from: "train", to: "furnace", label: "Warm Crude" },
            { from: "furnace", to: "column", label: "Hot Crude" },
            { from: "column", to: "cond", label: "Vapor" },
            { from: "cond", to: "acc", label: "Liquid + Gas" },
            { from: "acc", to: "offgas", label: "Gas" },
            { from: "acc", to: "naphtha", label: "Naphtha Product" },
            { from: "acc", to: "column", label: "Reflux" },
            { from: "column", to: "kero", label: "Side Draw 1" },
            { from: "column", to: "diesel", label: "Side Draw 2" },
            { from: "column", to: "resid", label: "Bottoms" }
        ]
    }
};

// --- 2. NLP ENGINE ---

class ProcessAI {
    constructor() { }

    parse(text) {
        const lower = text.toLowerCase();

        // 1. Template Matching
        if (lower.includes("ammonia") || lower.includes("nh3")) return PROCESS_TEMPLATES["ammonia"];
        if (lower.includes("methanol") || lower.includes("meoh")) return PROCESS_TEMPLATES["methanol"];
        if (lower.includes("crude") || lower.includes("refinery") || lower.includes("distillation unit")) return PROCESS_TEMPLATES["crude"];

        // 2. Chain of Thought (Keyword Extraction)
        // If no template, we build a PFD from scratch based on keywords found
        return this.generateFromKeywords(lower);
    }

    generateFromKeywords(text) {
        const blocks = [{ id: "feed", label: "Feedstock" }];
        const streams = [];
        let lastId = "feed";

        // Identify steps by sequence keywords or just presence
        // Heuristic: Scan for unit ops and chain them linearly

        const unitsFound = [];

        // Simple linear scan of keywords in dictionary
        Object.keys(UNIT_OPS).forEach(key => {
            if (text.includes(key)) {
                unitsFound.push({ key: key, index: text.indexOf(key) });
            }
        });

        // Sort by position in text (rough sequence approximation)
        unitsFound.sort((a, b) => a.index - b.index);

        unitsFound.forEach((u, i) => {
            const def = UNIT_OPS[u.key];
            const id = `u_${i}`;
            blocks.push({ id: id, label: def.type, type: u.key });
            streams.push({ from: lastId, to: id, label: "" });
            lastId = id;
        });

        blocks.push({ id: "prod", label: "Product" });
        streams.push({ from: lastId, to: "prod", label: "Final Product" });

        return {
            name: "Custom Process (AI Generated)",
            blocks: blocks,
            streams: streams
        };
    }
}

// --- 3. MERMAID BUILDER ---

class PFDBuilder {
    constructor() { }

    buildMermaid(processData) {
        let code = "graph LR;\n";

        // Define Styles
        code += "classDef default fill:#1e293b,stroke:#334155,color:#fff;\n";

        // Define Nodes
        processData.blocks.forEach(b => {
            let shapeL = "[", shapeR = "]";
            let style = "";

            if (b.type && UNIT_OPS[b.type]) {
                const def = UNIT_OPS[b.type];
                if (def.shape == "stadium") { shapeL = "(["; shapeR = "])"; }
                if (def.shape == "circle") { shapeL = "(("; shapeR = "))"; }
                if (def.shape == "trapezoid") { shapeL = "[/"; shapeR = "\\\\]"; }

                // Inline style for Mermaid? No, classes better. Or inline style string.
                if (def.style) style = `style ${b.id} ${def.style},color:#000`;
            }

            code += `${b.id}${shapeL}"${b.label}"${shapeR};\n`;
            if (style) code += `${style}\n`;
        });

        // Define Links
        processData.streams.forEach(s => {
            let linkStyle = "-->";
            if (s.style && s.style.includes("dash")) linkStyle = "-.->";

            if (s.label) {
                code += `${s.from}${linkStyle}|"${s.label}"|${s.to};\n`;
            } else {
                code += `${s.from}${linkStyle}${s.to};\n`;
            }
        });

        return code;
    }

    generateEquipmentList(processData) {
        return processData.blocks.filter(b => b.id !== 'feed' && b.id !== 'prod').map((b, i) => {
            return {
                tag: `E-${100 + i}`,
                name: b.label,
                type: b.type ? UNIT_OPS[b.type]?.type || "Vessel" : "Block",
                duty: "Calculating..." // Placeholder for AI estimator
            };
        });
    }
}

// Expose
window.ProcessAI = ProcessAI;
window.PFDBuilder = PFDBuilder;
