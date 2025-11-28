<template>
    <div class="homepage-wrapper">
        <!-- <div id="game-screen" v-if="show">
            <GSettingsPanel>
                <GSettingItem label="用户名" type="text" v-model="modalSettings.username" placeholder="输入您的角色名称" />
                <GSettingItem label="鼠标灵敏度" type="text" v-model="modalSettings.sensitivity" placeholder="0.1 - 2.0" />
                <GSettingItem label="每局游戏时长" type="number" v-model="modalSettings.game_duration" placeholder="秒" />
                <template #footer>
                    <GButton variant="primary" @click="saveSetting">
                        保存
                    </GButton>
                    <GButton class="ml-2" variant="secondary" @click="closeSetting">
                        取消
                    </GButton>
                </template>
            </GSettingsPanel>
        </div> -->

        <GModal :visible="showSetting" @update:visible="showSetting = $event" title="🏆 游戏设置" :width="'750px'"
            :closable="true" :maskClosable="true">
            <div>
                <GSettingItem label="用户名" type="text" v-model="modalSettings.username" placeholder="输入您的角色名称" />
                <GSettingItem label="鼠标灵敏度" type="text" v-model="modalSettings.sensitivity" placeholder="0.1 - 2.0" />
                <GSettingItem label="每局游戏时长" type="number" v-model="modalSettings.game_duration" placeholder="秒" />
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

        <GModal :visible="showLeaderboard" @update:visible="showLeaderboard = $event" title="🏆 全模式玩家数据榜单" :width="'750px'"
            :closable="true" :maskClosable="true">
            <LeaderboardSwitcher />
            <template #footer>
                <button class="btn btn-secondary" @click="showLeaderboard = false">关闭</button>
            </template>
        </GModal>

        <div class="ui-overlay">

            <div class="panel-left">
                <div class="logo-area">
                    <h1 class="game-logo">SPHERE<span class="highlight-cyan">SHOOTER</span></h1>
                    <p class="tagline">精确射击模拟平台</p>
                </div>

                <div class="player-card">
                    <div class="player-name">Player_007</div>
                    <div class="player-stats">KPM: <span class="highlight-orange">1.75</span> | Acc: <span
                            class="highlight-orange">32.4%</span></div>
                </div>
            </div>

            <div class="panel-right">

                <h2 class="menu-title">选择游戏模式</h2>

                <div class="mode-selector">
                    <div class="mode-card" v-for="item in menus">
                        <h3 class="card-title">{{ item.title }}</h3>
                        <p class="card-desc">{{ item.desc }}</p>
                        <button class="btn btn-primary" @click="startGame(item)">开始游戏</button>
                    </div>
                </div>
            </div>

            <div class="footer-actions">
                <button class="btn btn-icon" @click="openLeaderboard">排行榜</button>
                <button class="btn btn-icon" @click="openSetting">设置</button>
                <!-- <button class="btn btn-icon">退出</button> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import LeaderboardSwitcher from '../components/LeaderboardSwitcher.vue'
import { useLocalStorage } from '@vueuse/core'
import { ref } from "vue";
import { watch } from 'vue'
import { emitter } from '../../eventBus.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const menus = ref([
    {
        title: '基础练习 (Basic Drill)',
        desc: '射击随机目标，追求最高 KPM 和分数。',
        path: '/shot-ball'
    }
])
const startGame = (menu) => {
    router.push(menu.path)
};

let settings = useLocalStorage('settings', {
    username: '',
    sensitivity: 1,
    game_duration: 30
})


let modalSettings = ref({ ...settings._rawValue })

// 监听对象变化
watch(settings, (newVal) => {
    emitter.emit('settingsChanged', newVal)  // 触发全局事件
}, { deep: true })
const showSetting = ref(false)
const showLeaderboard = ref(false);
function saveSetting() {
    Object.assign(settings, modalSettings)
    showSetting.value = false
}

function openSetting() {
    Object.assign(modalSettings, settings)
    showSetting.value = true
}

function openLeaderboard() {
    showLeaderboard.value = true
}

</script>

