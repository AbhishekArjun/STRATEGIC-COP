/**
 * Telemetry Processor - Modular Middleware for LoRa Reconstruction
 * Handles JSON repair, State Estimation (Kalman Filter), and Data Smoothing
 */

export class TelemetryProcessor {
    constructor() {
        this.history = {}; // Node-specific historical buffer
        this.kalmanConfig = {
            R: 0.0001, // Measurement Noise
            Q: 0.00001 // Process Noise
        };
    }

    /**
     * Predictive Completion: Repairs fragmented JSON strings
     */
    repairPacket(rawString) {
        let repaired = rawString.trim();
        
        // Check for truncated JSON (missing closing braces)
        const openBraces = (repaired.match(/\{/g) || []).length;
        const closeBraces = (repaired.match(/\}/g) || []).length;
        
        if (openBraces > closeBraces) {
            repaired += '}'.repeat(openBraces - closeBraces);
        }

        try {
            return JSON.parse(repaired);
        } catch (e) {
            // Heuristic repair for common malformed syntax
            // e.g., missing quotes around keys or trailing commas
            try {
                // Extremely aggressive repair for common LoRa bit-rot
                const aggressiveRepair = repaired
                    .replace(/([{,])\s*([^"'\s{][^:]*)\s*:/g, '$1"$2":') // Quote keys
                    .replace(/:\s*([^"'\s}][^,}]*)\s*([,}]|$)/g, ':"$1"$2'); // Quote values
                return JSON.parse(aggressiveRepair);
            } catch (err) {
                console.error("Critical Packet Corruption: Unable to repair.", rawString);
                return null;
            }
        }
    }

    /**
     * Heuristic Data Smoothing & State Estimation (Kalman)
     * Estimates position [t] based on [t-1] and partial data
     */
    estimateState(nodeId, newCoords) {
        if (!this.history[nodeId]) {
            this.history[nodeId] = {
                lastValid: newCoords,
                estimate: newCoords,
                velocity: [0, 0], // [dLat, dLon]
                errorCovariance: 1.0,
                timestamp: Date.now()
            };
            return { coords: newCoords, status: 'verified' };
        }

        const prev = this.history[nodeId];
        const dt = (Date.now() - prev.timestamp) / 1000;
        
        // KALMAN FILTER STEP 1: PREDICT
        const predLat = prev.estimate[0] + (prev.velocity[0] * dt);
        const predLon = prev.estimate[1] + (prev.velocity[1] * dt);
        const predP = prev.errorCovariance + this.kalmanConfig.Q;

        // Check if current measurement is valid/available
        if (newCoords) {
            // KALMAN STEP 2: UPDATE (MEASUREMENT AVAILABLE)
            const K = predP / (predP + this.kalmanConfig.R);
            const estLat = predLat + K * (newCoords[0] - predLat);
            const estLon = predLon + K * (newCoords[1] - predLon);
            const estP = (1 - K) * predP;

            // Calculate velocity for next prediction
            const vLat = (estLat - prev.estimate[0]) / dt;
            const vLon = (estLon - prev.estimate[1]) / dt;

            this.history[nodeId] = {
                lastValid: [estLat, estLon],
                estimate: [estLat, estLon],
                velocity: [vLat, vLon],
                errorCovariance: estP,
                timestamp: Date.now()
            };

            return { coords: [estLat, estLon], status: 'verified', confidence: 1.0 };
        } else {
            // KALMAN STEP 2: ESTIMATE (MEASUREMENT LOST)
            // Use prediction as the current estimate
            this.history[nodeId].estimate = [predLat, predLon];
            this.history[nodeId].errorCovariance = predP;
            this.history[nodeId].timestamp = Date.now();

            return { 
                coords: [predLat, predLon], 
                status: 'estimated', 
                confidence: Math.max(0.1, 1 - (predP * 10)) 
            };
        }
    }
}
