import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

export const loadSounds = (url, {
    camera, success, volume = 0.3, fail
}) => {
    // 创建音频监听器并添加到相机
    let listener = new THREE.AudioListener();
    camera.add(listener);
    let sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(url, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(volume); // 设置音量
        success(sound)
    }, undefined, function (error) {
        fail(error)
    });
}

export const createPbrMaterial = (TEXTURE_PATHS, {
    repeatX = 1, repeatY = 1,
    roughness = 1.0, metalness = 0.0
}) => {
    const textureLoader = new THREE.TextureLoader();
    // 异步加载所有贴图
    const colorTexture = textureLoader.load(TEXTURE_PATHS.colorMap);
    const normalTexture = textureLoader.load(TEXTURE_PATHS.normalMap);
    const armTexture = textureLoader.load(TEXTURE_PATHS.armMap);
    [colorTexture, normalTexture, armTexture].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
    });
    // 1. 创建 PBR 材质
    const pbrMaterial = new THREE.MeshStandardMaterial({
        map: colorTexture,
        normalMap: normalTexture,

        // ⭐ 处理 ARM 贴图 ⭐
        roughnessMap: armTexture, // Three.js 自动使用绿色通道 (G) 作为粗糙度
        metalnessMap: armTexture,  // Three.js 自动使用蓝色通道 (B) 作为金属度
        aoMap: armTexture,         // Three.js 自动使用红色通道 (R) 作为 AO

        // 确保 Roughness 和 Metalness 的基础值在 0-1 范围内
        roughness: roughness,
        metalness: metalness,

        side: THREE.DoubleSide
    });
    pbrMaterial.magFilter = THREE.NearestFilter;
    return pbrMaterial;
}




export const setupEnvironment = (url, scene) => {
    // ⭐ 使用 EXRLoader 加载 HDR 文件 ⭐
    const exrLoader = new EXRLoader();

    exrLoader.load(url, (texture) => {
        // 设置编码 (如果需要)
        texture.mapping = THREE.EquirectangularReflectionMapping;
        // 1. 设置场景背景 (渲染天空盒)
        scene.background = texture;
        // 2. 设置场景环境光 (用于照亮 PBR 材质)
        scene.environment = texture;
        console.log("EXR 环境贴图加载完成。");
    }, undefined, (error) => {
        console.error("加载 EXR 贴图失败:", error);
        scene.background = new THREE.Color(0x333333);
    });
}



function spawnSingleTarget() {
    const minX = -ROOM_WIDTH / 2 + TARGET_RADIUS;
    const maxX = ROOM_WIDTH / 2 - TARGET_RADIUS;
    const minY = TARGET_RADIUS;
    const maxY = ROOM_HEIGHT - TARGET_RADIUS;

    const Z_near = TARGET_Z_MIN; // 例如 -3.9
    const Z_far = TARGET_Z_MAX; // 例如 -4.6

    let targetX, targetY, targetZ;
    let positionValid = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 50;

    // ⭐ 碰撞检测循环 ⭐
    while (!positionValid && attempts < MAX_ATTEMPTS) {
        attempts++;
        positionValid = true; // 假设有效

        // 1. 随机生成一个候选位置
        targetX = THREE.MathUtils.randFloat(minX, maxX);
        targetY = THREE.MathUtils.randFloat(minY, maxY);
        targetZ = THREE.MathUtils.randFloat(Z_far, Z_near);

        const candidatePosition = new THREE.Vector3(targetX, targetY, targetZ);

        // 2. 检查与所有现有目标是否相交
        for (const existingTarget of targets) {

            // ⭐ 核心修改：使用 distanceTo() 并手动求平方 ⭐
            const distance = existingTarget.position.distanceTo(candidatePosition);
            const distanceSquared = distance * distance; // 或者 Math.pow(distance, 2)

            // 如果距离的平方小于最小安全距离的平方，则发生碰撞
            if (distanceSquared < MIN_DISTANCE_SQUARED) {
                positionValid = false; // 位置无效
                break; // 发现碰撞，跳出内部循环，重新尝试新的位置
            }
        }
    }

    if (attempts >= MAX_ATTEMPTS) {
        console.warn("无法找到无碰撞的目标生成位置。");
        return;
    }
    // ⭐ 碰撞检测循环结束 ⭐

    const geometry = new THREE.SphereGeometry(TARGET_RADIUS, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: TARGET_COLOR,
        roughness: TARGET_ROUGHNESS,
        metalness: TARGET_METALNESS,
        envMap: scene.environment,
        envMapIntensity: 1.0
    });

    const newTarget = new THREE.Mesh(geometry, material);
    newTarget.position.set(targetX, targetY, targetZ);

    scene.add(newTarget);
    targets.push(newTarget);
}