<style scoped>
#game-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    z-index: 999999;
    /* 确保在最顶层 */
    display: flex;
    /* 默认隐藏 */
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

/* --- 全局样式 --- */
.homepage-wrapper {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #1a1a1a;
    /* 深色背景 */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #eeeeee;
}

/* --- 1. Three.js 视图容器 --- */
.threejs-view-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    /* 模拟 Three.js 动态背景的科技感 */
    background: radial-gradient(circle at center, #1f2731 0%, #1a1a1a 80%);
}

.threejs-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    border: 4px dashed rgba(0, 255, 255, 0.1);
}

.placeholder-text {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.1);
    letter-spacing: 5px;
}


/* --- 2. UI 叠加层 --- */
.ui-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    /* 确保 UI 在 Three.js 视图之上 */
    display: grid;
    grid-template-columns: 300px 1fr;
    /* 左侧固定宽度，右侧弹性 */
    grid-template-rows: 1fr 60px;
    /* 顶部内容区，底部操作区 */
    gap: 20px;
    padding: 30px;
}

/* --- 核心辅助样式 --- */
.highlight-cyan {
    color: #00ffff;
}

.highlight-orange {
    color: #ffaa00;
}

.panel-base {
    background: rgba(34, 34, 34, 0.85);
    backdrop-filter: blur(5px);
    border: 1px solid #333;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

/* --- 左侧面板 --- */
.panel-left {
    grid-area: 1 / 1 / 2 / 2;
    align-self: flex-start;
    /* 靠上对齐 */
    display: flex;
    flex-direction: column;
    height: 100%;
}

.logo-area {
    margin-bottom: 50px;
    padding-bottom: 15px;
    border-bottom: 2px solid rgba(0, 255, 255, 0.2);
}

.game-logo {
    font-size: 36px;
    font-weight: 800;
    color: #eeeeee;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    letter-spacing: 2px;
}

.tagline {
    font-size: 14px;
    color: #888;
}

.player-card {
    background: rgba(51, 51, 51, 0.8);
    padding: 15px;
    border-left: 5px solid #ffaa00;
    border-radius: 4px;
    margin-top: auto;
    /* 推到底部 */
}

.player-name {
    font-size: 20px;
    font-weight: bold;
    color: #00ffff;
}

.player-stats {
    font-size: 14px;
    color: #ccc;
}


/* --- 右侧面板 (玩法选择) --- */
.panel-right {
    grid-area: 1 / 2 / 2 / 3;
    padding-left: 40px;
}

.menu-title {
    font-size: 24px;
    color: #00ffff;
    margin-bottom: 25px;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.4);
    text-transform: uppercase;
    text-align: left;
}

.mode-selector {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
    justify-content: flex-start;
}

.mode-card {
    background: rgba(34, 34, 34, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    padding: 20px;
    width: 250px;
    text-align: left;
    transition: transform 0.3s, border-color 0.3s;
}

.mode-card:hover {
    transform: translateY(-5px);
    border-color: #00ffff;
    box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
}

.mode-card.active {
    border: 2px solid #ffaa00;
}

.card-title {
    font-size: 20px;
    color: #eeeeee;
    margin-bottom: 10px;
}

.card-desc {
    font-size: 14px;
    color: #aaa;
    margin-bottom: 20px;
    height: 40px;
    /* 固定高度，防止布局跳动 */
}

.mode-card.coming-soon {
    opacity: 0.6;
}

/* --- 底部操作栏 --- */
.footer-actions {
    grid-area: 2 / 1 / 3 / 3;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 15px;
    padding-top: 10px;
    border-top: 1px solid #333;
}

/* --- 通用按钮样式 --- */
.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s, box-shadow 0.2s;
    text-transform: uppercase;
}

.btn-primary {
    background-color: #00ffff;
    color: #1a1a1a;
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.btn-primary:hover {
    background-color: #33ffff;
}

.btn-secondary {
    background-color: #555;
    color: #bbb;
}

.btn-icon {
    background: transparent;
    color: #eee;
    border: 1px solid #00ffff;
}

.btn-icon:hover {
    background-color: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}
</style>