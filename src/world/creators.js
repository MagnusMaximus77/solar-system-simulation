
import * as THREE from 'three';
import { loadTextureSafe, createLabel, createOrbit, createDwarfOrbit } from '../utils/helpers.js';
import { starVertexShader, starFragmentShader, sunVertexShader, sunFragmentShader, atmosphereVertexShader, atmosphereFragmentShader } from '../data/database.js';

export function createSun(scene) {
    const sunMat = new THREE.ShaderMaterial({
        uniforms: {
            globeTexture: { value: loadTextureSafe('./textures/sun.jpg') },
            time: { value: 0 }
        },
        vertexShader: sunVertexShader,
        fragmentShader: sunFragmentShader
    });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(5, 64, 64), sunMat);
    sun.userData = { name: "SUN", artisticSize: 5 };
    scene.add(sun);
    const label = createLabel("SUN");
    label.position.set(0, 6, 0);
    sun.add(label);
    return sun;
}

export function createStarfieldOverlay(scene) {
    const geo = new THREE.BufferGeometry();
    const count = 2500;
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count * 3; i += 3) {
        const r = 4000 + Math.random() * 6000;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        pos[i] = r * Math.sin(phi) * Math.cos(theta);
        pos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i + 2] = r * Math.cos(phi);
    }
    for (let i = 0; i < count; i++) sizes[i] = 1.5 + Math.random() * 2.0;

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const stars = new THREE.Points(geo, mat);
    stars.userData = { type: 'starfield' };
    scene.add(stars);
    return stars;
}

export function createAsteroidBelt(scene) {
    const count = 1500;
    const geo = new THREE.DodecahedronGeometry(0.15, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9, flatShading: true });
    const asteroidMesh = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 38 + Math.random() * 6;
        const y = (Math.random() - 0.5) * 0.1;
        dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        const s = 0.3 + Math.random() * 0.4;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        asteroidMesh.setMatrixAt(i, dummy.matrix);
    }
    scene.add(asteroidMesh);
    return asteroidMesh;
}

export function createPlanetSystem(scene, planets, config) {
    const { name, size, texture, distance, speed, ring, color } = config;

    // Special settings for Saturn - emissive off (texture is too bright)
    const isSaturn = name === "Saturn";

    const mat = new THREE.MeshStandardMaterial({
        map: loadTextureSafe(`./textures/${texture}`),
        color: 0xffffff,
        roughness: isSaturn ? 0.85 : 0.75,
        metalness: 0.0,
        emissive: isSaturn ? 0x000000 : 0x111111,
        emissiveMap: isSaturn ? null : loadTextureSafe(`./textures/${texture}`),
        emissiveIntensity: isSaturn ? 0 : 0.08
    });

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 64, 64), mat);
    mesh.userData = { name: name, artisticSize: size, artisticDist: distance, trueSize: size * 0.3, trueDist: distance * 8 };

    if (ring) {
        const rGeo = new THREE.RingGeometry(ring.inner, ring.outer, 128);
        const pos = rGeo.attributes.position;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            rGeo.attributes.uv.setXY(i, v3.length() < (ring.inner + ring.outer) / 2 ? 0 : 1, 1);
        }
        const rMat = new THREE.MeshStandardMaterial({ map: loadTextureSafe(`./textures/${ring.tex}`), side: THREE.DoubleSide, transparent: true, opacity: 0.9, color: 0xffffff });
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.rotation.x = -Math.PI / 2;
        mesh.add(rMesh);
        mesh.userData.ring = rMesh;
    }

    const label = createLabel(name);
    label.position.set(0, size + 0.8, 0);
    mesh.add(label);
    mesh.userData.label = label;

    if (texture.includes("earth")) {
        const clouds = new THREE.Mesh(
            new THREE.SphereGeometry(size + 0.02, 64, 64),
            new THREE.MeshStandardMaterial({ map: loadTextureSafe('./textures/clouds.jpg'), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })
        );
        mesh.add(clouds);
        mesh.userData.clouds = clouds;

        // Atmosphere glow
        const atmoGeo = new THREE.SphereGeometry(size + 0.15, 64, 64);
        const atmoMat = new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
        mesh.add(atmosphere);

        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 32, 32),
            new THREE.MeshStandardMaterial({ map: loadTextureSafe('./textures/moon.jpg'), roughness: 0.6 })
        );
        moon.userData = { name: "Moon", isMoon: true, parentPlanet: mesh, moonAngle: 0, moonDist: 4 };
        scene.add(moon);
        planets.push({ mesh: moon, type: 'moon' });
    }

    const orbit = createOrbit(scene, distance);
    planets.push({ mesh: mesh, distance: distance, speed: speed, name: name, type: 'planet', orbit: orbit });
    scene.add(mesh);
}

export function createDwarfPlanet(scene, planets, config) {
    const { name, size, texture, color, distance, speed, tiltX, tiltZ } = config;
    let mat;
    if (texture) {
        mat = new THREE.MeshStandardMaterial({ map: loadTextureSafe(`./textures/${texture}`), roughness: 0.8, color: 0xffffff });
    } else {
        mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
    }
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 32, 32), mat);
    mesh.userData = { name: name, artisticSize: size, artisticDist: distance, trueSize: size * 0.3, trueDist: distance * 8 };

    const label = createLabel(name);
    label.scale.set(3, 0.75, 1);
    label.position.set(0, size + 0.5, 0);
    mesh.add(label);
    mesh.userData.label = label;

    const orbit = createDwarfOrbit(scene, distance, tiltX, tiltZ);
    planets.push({ mesh: mesh, distance: distance, speed: speed, name: name, type: 'dwarf', orbitRef: orbit });
    scene.add(mesh);
}
