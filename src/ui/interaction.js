
import * as THREE from 'three';
import { planetInfo } from '../data/database.js';

export function setupUI(scene, camera, controls, planets, sun, asteroidMesh, state, updateHudTarget) {
    const pauseBtn = document.getElementById('pauseBtn');

    const speedSlider = document.getElementById('speedSlider');
    const speedValueEl = document.getElementById('speedValue');
    const infoPanel = document.getElementById('info-panel');
    const closeBtn = document.getElementById('close-btn');
    const planetNameEl = document.getElementById('planet-name');
    const planetDetailsEl = document.getElementById('planet-details');

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function toggleComparison() {
        if (!state.focusedPlanet) return;
        if (state.comparisonMesh) { scene.remove(state.comparisonMesh); state.comparisonMesh = null; return; }

        const geo = new THREE.SphereGeometry(1.0, 32, 32);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.3 });
        state.comparisonMesh = new THREE.Mesh(geo, mat);
        scene.add(state.comparisonMesh);
    }



    function showInfo(name) {
        if (name && planetInfo[name]) {
            const data = planetInfo[name];
            planetNameEl.innerText = name;

            // Rich data table format
            planetDetailsEl.innerHTML = `
                <table class="info-table">
                    <tr><td class="label">Type</td><td class="value">${data.type}</td></tr>
                    <tr><td class="label">Diameter</td><td class="value">${data.diameter}</td></tr>
                    <tr><td class="label">Temperature</td><td class="value">${data.temp}</td></tr>
                    <tr><td class="label">Gravity</td><td class="value">${data.gravity || '—'}</td></tr>
                    <tr><td class="label">Escape Velocity</td><td class="value">${data.escapeVelocity || '—'}</td></tr>
                    <tr><td class="label">Day Length</td><td class="value">${data.day}</td></tr>
                    <tr><td class="label">Year Length</td><td class="value">${data.year}</td></tr>
                    <tr><td class="label">Atmosphere</td><td class="value">${data.atmosphere || '—'}</td></tr>
                    <tr><td class="label">Discovery</td><td class="value">${data.discoveryDate || 'Prehistoric'}</td></tr>
                    <tr><td class="label">Moons</td><td class="value">${data.moons !== undefined ? data.moons : '—'}</td></tr>
                    <tr><td class="label">Life</td><td class="value" style="color:#ffaa00">${data.life}</td></tr>
                </table>
                
                <button id="compareBtn">🌍 Compare with Earth</button>
                
                <div class="info-description">
                    <p>${data.desc}</p>
                </div>
                
                <div class="info-funfact">
                    💡 <em>${data.funFact}</em>
                </div>
            `;
            infoPanel.classList.add('active');
            const compareBtn = document.getElementById('compareBtn');
            if (compareBtn) compareBtn.onclick = toggleComparison;

            // HUD hedef güncelleme
            if (updateHudTarget) updateHudTarget(`🎯 ${name.toUpperCase()}`);
        }
    }

    if (pauseBtn) {
        pauseBtn.onclick = function () {
            state.isPaused = !state.isPaused;
            this.innerHTML = state.isPaused ? "Resume ▶️" : "Pause ⏸️";
        };
    }

    if (speedSlider) {
        speedSlider.oninput = function () {
            state.timeScale = parseFloat(this.value);
            if (speedValueEl) speedValueEl.innerText = state.timeScale + "x";
        };
    }
    if (closeBtn) {
        closeBtn.onclick = function () {
            infoPanel.classList.remove('active');
            if (state.comparisonMesh) { scene.remove(state.comparisonMesh); state.comparisonMesh = null; }
            if (updateHudTarget) updateHudTarget("— FREE FLIGHT —");
        };
    }

    window.addEventListener('pointerdown', (event) => {
        if (event.target.closest('#info-panel') || event.target.closest('#ui-container')) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length === 0) {
            if (event.button === 0) {
                state.focusedPlanet = null;
                infoPanel.classList.remove('active');
                if (state.comparisonMesh) { scene.remove(state.comparisonMesh); state.comparisonMesh = null; }
                if (updateHudTarget) updateHudTarget("— FREE FLIGHT —");
            }
            return;
        }

        for (let i = 0; i < intersects.length; i++) {
            const obj = intersects[i].object;
            if (obj.type === 'Sprite' || obj.type === 'Line' || obj.type === 'LineLoop' || obj.type === 'Points') continue;

            if (obj.userData.name || (obj.parent && obj.parent.userData.name)) {
                let name = obj.userData.name || obj.parent.userData.name;

                // SOL TIK - Bilgi göster VE hologram için focusedPlanet ayarla
                if (event.button === 0) {
                    state.focusedPlanet = obj; // Hologram kıyaslama için
                    showInfo(name);
                }

                if (event.button === 1) { // ORTA TUŞ
                    state.focusedPlanet = obj;
                    const targetPos = new THREE.Vector3();
                    state.focusedPlanet.getWorldPosition(targetPos);

                    // KAMERAYI IŞINLA (YAKLAŞ)
                    const currentScale = state.focusedPlanet.scale.x;
                    const realRadius = (state.focusedPlanet.userData.artisticSize || 1) * currentScale;

                    const dist = realRadius * 5 + 2;
                    const offset = new THREE.Vector3(dist, dist * 0.5, dist);

                    camera.position.copy(targetPos).add(offset);
                    controls.target.copy(targetPos);

                    showInfo(name);
                }
                break;
            }
        }
    });

    // showInfo fonksiyonunu dışarı aktar (sinematik tur için)
    return showInfo;
}

