<template>
    <div>
        <div>
            <div id="game-over-screen" v-if="status >= 2">
                <template v-if="status === 3">
                    <div class="game-over-title">
                        <span>游戏结束 (GAME OVER)</span>
                    </div>

                    <div class="stats-grid single-row-grid">
                        <div class="stat-item">
                            <div class="label">每分钟击杀 (KPM)</div>
                            <div class="value primary-highlight">{{ kpm }}</div>
                        </div>

                        <div class="stat-item">
                            <div class="label">命中率 (Accuracy)</div>
                            <div class="value primary-highlight">{{ hit_rate }}%</div>
                        </div>

                    </div>
                </template>

                <div class="flex gap-2">
                    <g-button :disabled="btn_disabled" v-if="status === 2" @click="startGame">继续游戏</g-button>
                    <g-button :disabled="btn_disabled" variant="danger" @click="restartGame">重新开始</g-button>
                </div>
            </div>
            <div id="start-game-screen" v-if="status === 0">
                <g-button :disabled="btn_disabled" @click="restartGame()">开始游戏</g-button>
            </div>

            <div id="settings">
                <g-button variant='pixel' @click="showSetting = true">设置</g-button>
            </div>
            <div id="stats-hud">
                <div
                    style="font-family: Arial, sans-serif; color: white; background-color: rgba(0, 0, 0, 0.5); padding: 15px; border-radius: 8px; width: 100%; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 10px;">
                        KPM : <span style="color: #4CAF50;">{{ kpm }}</span>
                    </div>
                    <div style="font-size: 20px; margin-bottom: 10px;">
                        命中: <span style="color: #FF5722;">{{ hits }}/{{ shotsFired }}</span><span
                            style="color: #cccccc;">({{ hit_rate }}%)</span>
                    </div>
                    <div style="font-size: 20px;">
                        倒计时: <span style="color: #cccccc;">{{ timeLeft.toFixed(2) }}s</span>
                    </div>
                </div>
            </div>
            <div id="crosshair">
                <div class="horizontal-line"></div>
                <div class="vertical-line"></div>
            </div>

        </div>

        <GModal :visible="showSetting" @update:visible="showSetting = $event" title="🏆 游戏设置" :width="'750px'"
            :closable="true" :maskClosable="true">
            <div>
                <GSettingItem label="用户名" type="text" v-model="settings.username" placeholder="输入您的角色名称" />
                <GSettingItem label="鼠标灵敏度" type="number" v-model="settings.sensitivity" placeholder="0.1 - 2.0" />
                <GSettingItem label="每局游戏时长" type="number" v-model="settings.game_duration" placeholder="秒" />
                <GSettingItem label="小球大小" type="number" v-model="settings.ball_size" placeholder="1-10" />
            </div>

            <template #footer>
                <GButton variant="primary" @click="saveSetting">
                    保存
                </GButton>
                <GButton class="ml-2" variant="secondary" @click="showSetting = false">
                    取消
                </GButton>
            </template>
        </GModal>
        <div id="threejs-wrap" class="w-screen h-screen">
        </div>
    </div>
</template>


<script setup>
import * as THREE from 'three';
import Stats from 'stats.js'
import { useBaseScene, usePointerLockControls } from '@/threejs-help/index.js'
import { createPbrMaterial, setupEnvironment, findValidPlacementPoint, loadSounds } from '@/threejs-help/utils.js'
import { onMounted, ref, reactive } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { emitter } from '../../eventBus.js'

let showSetting = ref(false);

const settings = reactive({
    username: '',
    sensitivity: 1,
    game_duration: 30,
    ball_size: 3
})
let str = localStorage.getItem('settings')
if (str) {
    Object.assign(settings, JSON.parse(str))
}
function saveSetting() {
    localStorage.setItem('settings', JSON.stringify(settings))
    showSetting.value = false
    BALL_RADIUS = settings.ball_size
    if (GAME_DURATION.value != settings.game_duration) {
        GAME_DURATION.value = settings.game_duration
        timeLeft.value = GAME_DURATION.value
        status.value = 0
    }
    if (pointerLockControls && settings.sensitivity) {
        pointerLockControls.pointerSpeed = settings.sensitivity
    }
}


