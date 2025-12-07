
import * as THREE from 'three';
import gsap from 'gsap';

// ==========================================
// 🎬 STUDIO QUALITY CINEMATIC TOUR v2.0
// 4-Phase Camera Choreography System
// ==========================================

// Optimized tour order: Sun → Inner Planets → Outer Planets
const tourOrder = [
    "SUN", "Mercury", "Venus", "Earth", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
];

let isTourActive = false;
let currentTourIndex = 0;
let currentTimeline = null;

// ==========================================
// 🎥 CINEMATIC CONFIGURATION
// ==========================================
const CINEMATIC_CONFIG = {
    // Timing (seconds)
    approachDuration: { min: 2.5, max: 5.0 },
    orbitDuration: 6.0,
    elevationDuration: 2.0,
    departureDuration: 1.5,

    // Camera angles
    orbitAngle: Math.PI, // 180 degrees
    elevationHeight: 15,
    departureHeight: 35,

    // Easing presets (cinematic feel)
    easing: {
        approach: "power2.inOut",
        orbit: "power2.inOut",
        elevation: "sine.inOut",
        departure: "power1.out"
    }
};

// ==========================================
// 🎯 TARGET MESH RESOLVER
// ==========================================
function getTargetMesh(planetName, planets, sun) {
    if (planetName === "SUN") return sun;
    if (planetName === "Moon") {
        const moonData = planets.find(p => p.mesh?.userData?.name === "Moon" || p.mesh?.userData?.name === "Ay");
        return moonData ? moonData.mesh : null;
    }
    const planetData = planets.find(p => p.name === planetName);
    return planetData ? planetData.mesh : null;
}

// ==========================================
// 📐 VIEW SETTINGS CALCULATOR
// ==========================================
function calculateViewSettings(targetMesh, name) {
    const size = targetMesh.userData.artisticSize || 1;
    let distance, heightOffset;

    if (name === "SUN") {
        distance = size * 3.5;
        heightOffset = size * 0.6;
    } else if (size < 1) {
        // Small planets (Mercury, Mars, Pluto)
        distance = Math.max(size * 6, 5);
        heightOffset = 2.5;
    } else if (size > 3) {
        // Gas giants (Jupiter, Saturn)
        distance = size * 2.8;
        heightOffset = size * 0.6;
    } else {
        // Medium planets (Venus, Earth, Uranus, Neptune)
        distance = size * 3.2;
        heightOffset = size * 0.8;
    }

    return { distance, heightOffset };
}

