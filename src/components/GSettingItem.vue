<template>
    <div class="setting-item-wrapper">

        <label :for="id" class="setting-label">
            {{ label }}
        </label>

        <div class="control-area">
            <input :id="id" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
                @change="$emit('change', $event.target.value)" v-bind="$attrs" class="game-input" />
        </div>
    </div>
</template>

<script setup>

// 禁用属性自动透传到根元素 (div.setting-item-wrapper)
defineOptions({
    inheritAttrs: false
});

const props = defineProps({
    // v-model 的值，可以是字符串或数字
    modelValue: {
        type: [String, Number],
        default: ''
    },
    // 设置项的标题
    label: {
        type: String,
        required: true
    },
    // 用于 label 的 for 属性和 input 的 id
    id: {
        type: String,
        default: () => `setting-input-${Math.random().toString(36).substring(2, 9)}`
    }
});

// 声明组件支持的事件
defineEmits([
    'update:modelValue', // 必需：用于 v-model 的实时更新
    'change'             // 暴露：当用户完成输入/拖动时触发
]);

</script>

<style scoped lang="less">
// ----------------------------------------------------
// --- 样式定义 ---
// ----------------------------------------------------

@color-background: #1e1e1e;
@color-text: #e0e0e0;
@color-border: #4a4a4a;
@color-highlight: #00bfff;
@font-family-game: 'Arial Black', sans-serif;

// 外部容器：保持 GameSettingsPanel 中设置的 Flex 布局
.setting-item-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;

    .setting-label {
        font-weight: bold;
        color: @color-text;
        min-width: 150px;
        text-align: left;
        cursor: default;
        padding-right: 15px;
    }

    .control-area {
        flex-grow: 1;
        width: 100%;
    }
}

// 封装后的输入框样式 (适用于 type="text" 和 type="range")
.game-input {
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

    // ------------------------------------
    // 滑块（Range）的特殊样式覆盖
    // ------------------------------------
    &[type="range"] {
        -webkit-appearance: none; // 移除默认样式
        appearance: none;
        width: 100%;
        height: 10px;
        background: transparent;
        margin: 0;

        // 轨道（Track）样式
        &::-webkit-slider-runnable-track {
            height: 10px;
            background: @color-border;
            border: 1px solid lighten(@color-border, 10%);
            border-radius: 5px;
        }

        &::-moz-range-track {
            height: 10px;
            background: @color-border;
            border: 1px solid lighten(@color-border, 10%);
            border-radius: 5px;
        }

        // 滑块（Thumb）样式
        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            margin-top: -5px;
            height: 20px;
            width: 10px;
            background: @color-highlight;
            border: 2px solid @color-text;
            border-radius: 2px;
            box-shadow: 0 0 3px @color-highlight;
        }

        &::-moz-range-thumb {
            height: 20px;
            width: 10px;
            background: @color-highlight;
            border: 2px solid @color-text;
            border-radius: 2px;
            box-shadow: 0 0 3px @color-highlight;
        }
    }
}
</style>