let scene, camera, renderer, sunLight, pointerLockControls;
let ballContainer, ballMesh
let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom


// ⭐ 球体颜色和 PBR 属性 ⭐
let BALL_RADIUS = settings.ball_size / 10; // 球体半径
const BALL_COLOR = 0xfbc531; // 暗红色
const BALL_ROUGHNESS = 0.9; // 适中粗糙度，有一定反射
const BALL_METALNESS = 0.3; // 有点金属感
let balls = []



const ROOM_WIDTH = 12;
const ROOM_HEIGHT = 5;
const ROOM_DEPTH = 12;
const WALL = 'rock_wall_11'
const WALL_TEXTURE_PATHS = getTextureUrls(WALL)
const FLOOR = 'rock_tile_floor'
const FLOOR_TEXTURE_PATHS = getTextureUrls(FLOOR)

const ENV_URL = 'https://cs2-file.chym.site/shot-game/exr/horn-koppe_spring_1k.exr'

let GAME_DURATION = +settings.game_duration || 30; // 游戏持续时间（秒）

let timeLeft = ref(GAME_DURATION);
let isGameOver = ref(false);
let btn_disabled = ref(false)
let score = ref(0);
let kpm = ref('')
let hit_rate = ref('')
let shotsFired = ref(0);
let hits = ref(0);
let status = ref(0) //0 未开始 1进行中 2暂停中  3游戏结束
let clock = new THREE.Clock()
let raycaster = new THREE.Raycaster();

function getTextureUrls(name) {
    return {
        colorMap: `https://cs2-file.chym.site/shot-game/textures/${name}_diff_1k.jpg`,
        normalMap: `https://cs2-file.chym.site/shot-game/textures/${name}_nor_gl_1k.jpg`,
        armMap: `https://cs2-file.chym.site/shot-game/textures/${name}_arm_1k.jpg`, // R: AO, G: Roughness, B: Metalness
    };
}


// 假设你有一个数组来存储所有需要处理的球体对象
const fadingObjects = [];
// 消失的速度，可以作为常量
const FADE_SPEED = 0.1;

// --- 核心配置参数 ---
const NUM_PARTICLES = 30; // 每个爆炸效果的粒子数量
const EXPLOSION_RANGE = 4; // 粒子扩散的最大距离
const ANIMATION_DURATION_FRAMES = 80; // 动画总帧数 (例如：2秒)
const PARTICLE_SIZE = 0.05;

const colors = [
    0xff0000, 0x00ff00, 0x0000ff,
    0xffff00, 0xff00ff, 0x00ffff,
    0xffa500, 0x800080, 0x008000,
    0x87ceeb, 0xffc0cb, 0xa9a9a9
];

// --- 2. 爆炸实例管理数组 ---
const activeExplosions = [];

/**
 * @method generateExplosion
 * @param {THREE.Vector3} centerPosition - 爆炸发生的中心位置
 * @description 创建一个新的粒子效果实例并添加到场景和管理数组中。
 */