/**
 * 查找一个随机点，使得以该点为中心放置的新几何体不与现有几何体相交。
 *
 * @param {THREE.Object3D} containerA - 容器几何体 A (例如一个 Mesh 或 Group)。
 * @param {THREE.Object3D[]} obstaclesB - 现有障碍几何体数组 B (所有障碍体大小形状一致)。
 * @param {THREE.Object3D} referenceB - 障碍几何体的参考对象，用于获取其大小。
 * @param {number} maxAttempts - 最大尝试次数，防止死循环。
 * @returns {THREE.Vector3 | null} 找到的有效随机点，或 null (如果失败)。
 */
export const findValidPlacementPoint = (containerA, obstaclesB, referenceB, maxAttempts = 100) => {
    // 1. **预计算边界**
    // 容器 A 的全局边界 (Box3)
    const containerBounds = new THREE.Box3().setFromObject(containerA);

    // 测试几何体 B 的本地大小 (Box3)
    // 这是一个关键步骤：计算我们要放置的新物体的大小。
    const referenceBounds = new THREE.Box3().setFromObject(referenceB);
    const referenceSize = new THREE.Vector3();
    referenceBounds.getSize(referenceSize);

    // 障碍体 B 数组的全局边界 (Box3) 
    // 预先计算可以加快循环内的碰撞检测
    const obstacleBoundsB = obstaclesB.map(obj => new THREE.Box3().setFromObject(obj));

    // 2. **迭代采样**

    // 临时 Vector3 实例，避免在循环内重复创建对象
    const randomPoint = new THREE.Vector3();

    for (let i = 0; i < maxAttempts; i++) {
        // A. 在容器 A 的边界内随机生成一个点
        randomPoint.x = THREE.MathUtils.randFloat(containerBounds.min.x, containerBounds.max.x);
        randomPoint.y = THREE.MathUtils.randFloat(containerBounds.min.y, containerBounds.max.y);
        randomPoint.z = THREE.MathUtils.randFloat(containerBounds.min.z, containerBounds.max.z);

        // B. 检查随机点是否真的在几何体 A 的内部 (如果 A 是球体或非Box形状，这很重要)
        // 注意：如果 containerA 是 Mesh，且形状是长方体，这一步可以省略。
        // 如果是球体或其他复杂形状，你需要额外的 Raycasting 或距离检查。
        // 为了通用性，我们假设随机点在 Box3 内就足够了。

        // C. 以该随机点为中心，创建一个测试用的包围盒 B_test
        const testBox = new THREE.Box3();
        // 设置 Box 的 min 和 max 角点，确保 Box 的中心在 randomPoint
        testBox.min.copy(randomPoint).sub(referenceSize.clone().divideScalar(2));
        testBox.max.copy(randomPoint).add(referenceSize.clone().divideScalar(2));

        // D. 检查 B_test 是否与任何障碍物 B 相交
        let intersects = false;

        for (const obstacleBox of obstacleBoundsB) {
            if (testBox.intersectsBox(obstacleBox)) {
                intersects = true;
                break; // 发现相交，立即跳出内层循环
            }
        }

        // E. 成功找到有效点
        if (!intersects) {
            return randomPoint;
        }
    }

    // 3. **失败处理**
    console.warn(`Failed to find a valid placement point after ${maxAttempts} attempts.`);
    return null;
}