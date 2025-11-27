import * as THREE from 'three';

export const loadSounds = (url, {
    camera, success, fail
}) => {
    // 创建音频监听器并添加到相机
    let listener = new THREE.AudioListener();
    camera.add(listener);

    soundShot = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    // 加载射击音效
    audioLoader.load(url, function (buffer) {
        soundShot.setBuffer(buffer);
        soundShot.setLoop(false);
        soundShot.setVolume(0.5); // 设置音量
        success(soundShot)
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
        roughness: 1.0,
        metalness: 0.0,

        side: THREE.DoubleSide
    });
    pbrMaterial.magFilter = THREE.NearestFilter;
    return pbrMaterial;
}