function generateExplosion(centerPosition) {
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(NUM_PARTICLES * 3);
    const initialPositions = new Float32Array(NUM_PARTICLES * 3);
    const velocities = new Float32Array(NUM_PARTICLES * 3);
    const colorsAttribute = new Float32Array(NUM_PARTICLES * 3);

    // 为每个粒子设置数据
    for (let i = 0; i < NUM_PARTICLES; i++) {
        const idx = i * 3;

        // --- 初始位置 (在中心点附近随机分布) ---
        // 使用一个小的随机球体范围
        const radius = Math.random() * 0.5;
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;

        const x = centerPosition.x + radius * Math.sin(theta) * Math.cos(phi);
        const y = centerPosition.y + radius * Math.sin(theta) * Math.sin(phi);
        const z = centerPosition.z + radius * Math.cos(theta);

        initialPositions[idx] = x;
        initialPositions[idx + 1] = y;
        initialPositions[idx + 2] = z;

        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = z;

        // --- 扩散方向 ---
        // 扩散向量基于初始位置相对于爆炸中心的位置
        const directionVector = new THREE.Vector3(x - centerPosition.x, y - centerPosition.y, z - centerPosition.z).normalize();

        // 确保至少有一个方向（防止在中心点的粒子）
        if (directionVector.length() === 0) {
            directionVector.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        }

        // 乘以一个随机的扩散距离
        const maxDistance = EXPLOSION_RANGE * (0.5 + Math.random() * 0.5);
        directionVector.multiplyScalar(maxDistance);

        velocities[idx] = directionVector.x;
        velocities[idx + 1] = directionVector.y;
        velocities[idx + 2] = directionVector.z;

        // --- 颜色 ---
        const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
        colorsAttribute[idx] = color.r;
        colorsAttribute[idx + 1] = color.g;
        colorsAttribute[idx + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsAttribute, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: PARTICLE_SIZE,
        sizeAttenuation: true,
        // transparent: true,
        // opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 将爆炸实例数据添加到管理数组
    activeExplosions.push({
        mesh: particlesMesh,
        geometry: particlesGeometry,
        material: particlesMaterial,
        initialPositions: initialPositions, // 存储初始位置
        velocities: velocities,             // 存储扩散向量
        frameCount: 0                       // 当前帧计数
    });

}

/**
 * @method updateExplosion
 * @description 在 animate 循环中调用，更新所有活动的爆炸效果。
 */
function updateExplosion() {
    // 从后往前遍历数组，方便在移除元素时不会打乱循环
    for (let i = activeExplosions.length - 1; i >= 0; i--) {
        const explosion = activeExplosions[i];
        explosion.frameCount++;

        const progress = explosion.frameCount / ANIMATION_DURATION_FRAMES; // 进度 (0到1)

        if (progress >= 1.0) {
            // 动画结束，移除粒子
            scene.remove(explosion.mesh);
            explosion.geometry.dispose(); // 释放内存
            explosion.material.dispose();
            activeExplosions.splice(i, 1); // 从管理数组中移除
            continue; // 继续下一个循环
        }

        // --- 1. 更新粒子位置 ---
        const currentPositions = explosion.geometry.getAttribute('position');
        for (let j = 0; j < NUM_PARTICLES; j++) {
            const idx = j * 3;
            // 插值计算当前位置：初始位置 + 扩散向量 * 进度
            currentPositions.array[idx] = explosion.initialPositions[idx] + explosion.velocities[idx] * progress;
            currentPositions.array[idx + 1] = explosion.initialPositions[idx + 1] + explosion.velocities[idx + 1] * progress;
            currentPositions.array[idx + 2] = explosion.initialPositions[idx + 2] + explosion.velocities[idx + 2] * progress;
        }
        currentPositions.needsUpdate = true;

        // --- 2. 更新粒子透明度 (让粒子在动画后半段消失) ---
        let opacityProgress;
        if (progress <= 0.5) {
            opacityProgress = 1.0; // 前一半时间保持完全不透明
        } else {
            // 后一半时间从 1 线性递减到 0
            opacityProgress = 1.0 - (progress - 0.5) * 2;
        }
        explosion.material.opacity = Math.max(0, opacityProgress);
    }
}


function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    // ⭐ 计时器逻辑 ⭐
    if (status.value !== 3 && pointerLockControls.isLocked) {
        const delta = clock.getDelta(); // 获取两帧之间的时间差
        timeLeft.value -= delta;

        kpm.value = Math.floor(hits.value / ((GAME_DURATION - timeLeft.value) / 60))
        if (timeLeft.value <= 0) {
            timeLeft.value = 0;
            endGame();
        }
    } else {
        // 如果不是在游戏模式或游戏已结束，则只获取 delta 不使用
        clock.getDelta();
    }
    // 在每一帧调用更新函数
    updateExplosion();

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
    floor.receiveShadow = true;
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
    backWall.castShadow = true;
    backWall.receiveShadow = true;
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
    frontWall.receiveShadow = true;
    frontWall.castShadow = true;
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
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
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
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
    scene.add(rightWall);

    const containerGeometry = new THREE.BoxGeometry(ROOM_WIDTH - 1, ROOM_HEIGHT - 1, 2);
    const containerMaterial = new THREE.MeshBasicMaterial({ color: 0x8888ff, transparent: true, opacity: 0 });
    ballContainer = new THREE.Mesh(containerGeometry, containerMaterial);
    ballContainer.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 1);
    scene.add(ballContainer);

    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: BALL_COLOR,
        roughness: BALL_ROUGHNESS,
        metalness: BALL_METALNESS,
        envMap: scene.environment,
        envMapIntensity: 1.0
    });
    ballMesh = new THREE.Mesh(geometry, material);
}


