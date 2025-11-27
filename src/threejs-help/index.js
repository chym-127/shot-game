import * as THREE from 'three';
import { onMounted, onUnmounted } from 'vue';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

export const useBaseScene = (elId) => {
    let scene, camera, renderer;
    // 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = 'canvas-area'; // 给画布一个ID
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // 色调映射
    renderer.toneMappingExposure = 0.7; // 曝光度，默认为 1
    document.getElementById(elId).appendChild(renderer.domElement);

    // 光照
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize);

    onUnmounted(() => {
        window.removeEventListener('resize', onWindowResize);
    })

    return [scene, camera, renderer]
}

export const useOrbitControls = ({ scene, camera, renderer }) => {
    let orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.target.set(0, 1, 0);
    return orbitControls
}


export const usePointerLockControls = ({ scene, camera, renderer }) => {
    let pointerLockControls = new PointerLockControls(camera, renderer.domElement);
    const updatePointerSpeed = (pointerSpeed) => {
        pointerLockControls.pointerSpeed = pointerSpeed;
    }
    return [pointerLockControls, updatePointerSpeed]
}

