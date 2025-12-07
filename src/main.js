
import * as THREE from 'three';
import { initScene } from './core/setup.js';
import { createPlanetSystem, createDwarfPlanet, createAsteroidBelt, createStarfieldOverlay, createSun } from './world/creators.js';
import { setupUI } from './ui/interaction.js';

// ==========================================
// 2. STATE MANAGEMENT
// ==========================================
const state = {
    isPaused: false,
    timeScale: 1,
    absoluteTime: 0,
    focusedPlanet: null,
    comparisonMesh: null,
    isTrueScale: false,
    simulationStartTime: Date.now()
};

const planets = [];

// ==========================================
// 3. SCENE SETUP
// ==========================================
const { scene, camera, renderer, controls, composer, sunLight } = initScene();

// ==========================================
// 4. CREATE OBJECTS
// ==========================================
const stars = createStarfieldOverlay(scene);
const sun = createSun(scene);

createPlanetSystem(scene, planets, { name: "Mercury", size: 0.38, texture: "mercury.jpg", distance: 10, speed: 0.04, color: 0xaaaaaa });
createPlanetSystem(scene, planets, { name: "Venus", size: 0.95, texture: "venus.jpg", distance: 16, speed: 0.025, color: 0xeecb8b });
createPlanetSystem(scene, planets, { name: "Earth", size: 1.0, texture: "earth.jpg", distance: 24, speed: 0.018, color: 0x2233ff });
createPlanetSystem(scene, planets, { name: "Mars", size: 0.53, texture: "mars.jpg", distance: 32, speed: 0.012, color: 0xc1440e });

const asteroidMesh = createAsteroidBelt(scene);

createDwarfPlanet(scene, planets, { name: "Ceres", size: 0.8, texture: "ceres.jpg", color: 0xaaaaaa, distance: 40, speed: 0.01, tiltX: 0.1, tiltZ: 0 });
createPlanetSystem(scene, planets, { name: "Jupiter", size: 4.0, texture: "jupiter.jpg", distance: 55, speed: 0.006, color: 0xc99039 });
createPlanetSystem(scene, planets, { name: "Saturn", size: 3.5, texture: "saturn.jpg", distance: 80, speed: 0.004, color: 0xe3e0c0, ring: { inner: 4.2, outer: 7.5, tex: "saturn_ring.png" } });
createPlanetSystem(scene, planets, { name: "Uranus", size: 1.8, texture: "uranus.jpg", distance: 100, speed: 0.003, color: 0x4fd0e7 });
createPlanetSystem(scene, planets, { name: "Neptune", size: 1.7, texture: "neptune.jpg", distance: 120, speed: 0.002, color: 0x4b70dd });
createDwarfPlanet(scene, planets, { name: "Pluto", size: 0.9, texture: "pluto.jpg", color: 0xccaacc, distance: 145, speed: 0.0015, tiltX: 0.3, tiltZ: 0.1 });
createDwarfPlanet(scene, planets, { name: "Eris", size: 0.9, texture: "eris.jpg", color: 0xffffff, distance: 170, speed: 0.001, tiltX: -0.2, tiltZ: 0.2 });

// ==========================================
// 5. HUD ELEMENTS
// ==========================================
const hudXEl = document.getElementById('hud-x');
const hudYEl = document.getElementById('hud-y');
const hudZEl = document.getElementById('hud-z');
const hudElapsedEl = document.getElementById('hud-elapsed');
const hudScaleInfoEl = document.getElementById('hud-scale-info');
const hudTargetNameEl = document.getElementById('target-name');

function updateHudTarget(name) {
    if (hudTargetNameEl) hudTargetNameEl.textContent = name;
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ==========================================
// 6. UI & INTERACTION
// ==========================================
const showInfoFn = setupUI(scene, camera, controls, planets, sun, asteroidMesh, state, updateHudTarget);

// ==========================================
// 7. ANIMATION LOOP
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    if (!state.isPaused) {
        const speed = state.timeScale;
        state.absoluteTime += 0.01 * speed;

        // Shader Time Update
        if (sun.material.uniforms) sun.material.uniforms.time.value += 0.02;
        if (stars && stars.material.uniforms) stars.material.uniforms.time.value += 0.005;

        sun.rotation.y += 0.002 * speed;
        if (asteroidMesh) asteroidMesh.rotation.y += 0.002 * speed;

        planets.forEach(p => {
            if (p.type === 'planet') {
                const x = Math.cos(state.absoluteTime * p.speed * 10) * p.distance;
                const z = Math.sin(state.absoluteTime * p.speed * 10) * p.distance;
                p.mesh.position.set(x, 0, z);
                p.mesh.rotation.y += 0.02 * speed;
                if (p.mesh.userData.clouds) p.mesh.userData.clouds.rotation.y += 0.025 * speed;
            }
            if (p.type === 'dwarf') {
                const angle = state.absoluteTime * p.speed * 10;
                const rx = p.orbitRef.rotation.x; const rz = p.orbitRef.rotation.z;
                let x = Math.cos(angle) * p.distance; let z = Math.sin(angle) * p.distance;
                let y1 = -z * Math.sin(rx); let z1 = z * Math.cos(rx);
                let x2 = x * Math.cos(rz) - (-z * Math.sin(rx)) * Math.sin(rz);
                let y2 = x * Math.sin(rz) + (-z * Math.sin(rx)) * Math.cos(rz);
                p.mesh.position.set(x2, y2, z1); p.mesh.rotation.y += 0.02 * speed;
            }
            if (p.type === 'moon') {
                const parent = p.mesh.userData.parentPlanet;
                const dist = p.mesh.userData.moonDist;
                p.mesh.userData.moonAngle += 0.05 * speed;
                p.mesh.position.set(parent.position.x + Math.cos(p.mesh.userData.moonAngle) * dist, 0, parent.position.z + Math.sin(p.mesh.userData.moonAngle) * dist);
                p.mesh.rotation.y += 0.01 * speed;
            }
        });
    }

    // HUD Update
    if (hudXEl) hudXEl.textContent = `X: ${camera.position.x.toFixed(1)}`;
    if (hudYEl) hudYEl.textContent = `Y: ${camera.position.y.toFixed(1)}`;
    if (hudZEl) hudZEl.textContent = `Z: ${camera.position.z.toFixed(1)}`;
    if (hudElapsedEl) hudElapsedEl.textContent = `⏱ ${formatTime(Date.now() - state.simulationStartTime)}`;
    if (hudScaleInfoEl) hudScaleInfoEl.textContent = `⚡ ${state.timeScale}x`;

    if (state.focusedPlanet && state.comparisonMesh) {
        const targetPos = new THREE.Vector3();
        state.focusedPlanet.getWorldPosition(targetPos);
        const currentScale = state.focusedPlanet.scale.x;
        const planetRadius = (state.focusedPlanet.userData.artisticSize || 1) * currentScale;
        const earthRadius = 1.0 * (state.isTrueScale ? 0.3 : 1.0);
        const offset = planetRadius + earthRadius + 2.0;
        state.comparisonMesh.position.copy(targetPos).x += offset;
        state.comparisonMesh.scale.setScalar(state.isTrueScale ? 0.3 : 1.0);
    }

    if (state.focusedPlanet) {
        const targetPos = new THREE.Vector3();
        state.focusedPlanet.getWorldPosition(targetPos);
        controls.target.copy(targetPos);
    }

    controls.update();
    composer.render();
}

animate();
