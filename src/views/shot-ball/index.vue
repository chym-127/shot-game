<template>
    <div id="threejs-wrap" class="w-screen h-screen">
    </div>
</template>


<script setup>
import * as THREE from 'three';
import Stats from 'stats.js'
import { useBaseScene, useOrbitControls } from '@/threejs-help/index.js'
import { createPbrMaterial } from '@/threejs-help/utils.js'
import { onMounted } from 'vue'


let scene, camera, renderer, orbitControls;
let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

const ROOM_WIDTH = 12;
const ROOM_HEIGHT = 5;
const ROOM_DEPTH = 26;
const WALL_TEXTURE_PATHS = {
    colorMap: 'https://cs2-file.chym.site/shot-game/textures/mixed_brick_wall_diff_1k.jpg',
    normalMap: 'https://cs2-file.chym.site/shot-game/textures/mixed_brick_wall_nor_gl_1k.jpg',
    armMap: 'https://cs2-file.chym.site/shot-game/textures/mixed_brick_wall_arm_1k.jpg', // R: AO, G: Roughness, B: Metalness
};

const FLOOR_TEXTURE_PATHS = {
    colorMap: 'https://cs2-file.chym.site/shot-game/textures/rock_tile_floor_diff_1k.jpg',
    normalMap: 'https://cs2-file.chym.site/shot-game/textures/rock_tile_floor_nor_gl_1k.jpg',
    armMap: 'https://cs2-file.chym.site/shot-game/textures/rock_tile_floor_arm_1k.jpg', // R: AO, G: Roughness, B: Metalness
};

function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.end();
}

function createRoomWithPBRTextures() {
    // 地面
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH),
        createPbrMaterial(FLOOR_TEXTURE_PATHS, {
            repeatX: ROOM_WIDTH * 0.2,
            repeatY: ROOM_DEPTH * 0.2,
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);
    // 后墙
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT),
        createPbrMaterial(WALL_TEXTURE_PATHS, {
            repeatX: ROOM_WIDTH * 0.2,
            repeatY: ROOM_HEIGHT * 0.2,
        })
    );
    backWall.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2);
    scene.add(backWall);

    // 前墙
    const frontWall = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT),
        createPbrMaterial(WALL_TEXTURE_PATHS, {
            repeatX: ROOM_WIDTH * 0.2,
            repeatY: ROOM_HEIGHT * 0.2,
        })
    );
    frontWall.position.set(0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2);
    scene.add(frontWall);

    // 左墙
    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT),
        createPbrMaterial(WALL_TEXTURE_PATHS, {
            repeatX: ROOM_DEPTH * 0.2,
            repeatY: ROOM_HEIGHT * 0.2,
        })
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
    scene.add(leftWall);

    // 右墙
    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT),
        createPbrMaterial(WALL_TEXTURE_PATHS, {
            repeatX: ROOM_DEPTH * 0.2,
            repeatY: ROOM_HEIGHT * 0.2,
        })
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
    scene.add(rightWall);
}

onMounted(() => {
    document.body.appendChild(stats.dom);
    [scene, camera, renderer] = useBaseScene('threejs-wrap', animate)
    orbitControls = useOrbitControls({ scene, camera, renderer })
    createRoomWithPBRTextures()
    console.log(scene, camera, renderer, orbitControls);
    animate()
})
</script>