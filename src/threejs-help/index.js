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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 开启柔和阴影
    document.getElementById(elId).appendChild(renderer.domElement);

    // 光照
    // scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    // **关键步骤 2: 聚光灯或方向光 (产生阴影)**
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 15, 10); // 灯光位置
    directionalLight.target.position.set(0, 0, 0); // 灯光指向房间中心

    // **关键步骤 2a: 启用灯光投射阴影**
    directionalLight.castShadow = true;

    // **关键步骤 2b: 配置阴影属性 (重要!)**
    // 调整阴影相机边界，确保房间完全在阴影相机的视野内，以避免阴影被裁剪。
    const d = 15; // 阴影相机的投影范围
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.near = 0.5; // 最小距离
    directionalLight.shadow.camera.far = 50;  // 最大距离
    directionalLight.shadow.mapSize.width = 1024; // 阴影贴图分辨率
    directionalLight.shadow.mapSize.height = 1024; // 阴影贴图分辨率

    scene.add(directionalLight);

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
    return pointerLockControls
}

