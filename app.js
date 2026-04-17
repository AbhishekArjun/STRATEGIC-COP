/**
 * Integrated Strategic Fusion Dashboard - India Focus
 * Solves Problems 1, 2, 3 & 4
 */

import { TelemetryProcessor } from './telemetryProcessor.js';
import { GrowthEngine } from './growthEngine.js';
import { LogisticsEngine } from './logisticsEngine.js';

// --- Configuration & State ---
const CONFIG = {
    indiaCenter: [20.5937, 78.9629],
    defaultZoom: 5,
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttrib: '&copy; OpenStreetMap contributors'
};

const state = {
    map: null,
    telemetry: new TelemetryProcessor(),
    growth: new GrowthEngine(),
    logistics: new LogisticsEngine(),
    layers: {
        osint: L.layerGroup(),
        humint: L.layerGroup(),
        imint: L.layerGroup(),
        telemetry: L.layerGroup(),
        growth: L.layerGroup(),
        fleet: L.layerGroup() // New Logistics Layer
    },
    nodes: {},
    fleetAssets: {} // Store moving fleet units
};

// --- Initialization ---
function init() {
    state.map = L.map('map', { zoomControl: false, attributionControl: false }).setView(CONFIG.indiaCenter, CONFIG.defaultZoom);
    L.tileLayer(CONFIG.tileLayer, { attribution: CONFIG.tileAttrib }).addTo(state.map);

    Object.keys(state.layers).forEach(key => {
        if (!['growth', 'fleet'].includes(key)) state.layers[key].addTo(state.map);
    });

    // Populate initial markers
    const InitialNodes = [
        { id: 'osint-nd', type: 'osint', coords: [28.6139, 77.2090], title: 'Delhi OSINT Vector', desc: 'High social density.' },
        { id: 'humint-mum', type: 'humint', coords: [19.0760, 72.8777], title: 'Mumbai Asset-04', desc: 'Port activity report.' },
        { id: 'imint-border', type: 'imint', coords: [34.0837, 74.7973], title: 'Srinagar Satellite', desc: 'Thermal resolve: 0.3m.', image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=1200' }
    ];
    InitialNodes.forEach(data => addOrUpdateNode(data));

    setupEventListeners();
    startSimulations();
    if (window.lucide) lucide.createIcons();
}

/**
 * Logistics Asset Management (Problem 4)
 */
function updateFleetAsset(id, data, pathInfo) {
    const coords = pathInfo.coords;
    const isRerouted = pathInfo.rerouted;
    const cargo = data.cargo;
    
    if (state.fleetAssets[id]) {
        state.fleetAssets[id].marker.setLatLng(coords);
        state.fleetAssets[id].buffer.setLatLng(coords);
        
        // Update buffer radius based on logistics engine
        const newRadius = state.logistics.calculateBuffer(cargo, 60, 0.5);
        state.fleetAssets[id].buffer.setRadius(newRadius);
    } else {
        const marker = L.marker(coords, { icon: L.divIcon({ className: 'tactical-marker fleet', iconSize: [10, 10] }) });
        const buffer = L.circle(coords, {
            radius: state.logistics.calculateBuffer(cargo, 60, 0.5),
            className: 'buffer-halo'
        }).addTo(state.layers.fleet);

        marker.bindPopup(`<b>${data.name}</b><br>Cargo: ${cargo}<br>Status: ${isRerouted ? 'REROUTED' : 'ON PATH'}`);
        marker.addTo(state.layers.fleet);
        state.fleetAssets[id] = { marker, buffer };
    }

    if (isRerouted) {
        pushToFeed({ type: 'fleet', title: `REROUTE: ${id} due to ${pathInfo.reason}` });
    }
}

// --- Simulations ---
function startSimulations() {
    // 1. LoRa Predictive Simulation
    let loraAngle = 0;
    setInterval(() => {
        loraAngle += 0.05;
        const newLat = 12.9716 + Math.sin(loraAngle) * 0.1;
        const newLon = 77.5946 + Math.cos(loraAngle) * 0.1;
        const packetDropped = Math.random() < 0.3;
        const est = state.telemetry.estimateState('lora-01', packetDropped ? null : [newLat, newLon]);
        addOrUpdateNode({ id: 'lora-01', type: 'telemetry', title: 'Bangalore LoRa Node', desc: packetDropped ? 'PREDICTIVE RECOVERY' : 'LINK STABLE' }, est);
    }, 3000);

    // 2. Logistics & Traffic Simulation (Problem 4)
    let fleetPos = [28.6139, 77.2090]; // Starting in Delhi
    setInterval(() => {
        const sensing = state.logistics.updateSensingLayer();
        updateSensingUI(sensing);

        // Movement simulation
        fleetPos[0] -= 0.005; // Moving South
        fleetPos[1] += 0.001;
        
        const path = state.logistics.getOptimalPath(fleetPos, [fleetPos[0], fleetPos[1]], 'HAZMAT');
        updateFleetAsset('TRUCK-09-HAZ', { name: 'Fuel Convoy', cargo: 'HAZMAT' }, path);

        if (path.rerouted) {
            pushToTerminal(`LORA_BNGLR: PACKET REPAIR: APPENDED '}'`, 'warn');
            pushToTerminal(`REROUTE: NODE [${sensing['silk-board-blr'].name}] SATURATION: 95%`, 'error');
            pushToTerminal(`PATHFINDING: SWITCHING TO FASTEST_DETOUR`, 'info');
        } else {
            pushToTerminal(`SENSING: SCANNING CORRIDORS... STATUS: NOMINAL`, 'info');
        }
    }, 4000);
}

function pushToTerminal(msg, mode = 'info') {
    const list = document.getElementById('terminal-logs');
    if (!list) return;
    const li = document.createElement('li');
    li.className = mode;
    li.innerText = `> ${msg}`;
    list.prepend(li);
    if (list.childNodes.length > 15) list.removeChild(list.lastChild);
}

function updateSensingUI(nodes) {
    const container = document.getElementById('sensing-nodes');
    if (!container) return;
    container.innerHTML = Object.values(nodes).map(n => `
        <div style="font-size: 0.6rem; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>${n.name}</span>
            <span style="color: ${n.score > 0.8 ? 'var(--accent-red)' : 'var(--accent-green)'}">${(n.score * 100).toFixed(0)}% LOAD</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${n.score * 100}%; background: ${n.score > 0.8 ? 'var(--accent-red)' : 'var(--accent-green)'}"></div></div>
    `).join('');
}

// --- Core Helper Functions ---
function addOrUpdateNode(data, prediction = null) {
    const isEstimated = prediction && prediction.status === 'estimated';
    const coords = prediction ? prediction.coords : data.coords;
    const icon = L.divIcon({ className: `tactical-marker ${data.type} ${isEstimated ? 'estimated' : ''}`, iconSize: [14, 14] });

    if (state.nodes[data.id]) {
        state.nodes[data.id].setLatLng(coords);
        state.nodes[data.id].setIcon(icon);
    } else {
        const marker = L.marker(coords, { icon });
        marker.bindPopup(`<b>${data.title}</b><br>${data.desc}`);
        if (data.type === 'imint') marker.on('mouseover', () => showIMINTModal(data));
        marker.addTo(state.layers[data.type]);
        state.nodes[data.id] = marker;
    }
}

function updateGrowthHeatmap(months) {
    state.layers.growth.clearLayers();
    const data = state.growth.getProjectionData(months);
    data.forEach(zone => {
        const color = zone.intensity < 0.5 ? '#00f2ff' : (zone.intensity < 0.8 ? '#a855f7' : '#ef4444');
        L.circle(zone.coords, { radius: 10000 + (zone.intensity * 30000), color, fillOpacity: 0.4 }).addTo(state.layers.growth);
    });
}

function showIMINTModal(data) {
    document.getElementById('modal-img').src = data.image;
    document.getElementById('modal-title').innerText = data.title;
    document.getElementById('imint-modal').classList.remove('hidden');
}

function setupEventListeners() {
    document.querySelectorAll('.filter-item input').forEach(input => {
        input.addEventListener('change', (e) => {
            const l = e.target.getAttribute('data-layer');
            if (e.target.checked) state.map.addLayer(state.layers[l]);
            else state.map.removeLayer(state.layers[l]);

            if (l === 'growth') {
                document.getElementById('timeline-panel').classList.toggle('hidden', !e.target.checked);
                if (e.target.checked) updateGrowthHeatmap(0);
            }
            if (l === 'fleet') {
                document.getElementById('sensing-panel').classList.toggle('hidden', !e.target.checked);
            }
        });
    });

    const slider = document.getElementById('timeline-slider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            document.getElementById('proj-val').innerText = `T + ${e.target.value}M`;
            updateGrowthHeatmap(parseInt(e.target.value));
        });
    }

    state.map.on('mousemove', (e) => {
        document.getElementById('coord-val').innerText = `${e.latlng.lat.toFixed(4)}° N, ${e.latlng.lng.toFixed(4)}° E`;
    });
    
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('imint-modal').classList.add('hidden');
    });
}

function pushToFeed(data) {
    const list = document.getElementById('intel-feed-list');
    if (!list) return;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5) + ' Z';
    const li = document.createElement('li');
    li.className = `feed-item ${data.type}`;
    li.innerHTML = `<span class="time">[${time}]</span>: ${data.title}`;
    list.prepend(li);
    if (list.childNodes.length > 10) list.removeChild(list.lastChild);
}

window.addEventListener('DOMContentLoaded', init);
