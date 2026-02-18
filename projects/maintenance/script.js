/**
 * Predictive Maintenance AI - Logic Engine
 * 
 * 1. Data Simulator: Generates time-series data with noise and degradation trends.
 * 2. Feature Engineering: Calc U, Rf, Efficiency, RMS.
 * 3. Prediction Model: Linear Regression for RUL (Remaining Useful Life).
 * 4. Anomaly Detection: Z-Score thresholding.
 */

class DataSimulator {
    constructor() {
        this.days = 30; // Historical window
        this.data = {
            dates: [],
            hx: { T_in: [], T_out: [], Flow: [], U: [], Rf: [] },
            pump: { Flow: [], Head: [], Power: [], Eff: [], Vib: [] }
        };

        // Degradation Params
        this.deg_hx = { base_U: 850, rate: -2.5, noise: 15 }; // U drops 2.5 W/m2K per day
        this.deg_pump = { base_eff: 0.75, rate: -0.001, noise: 0.005 }; // Eff drops 0.1% per day
        this.deg_vib = { base_rms: 1.2, rate: 0.05, noise: 0.2 }; // Vibration rises
    }

    generateHistory() {
        const now = new Date();
        this.data.dates = [];

        for (let i = this.days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            this.data.dates.push(date.toISOString().split('T')[0]);

            // HX Simulation
            // Random fluctuations in process conditions
            const flow = 50000 + (Math.random() - 0.5) * 2000;
            const t_in = 80 + (Math.random() - 0.5) * 2;

            // Sim Degradation: U(t) = U0 - rate*t + noise
            const day_idx = this.days - i;
            let u_val = this.deg_hx.base_U + (this.deg_hx.rate * day_idx) + (Math.random() - 0.5) * this.deg_hx.noise;

            // Calc Rf (Fouling Factor) = 1/U_dirty - 1/U_clean
            // Assume U_clean = 900
            const u_clean = 900;
            let rf_val = (1 / u_val) - (1 / u_clean);
            if (rf_val < 0) rf_val = 0;

            this.data.hx.T_in.push(t_in);
            this.data.hx.Flow.push(flow);
            this.data.hx.U.push(u_val);
            this.data.hx.Rf.push(rf_val * 10000); // Scale for chart (x10^-4)

            // Pump Simulation
            const p_flow = 150 + (Math.random() - 0.5) * 10;

            // Degradation
            let eff_val = this.deg_pump.base_eff + (this.deg_pump.rate * day_idx) + (Math.random() - 0.5) * this.deg_pump.noise;
            let vib_val = this.deg_vib.base_rms + (this.deg_vib.rate * day_idx) + (Math.random() - 0.5) * this.deg_vib.noise;

            // Anomaly Injection (Random spike on day 25)
            if (day_idx === 25) {
                vib_val += 3.0; // Spike
            }

            this.data.pump.Flow.push(p_flow);
            this.data.pump.Eff.push(eff_val * 100);
            this.data.pump.Vib.push(vib_val);
        }

        return this.data;
    }
}

class PredictionEngine {
    constructor() { }

    // Linear Regression: y = mx + c
    regress(y_data) {
        const n = y_data.length;
        const x_data = Array.from({ length: n }, (_, i) => i); // 0, 1, 2...

        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += x_data[i];
            sumY += y_data[i];
            sumXY += x_data[i] * y_data[i];
            sumXX += x_data[i] * x_data[i];
        }

        const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const c = (sumY - m * sumX) / n;

        return { m, c };
    }

    predictRUL(current_val, threshold, rate) {
        // days = (threshold - current) / rate
        // rate is change per day (slope m)
        if (rate === 0) return 999;
        const days = (threshold - current_val) / rate;
        if (days < 0 && rate < 0 && current_val < threshold) return 0; // Already passed
        if (days < 0 && rate > 0 && current_val > threshold) return 0;
        return Math.floor(days);
    }

    analyzeHX(hx_data) {
        const U_series = hx_data.U;
        const Rf_series = hx_data.Rf;

        // Trend Analysis on last 15 points
        const recent_U = U_series.slice(-15);
        const reg = this.regress(recent_U);

        const current_U = U_series[U_series.length - 1];
        const critical_U = 600; // Limit

        const rul = this.predictRUL(current_U, critical_U, reg.m);

        // Clean Date Estimation
        const today = new Date();
        const clean_date = new Date(today);
        clean_date.setDate(today.getDate() + rul);

        return {
            current_U: current_U,
            trend_rate: reg.m, // U change per day
            rul_days: rul,
            clean_date: clean_date.toISOString().split('T')[0],
            status: rul < 7 ? "Critical" : (rul < 30 ? "Warning" : "Healthy")
        };
    }

    analyzePump(pump_data) {
        const Vib_series = pump_data.Vib;
        const current_Vib = Vib_series[Vib_series.length - 1];

        // Anomaly Detection (Z-Score)
        const mean = Vib_series.reduce((a, b) => a + b, 0) / Vib_series.length;
        const std = Math.sqrt(Vib_series.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / Vib_series.length);

        const z_score = (current_Vib - mean) / std;

        let status = "Healthy";
        let issue = "None";

        if (current_Vib > 4.5 || z_score > 3) {
            status = "Critical";
            issue = "High Vibration (Possible Cavitation/Bearing)";
        } else if (current_Vib > 2.5) {
            status = "Warning";
            issue = "Increasing Vibration";
        }

        return {
            current_Vib: current_Vib,
            z_score: z_score,
            status: status,
            issue: issue
        };
    }
}

// Expose
window.DataSimulator = DataSimulator;
window.PredictionEngine = PredictionEngine;
