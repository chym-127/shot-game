<template>
    <div class="leaderboard-switcher-container">

        <div class="header-area">
            <div class="mode-tabs">
                <button v-for="mode in modes" :key="mode.key" :class="['tab-button', { active: currentMode === mode.key }]"
                    @click="currentMode = mode.key">
                    {{ mode.name }}
                </button>
            </div>
        </div>

        <div class="leaderboard-content">

            <div class="leaderboard-header">
                <div class="col-rank">排名</div>
                <div class="col-name">玩家名称</div>
                <div class="col-score">得分</div>
            </div>

            <div class="results-list">
                <div v-for="(item, index) in currentLeaderboard" :key="item.id"
                    :class="['leaderboard-item', { 'top-3': index < 3, 'player-row': item.isPlayer }]">
                    <div class="col-rank">{{ index + 1 }}</div>
                    <div class="col-name">{{ item.name }}</div>
                    <div class="col-score highlight-score">{{ item.score.toLocaleString() }}</div>
                </div>

                <div v-if="currentLeaderboard.length === 0" class="no-data">
                    正在加载数据或该模式暂无记录...
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 定义所有可切换的游戏模式
const modes = [
    { key: 'basic', name: '基础练习' },
    { key: 'economy', name: '反应与经济' },
    { key: 'zone', name: '区域争夺 (Coming Soon)' }
];

// 当前选中的模式
const currentMode = ref('basic');

// 模拟的排行榜数据 (保留 Score, Name, Rank)
const leaderboardData = {
    basic: [
        { id: 1, name: 'CyberGhost', score: 25000, isPlayer: false },
        { id: 2, name: 'AimBotJr', score: 24500, isPlayer: false },
        { id: 3, name: 'QuickScope_X', score: 23100, isPlayer: false },
        { id: 4, name: 'Vortex_99', score: 20500, isPlayer: false },
        { id: 5, name: 'Player_007', score: 18900, isPlayer: true }, // 突出显示玩家自己
        { id: 6, name: 'ShadowStriker', score: 17200, isPlayer: false },
        { id: 7, name: 'Raptor_F1', score: 16000, isPlayer: false },
        { id: 8, name: 'PixelHunter', score: 15500, isPlayer: false },
        { id: 9, name: 'DeepMindAI', score: 14000, isPlayer: false },
        { id: 10, name: 'LastStand', score: 12000, isPlayer: false },
    ],
    economy: [
        { id: 1, name: 'EcoMaster', score: 15500, isPlayer: false },
        { id: 2, name: 'ResourceGuru', score: 14900, isPlayer: false },
        { id: 3, name: 'QuickScope_X', score: 13800, isPlayer: false },
        { id: 4, name: 'Player_007', score: 12500, isPlayer: true }, // 突出显示玩家自己
        { id: 5, name: 'Vortex_99', score: 11000, isPlayer: false },
        { id: 6, name: 'AimBotJr', score: 10500, isPlayer: false },
    ],
    zone: [] // 留空，表示该模式数据待加载
};

// 计算属性：根据当前选择的模式返回对应的榜单数据
const currentLeaderboard = computed(() => {
    return leaderboardData[currentMode.value] || [];
});

</script>

<style scoped>
/* --- 主容器样式 --- */
.leaderboard-switcher-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #eeeeee;
    width: 100%;
    padding: 30px;
    transform: rotateX(3deg);
}

.header-area {
    margin-bottom: 25px;
    border-bottom: 2px solid rgba(0, 255, 255, 0.2);
    padding-bottom: 15px;
}

.main-title {
    font-size: 28px;
    font-weight: bold;
    color: #00ffff;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
    margin-bottom: 15px;
}

/* --- 模式选择 Tab 样式 (保持不变) --- */
.mode-tabs {
    display: flex;
    gap: 10px;
}

.tab-button {
    background: #333;
    color: #aaaaaa;
    border: 1px solid #444;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
    font-size: 14px;
}

.tab-button:hover {
    background-color: #444;
    color: #eeeeee;
}

.tab-button.active {
    background-color: #00ffff;
    color: #1a1a1a;
    border-color: #00ffff;
    font-weight: bold;
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
}

/* --- 榜单头部 --- */
.leaderboard-header {
    display: flex;
    padding: 10px 0;
    font-weight: bold;
    color: #aaaaaa;
    border-bottom: 2px solid #555;
    font-size: 14px;
    margin-top: 15px;
}

/* --- 榜单列定义 (只保留三列并调整宽度) --- */
.col-rank {
    width: 15%;
    text-align: center;
}

.col-name {
    width: 55%;
    text-align: left;
}

.col-score {
    width: 30%;
    text-align: right;
}


/* --- 榜单项目（行）样式 --- */
.leaderboard-item {
    display: flex;
    padding: 12px 0;
    border-bottom: 1px solid #333;
    transition: background-color 0.2s;
    font-size: 15px;
}

.leaderboard-item:hover {
    background-color: rgba(68, 68, 68, 0.5);
}

/* Top 3 突出显示 */
.top-3 {
    font-weight: bold;
    color: #ffaa00;
    /* 亮橙色 */
}

/* 玩家自己的行突出显示 */
.player-row {
    background-color: rgba(0, 255, 255, 0.1);
    border-left: 5px solid #00ffff;
    padding-left: 5px;
}

.player-row .col-name {
    color: #00ffff;
}

/* 突出得分数值 */
.highlight-score {
    font-weight: bold;
    color: #ffaa00;
}

/* 榜单为空时的样式 */
.no-data {
    display: block;
    text-align: center;
    padding: 50px;
    color: #777;
}
</style>