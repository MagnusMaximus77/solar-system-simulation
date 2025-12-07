
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { loadTextureSafe } from '../utils/helpers.js';

export function initScene() {
    // ==========================================
    // 3. SAHNE VE KAMERA
    // ==========================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(0, 100, 180);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.maxDistance = 5000;
    controls.minDistance = 1.5;
    controls.screenSpacePanning = true;

    // ==========================================
    // 4. EFEKTLER
    // ==========================================
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.3; bloomPass.strength = 0.7; bloomPass.radius = 0.4; // Yumuşak bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // ==========================================
    // 5. AYDINLATMA & ARKAPLAN
    // ==========================================
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(10000, 64, 64), new THREE.MeshBasicMaterial({ map: loadTextureSafe('./textures/stars_milky_way.jpg'), side: THREE.BackSide, color: 0xffffff })));

    const sunLight = new THREE.PointLight(0xffeedd, 1.0, 0, 0); // 1.5 -> 1.0 (daha yumuşak)
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    scene.add(new THREE.AmbientLight(0x404050, 0.6)); // 0.4 -> 0.6 (gölgeleri yumuşat)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.3)); // 0.2 -> 0.3

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, controls, composer, sunLight };
}