function restartGame() {
    btn_disabled.value = true
    score.value = 0;
    shotsFired.value = 0;
    hits.value = 0;
    timeLeft.value = GAME_DURATION;
    isGameOver.value = false;
    balls.forEach(target => scene.remove(target));
    balls = [];
    spawnTargets();
    if (!pointerLockControls.isLocked) {
        pointerLockControls.lock();
        status.value = 1
    }
}


function startGame() {
    btn_disabled.value = true

    if (!pointerLockControls.isLocked) {
        pointerLockControls.lock();
        status.value = 1
    }
}

function endGame() {
    if (status.value === 3) return;
    status.value = 3;

    // 解锁控制器，停止射线投射
    if (pointerLockControls.isLocked) {
        pointerLockControls.unlock();
    }
}

let updatePointerSpeed = null

function spawnSingleTarget() {
    const safePoint = findValidPlacementPoint(ballContainer, balls, ballMesh, 500);
    if (safePoint) {
        const geometry = new THREE.SphereGeometry(BALL_RADIUS, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: BALL_COLOR,
            roughness: BALL_ROUGHNESS,
            metalness: BALL_METALNESS,
            envMap: scene.environment,
            envMapIntensity: 1.0
        });
        let newBallMesh = new THREE.Mesh(geometry, material);
        newBallMesh.position.copy(safePoint);
        scene.add(newBallMesh);
        balls.push(newBallMesh)
    } else {
        console.log("Could not find a safe spot.");
    }
}

function spawnTargets(num = 5) {
    for (let i = 0; i < num; i++) {
        spawnSingleTarget()
    }
}
let soundShot = null
let soundBalloon = null
let soundEnd = null

function onShoot(event) {
    if (event.button === 0 && pointerLockControls.isLocked) { // 仅在 FPS 模式且左键点击时
        // ⭐ 1. 增加开火次数 ⭐
        shotsFired.value++;
        if (soundShot && soundShot.buffer) {
            if (soundShot.isPlaying) {
                soundShot.stop();
            }
            soundShot.play();
        }
        // ⭐ 1. 射线检测 ⭐
        raycaster.setFromCamera({ x: 0, y: 0 }, camera); // 从相机中心发射射线
        const intersects = raycaster.intersectObjects(balls);
        if (intersects.length > 0) {
            // 击中目标
            const hitTarget = intersects[0].object;
            // ⭐ 2. 命中! 增加得分和命中次数 ⭐
            hits.value++;
            score.value += 10; // 每次命中加 10 分

            // ⭐ 调用创建爆炸效果函数 ⭐
            // 移除被击中的球体
            generateExplosion(hitTarget.position)
            scene.remove(hitTarget);

            if (soundBalloon && soundBalloon.buffer) {
                if (soundBalloon.isPlaying) {
                    soundBalloon.stop();
                }
                soundBalloon.play();
            }

            hitTarget.geometry.dispose();
            hitTarget.material.dispose();

            balls = balls.filter(target => target !== hitTarget);
            spawnSingleTarget();
        }

        hit_rate.value = ((hits.value / shotsFired.value) * 100).toFixed(2)

    }
}

