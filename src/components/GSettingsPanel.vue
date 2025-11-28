<template>
    <div class="game-panel-container">

        <header class="game-panel-header">
            <slot name="header">
                <h2>系统设置</h2>
            </slot>
        </header>

        <main class="game-panel-content">
            <slot></slot>
        </main>

        <footer class="game-panel-footer">
            <slot name="footer"></slot>
        </footer>

    </div>
</template>

<script setup>
// 不需要 props，因为它主要是一个容器组件
</script>

<style scoped lang="less">
// --- LESS 变量定义 ---
@color-border: #4a4a4a; // 深色边框
@color-background: #1e1e1e; // 暗色背景
@color-text: #e0e0e0; // 浅色文本
@color-highlight: #00bfff; // 突出显示色（科技蓝）
@font-family-game: 'Arial Black', sans-serif;
@border-width: 4px;

.game-panel-container {
    width: 100%;
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;

    // 游戏风格边框和阴影
    background-color: @color-background;
    border: @border-width solid @color-border;
    box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.5); // 粗糙的投影
    font-family: @font-family-game;
    color: @color-text;
}

.game-panel-header {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid @color-highlight; // 标题下方的科技分割线

    h2 {
        font-size: 28px;
        color: @color-highlight;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin: 0;
    }
}

.game-panel-content {
    display: flex;
    flex-direction: column;
    gap: 15px; // 设置项之间的间距
}

.game-panel-footer {
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid @color-border;
    text-align: right;
}

// ----------------------------------------------------
// --- 内置的【游戏风格输入控件】样式 ---
// ----------------------------------------------------

// 1. INPUT/TEXTAREA 样式
:deep(input[type="text"]),
:deep(input[type="password"]),
:deep(textarea) {
    width: 100%;
    padding: 10px;
    background-color: darken(@color-background, 5%);
    border: 2px solid @color-border;
    color: @color-text;
    font-size: 16px;
    font-family: @font-family-game;

    // 聚焦时的科技感高亮
    &:focus {
        outline: none;
        border-color: @color-highlight;
        box-shadow: 0 0 5px @color-highlight;
    }
}

// 2. LABEL/设置项容器样式
:deep(.setting-item) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;

    label {
        font-weight: bold;
        color: @color-text;
        min-width: 150px;
        text-align: left;
    }

    .control-area {
        flex-grow: 1;
        margin-left: 20px;
    }
}

// 3. SLIDER/RANGE 样式 (复杂但必要)
:deep(input[type="range"]) {
    -webkit-appearance: none; // 移除默认样式
    width: 100%;
    height: 10px;
    background: @color-border;
    border-radius: 5px;
    cursor: pointer;

    // 轨道（Track）样式
    &::-webkit-slider-runnable-track {
        height: 10px;
        background: @color-border;
        border: 1px solid lighten(@color-border, 10%);
        border-radius: 5px;
    }

    // 滑块（Thumb）样式
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        margin-top: -5px; // 使滑块居中
        height: 20px;
        width: 10px;
        background: @color-highlight;
        border: 2px solid @color-text;
        border-radius: 2px; // 保持方块或粗糙感
        box-shadow: 0 0 3px @color-highlight;
    }
}
</style>