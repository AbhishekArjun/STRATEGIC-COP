/**
 * Growth Engine - Real Estate Analytics & Heatmap Projection
 * Calculates Growth Velocity Score (GVS) and Multi-Year ROI Forecasts
 */

export class GrowthEngine {
    constructor() {
        this.microMarkets = {
            'noida-150': {
                name: 'Sector 150, Noida',
                coords: [28.4595, 77.5000],
                baseGVS: 72,
                infraIndicators: [
                    { name: 'Jewar Airport Connectivity', weight: 40, etaMonths: 36, active: true },
                    { name: 'Expressway Flyover', weight: 15, etaMonths: 12, active: true }
                ],
                marketIndicators: { listingDensity: 85, priceVelocity: 12, rentalAbsorption: 65 }
            },
            'bangalore-whitefield': {
                name: 'Whitefield, Bangalore',
                coords: [12.9698, 77.7500],
                baseGVS: 85,
                infraIndicators: [
                    { name: 'Metro Phase 3 Extension', weight: 50, etaMonths: 48, active: true },
                    { name: 'Peripheral Ring Road', weight: 20, etaMonths: 24, active: true }
                ],
                marketIndicators: { listingDensity: 92, priceVelocity: 18, rentalAbsorption: 88 }
            },
            'mumbai-panvel': {
                name: 'Panvel, Navi Mumbai',
                coords: [18.9894, 73.1175],
                baseGVS: 68,
                infraIndicators: [
                    { name: 'Navi Mumbai Intl Airport', weight: 60, etaMonths: 40, active: true },
                    { name: 'MTHL Linkage', weight: 30, etaMonths: 18, active: true }
                ],
                marketIndicators: { listingDensity: 55, priceVelocity: 8, rentalAbsorption: 45 }
            }
        };
    }

    /**
     * Calculates GVS for a specific point in the future (t + months)
     */
    calculateGVS(marketId, projectionMonths = 0) {
        const market = this.microMarkets[marketId];
        if (!market) return 0;

        // 1. Calculate Infrastructure Score
        let infraScore = 0;
        market.infraIndicators.forEach(indicator => {
            // As we get closer to completion (eta), the "Supply" impact increases
            const progressRatio = Math.min(1, projectionMonths / indicator.etaMonths);
            infraScore += indicator.weight * (1 + (progressRatio * 0.5));
        });

        // 2. Market Demand Correlation
        const demandScore = (market.marketIndicators.listingDensity * 0.4) + 
                            (market.marketIndicators.priceVelocity * 4) + // Multiplier for price growth
                            (market.marketIndicators.rentalAbsorption * 0.2);

        // 3. Normalized Weighted Score
        const combinedScore = (infraScore * 0.65) + (demandScore * 0.35);
        return Math.min(100, combinedScore);
    }

    /**
     * Generates a Heatmap dataset based on projection timeline
     */
    getProjectionData(months) {
        return Object.keys(this.microMarkets).map(id => {
            const market = this.microMarkets[id];
            const gvs = this.calculateGVS(id, months);
            return {
                id,
                name: market.name,
                coords: market.coords,
                intensity: gvs / 100,
                score: gvs.toFixed(1),
                details: market
            };
        });
    }

    /**
     * Identifies "Undervalued" zones (Rental Yield > Asset Appreciation)
     */
    getUndervaluedZones() {
        return Object.keys(this.microMarkets).filter(id => {
            const m = this.microMarkets[id].marketIndicators;
            return m.rentalAbsorption > (m.priceVelocity * 4);
        });
    }
}