onMounted(() => {
    document.body.appendChild(stats.dom);
    [scene, camera, renderer, sunLight] = useBaseScene('threejs-wrap', animate)
    setupEnvironment(ENV_URL, scene)
    pointerLockControls = usePointerLockControls({ scene, camera, renderer })
    pointerLockControls.pointerSpeed = settings.sensitivity
    // PointerLock 锁定事件
    pointerLockControls.addEventListener('lock', () => {
        if (soundEnd && soundEnd.buffer && soundEnd.isPlaying) {
            soundEnd.stop();
        }
        btn_disabled.value = false
        // 锁定后隐藏菜单和提示
        document.addEventListener('mousedown', onShoot, false);
    });
    loadSounds('https://cs2-file.chym.site/shot-game/sound/shot.mp3', {
        camera: camera, success: (resp) => {
            soundShot = resp
        }, fail: () => { }
    })

    loadSounds('https://cs2-file.chym.site/shot-game/sound/balloon.mp3', {
        camera: camera, success: (resp) => {
            soundBalloon = resp
        }, fail: () => { }
    })

    loadSounds('https://cs2-file.chym.site/shot-game/sound/gameend.mp3', {
        camera: camera, success: (resp) => {
            soundEnd = resp
        }, fail: () => { }
    })

    // PointerLock 解锁事件
    pointerLockControls.addEventListener('unlock', () => {
        if (timeLeft.value <= 0) {
            if (soundEnd && soundEnd.buffer) {
                if (soundEnd.isPlaying) {
                    soundEnd.stop();
                }
                soundEnd.play();
            }
            status.value = 3
        } else {
            status.value = 2
        }
        document.removeEventListener('mousedown', onShoot, false);
        setTimeout(() => {
            btn_disabled.value = false
        }, 1000);
    });
    createRoomWithPBRTextures()
    animate()
})
</script>


<style scoped>
#crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 10;
}


#crosshair .horizontal-line,
#crosshair .vertical-line {
    position: absolute;
    background-color: #00FF00;
    /* 绿色 */
}

/* 水平线 */
#crosshair .horizontal-line {
    width: 5px;
    /* 总长度 */
    height: 1px;
    /* 粗细 */
    /* 相对于 #simple-crosshair 容器居中 */
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    /* 确保自身居中 */
}

/* 垂直线 */
#crosshair .vertical-line {
    width: 1px;
    /* 粗细 */
    height: 5px;
    /* 总长度 */
    /* 相对于 #simple-crosshair 容器居中 */
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    /* 确保自身居中 */
}

#game-over-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    z-index: 1000;
    display: flex;
    /* 确保在最顶层 */
    /* 默认隐藏 */
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}


#start-game-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    z-index: 1000;
    /* 确保在最顶层 */
    display: flex;
    /* 默认隐藏 */
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

/* ⭐ 统计信息 HUD 样式 ⭐ */
#stats-hud {
    position: absolute;
    top: 20px;
    width: 200px;
    right: 20px;
    z-index: 10;
    padding: 10px;
    color: white;
    font-size: 16px;
    line-height: 1.5;
}

#stats-hud p {
    margin: 0;
    white-space: nowrap;
}

/* ⭐ 计时器 HUD 样式 ⭐ */
#timer-hud {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    padding: 8px 15px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 5px;
    font-size: 20px;
    font-weight: bold;
    text-shadow: 1px 1px 2px black;
}

#settings {
    position: absolute;
    bottom: 20px;
    left: 20px;
    z-index: 9999;
}


.game-over-title {
    font-size: 36px;
    font-weight: 900;
    margin-bottom: 25px;
    color: #ff3333;
    text-shadow: 0 0 10px rgba(255, 51, 51, 0.8);
    transition: color 0.3s;
}

.game-over-title span:first-child {
    color: #00ffff;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.status-message {
    font-size: 18px;
    margin-bottom: 30px;
    color: #aaaaaa;
}

.new-record {
    color: #ffaa00;
    font-weight: bold;
    text-shadow: 0 0 5px rgba(255, 170, 0, 0.5);
}

/* --- 成绩网格布局 (调整为只有 1 行 2 列) --- */
.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    /* 行间距和列间距 */
    margin-bottom: 30px;
    padding: 10px;
    border: 1px dashed #333;
    border-radius: 5px;
}

.stat-item {
    text-align: center;
}

.label {
    font-size: 14px;
    color: #aaaaaa;
    text-transform: uppercase;
    margin-bottom: 5px;
}

.value {
    font-size: 32px;
    /* 稍微放大，突出仅有的两个数据 */
    font-weight: bold;
    line-height: 1.2;
}

.primary-highlight {
    color: #ffaa00;
    text-shadow: 0 0 8px rgba(255, 170, 0, 0.6);
}

/* --- 次要数据样式 --- */
.secondary-stats {
    font-size: 14px;
    color: #aaaaaa;
    margin-bottom: 30px;
}

.secondary-item {
    padding: 0 10px;
}
</style>