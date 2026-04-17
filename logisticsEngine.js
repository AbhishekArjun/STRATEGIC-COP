/**
 * Logistics Engine - Real-Time Traffic & Fleet Optimization
 * Handles Dynamic Rerouting, Buffer Zones, and Priority Scaling
 */

export class LogisticsEngine {
    constructor() {
        this.congestionNodes = {
            'delhi-ring-road': { coords: [28.6139, 77.2090], score: 0.85, name: 'Delhi AIIMS Junction' },
            'silk-board-blr': { coords: [12.9172, 77.6228], score: 0.95, name: 'Silk Board, Bangalore' },
            'ghatkopar-mum': { coords: [19.0860, 72.9080], score: 0.70, name: 'Ghatkopar, Mumbai' }
        };
        this.cargoProfiles = {
            'HAZMAT': { baseBuffer: 1500, speedModifier: 1.5, color: '#ef4444' }, // 1.5km
            'EMERGENCY': { baseBuffer: 500, speedModifier: 1.0, color: '#00f2ff' },
            'STANDARD': { baseBuffer: 200, speedModifier: 0.5, color: '#22c55e' }
        };
    }

    /**
     * Calculates dynamic buffer size predicated on congestion and speed
     * radius = baseBuffer * (1 + congestionScore) * speedModifier
     */
    calculateBuffer(cargoType, speed, currentCongestion = 0) {
        const profile = this.cargoProfiles[cargoType] || this.cargoProfiles.STANDARD;
        return profile.baseBuffer * (1 + currentCongestion) * profile.speedModifier;
    }

    /**
     * Logic for Emergency Rerouting
     * If next node weight > threshold, find alternative (mocked via slight offset)
     */
    getOptimalPath(currentPos, targetPos, cargoType) {
        const isEmergency = cargoType === 'EMERGENCY';
        const threshold = isEmergency ? 0.95 : 0.80; // Emergency can push through higher congestion

        // Find if any congestion node is on/near the path
        const nearNode = Object.values(this.congestionNodes).find(node => {
            const dist = this.getDist(currentPos, node.coords);
            return dist < 0.05 && node.score > threshold;
        });

        if (nearNode) {
            return {
                path: 'FASTEST',
                rerouted: true,
                reason: `Congestion at ${nearNode.name}`,
                coords: [targetPos[0] + 0.02, targetPos[1] + 0.02] // Strategic detour
            };
        }

        return { path: 'SHORTEST', rerouted: false, coords: targetPos };
    }

    getDist(p1, p2) {
        return Math.sqrt(Math.pow(p1[0]-p2[0], 2) + Math.pow(p1[1]-p2[1], 2));
    }

    /**
     * Updates congestion score based on "Sensing Layer" simulation
     */
    updateSensingLayer() {
        Object.keys(this.congestionNodes).forEach(id => {
            // Simulate 5% fluctuation
            this.congestionNodes[id].score = Math.max(0.2, Math.min(1.0, this.congestionNodes[id].score + (Math.random() * 0.1 - 0.05)));
        });
        return this.congestionNodes;
    }
}