// ==========================================
// 🎬 MAIN ANIMATION SEQUENCE
// ==========================================
function animateTourSequence(camera, controls, planets, sun, showInfoFn, updateHudTargetFn) {
    if (!isTourActive || currentTourIndex >= tourOrder.length) {
        finishTour(camera, controls, updateHudTargetFn);
        return;
    }

    const planetName = tourOrder[currentTourIndex];
    const targetMesh = getTargetMesh(planetName, planets, sun);

    if (!targetMesh) {
        console.warn(`[Cinematic Tour] Target not found: ${planetName}`);
        currentTourIndex++;
        animateTourSequence(camera, controls, planets, sun, showInfoFn, updateHudTargetFn);
        return;
    }

    // === SETUP ===
    const { distance, heightOffset } = calculateViewSettings(targetMesh, planetName);
    const startPos = camera.position.clone();

    // Get target world position
    const targetWorldPos = new THREE.Vector3();
    targetMesh.getWorldPosition(targetWorldPos);

    // Calculate entry angle based on approach direction
    const offset = new THREE.Vector3().subVectors(startPos, targetWorldPos);
    let entryAngle = Math.atan2(offset.z, offset.x);

    // Orbit start position
    const orbitStartPos = new THREE.Vector3(
        targetWorldPos.x + Math.cos(entryAngle) * distance,
        targetWorldPos.y + heightOffset,
        targetWorldPos.z + Math.sin(entryAngle) * distance
    );

    // === TIMELINE CONSTRUCTION ===
    if (currentTimeline) currentTimeline.kill();
    currentTimeline = gsap.timeline({
        onComplete: () => {
            currentTourIndex++;
            animateTourSequence(camera, controls, planets, sun, showInfoFn, updateHudTargetFn);
        }
    });

    // ==========================================
    // PHASE 1: APPROACH (Smooth spiral descent)
    // ==========================================
    const travelDist = startPos.distanceTo(orbitStartPos);
    const approachDuration = Math.min(
        Math.max(travelDist / 50, CINEMATIC_CONFIG.approachDuration.min),
        CINEMATIC_CONFIG.approachDuration.max
    );

    currentTimeline.to(camera.position, {
        duration: approachDuration,
        x: orbitStartPos.x,
        y: orbitStartPos.y,
        z: orbitStartPos.z,
        ease: CINEMATIC_CONFIG.easing.approach,
        onStart: () => {
            if (updateHudTargetFn) updateHudTargetFn(`✈ APPROACHING ${planetName.toUpperCase()}...`);
        },
        onUpdate: () => {
            // Smoothly look at destination during travel
            const curTarget = new THREE.Vector3();
            targetMesh.getWorldPosition(curTarget);
            controls.target.lerp(curTarget, 0.08);
        }
    });

    // ==========================================
    // PHASE 2: ORBIT (180° cinematic sweep)
    // ==========================================
    const orbitState = { angle: entryAngle };

    currentTimeline.to(orbitState, {
        duration: CINEMATIC_CONFIG.orbitDuration,
        angle: entryAngle + CINEMATIC_CONFIG.orbitAngle,
        ease: CINEMATIC_CONFIG.easing.orbit,
        onStart: () => {
            // Show info card with animation
            if (showInfoFn) showInfoFn(planetName);
            if (updateHudTargetFn) updateHudTargetFn(`★ ${planetName.toUpperCase()} ★`);
        },
        onUpdate: () => {
            if (!isTourActive) return;
            const curTarget = new THREE.Vector3();
            targetMesh.getWorldPosition(curTarget);

            // Smooth circular orbit
            const cx = curTarget.x + Math.cos(orbitState.angle) * distance;
            const cz = curTarget.z + Math.sin(orbitState.angle) * distance;

            camera.position.set(cx, orbitStartPos.y, cz);
            controls.target.copy(curTarget);
        }
    });

    // ==========================================
    // PHASE 3: ELEVATION (Gentle ascent + zoom out)
    // ==========================================
    currentTimeline.to(camera.position, {
        duration: CINEMATIC_CONFIG.elevationDuration,
        y: `+=${CINEMATIC_CONFIG.elevationHeight}`,
        ease: CINEMATIC_CONFIG.easing.elevation,
        onUpdate: () => {
            if (!isTourActive) return;
            const curTarget = new THREE.Vector3();
            targetMesh.getWorldPosition(curTarget);
            controls.target.copy(curTarget);
        }
    });

    // ==========================================
    // PHASE 4: DEPARTURE (Rise and prepare for next)
    // ==========================================
    currentTimeline.to(camera.position, {
        duration: CINEMATIC_CONFIG.departureDuration,
        y: `+=${CINEMATIC_CONFIG.departureHeight - CINEMATIC_CONFIG.elevationHeight}`,
        ease: CINEMATIC_CONFIG.easing.departure,
        onStart: () => {
            // Hide info panel before departure
            const infoPanel = document.getElementById('info-panel');
            if (infoPanel) {
                infoPanel.classList.remove('active');
            }
        },
        onUpdate: () => {
            if (!isTourActive) return;
            const curTarget = new THREE.Vector3();
            targetMesh.getWorldPosition(curTarget);
            controls.target.lerp(curTarget, 0.1);
        }
    });
}

// ==========================================
// 🏁 TOUR FINISH
// ==========================================
function finishTour(camera, controls, updateHudTargetFn) {
    isTourActive = false;
    if (updateHudTargetFn) updateHudTargetFn("◈ FREE FLIGHT ◈");

    // Hide info panel
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) infoPanel.classList.remove('active');

    // Return to overview position
    const endPos = { x: 0, y: 150, z: 250 };

    gsap.to(camera.position, {
        duration: 4,
        x: endPos.x,
        y: endPos.y,
        z: endPos.z,
        ease: "power2.inOut"
    });

    gsap.to(controls.target, {
        duration: 4,
        x: 0,
        y: 0,
        z: 0,
        ease: "power2.inOut"
    });
}

// ==========================================
// 🚀 PUBLIC API
// ==========================================

export function startCinematicTour(camera, controls, planets, sun, showInfoFn, updateHudTargetFn) {
    if (isTourActive) {
        stopTour();
        return false;
    }

    isTourActive = true;
    currentTourIndex = 0;

    if (updateHudTargetFn) updateHudTargetFn("★ COSMIC JOURNEY BEGINS ★");

    // Hide any open info panel before starting
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) infoPanel.classList.remove('active');

    setTimeout(() => {
        if (isTourActive) animateTourSequence(camera, controls, planets, sun, showInfoFn, updateHudTargetFn);
    }, 800);

    return true;
}

export function stopTour() {
    isTourActive = false;
    if (currentTimeline) {
        currentTimeline.kill();
        currentTimeline = null;
    }
    gsap.killTweensOf({});

    // Hide info panel on stop
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) infoPanel.classList.remove('active');
}

export function isTourRunning() {
    return isTourActive;
}
