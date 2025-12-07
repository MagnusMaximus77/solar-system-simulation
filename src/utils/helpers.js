
import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
export const loadTextureSafe = (path) => textureLoader.load(path);

export function createOrbit(scene, radius) {
    const points = []; for (let i = 0; i <= 360; i++) points.push(new THREE.Vector3(Math.cos(i / 360 * Math.PI * 2) * radius, 0, Math.sin(i / 360 * Math.PI * 2) * radius));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbit = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.12 }));
    scene.add(orbit); return orbit;
}

export function createDwarfOrbit(scene, radius, tiltX = 0, tiltZ = 0) {
    const points = []; for (let i = 0; i <= 360; i++) points.push(new THREE.Vector3(Math.cos(i / 360 * Math.PI * 2) * radius, 0, Math.sin(i / 360 * Math.PI * 2) * radius));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbit = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.1 }));
    orbit.rotation.x = tiltX; orbit.rotation.z = tiltZ; scene.add(orbit); return orbit;
}

export function createLabel(text) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const ctx = c.getContext('2d');
    ctx.font = 'Bold 36px "Segoe UI", sans-serif'; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.shadowColor = "black"; ctx.shadowBlur = 4;
    ctx.fillText(text.toUpperCase(), 128, 44);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
    s.scale.set(4, 1, 1); return s;
}

export function createStarTexture() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const ctx = c.getContext('2d');
    ctx.fillStyle = 'white'; ctx.shadowBlur = 10; ctx.shadowColor = 'white';
    ctx.beginPath(); ctx.ellipse(32, 32, 25, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(32, 32, 2, 25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(32, 32, 6, 0, Math.PI * 2); ctx.fill();
    return new THREE.CanvasTexture(c);
}

export function createParticleTexture() {
    const c = document.createElement('canvas'); c.width = 32; c.height = 32; const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'white'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c);
}
