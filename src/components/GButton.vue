<template>
  <button :class="['game-button-less', `game-button-less--${variant}`]" :disabled="disabled" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup>
// 定义组件接收的属性 (Props)
const props = defineProps({
  // 按钮风格：primary, secondary, danger, pixel
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'pixel'].includes(value),
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
});

// 定义组件触发的事件 (Emits)
const emit = defineEmits(['click']);

// 处理点击事件
const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<style scoped lang="less">
// --- LESS 变量定义 ---
@color-primary: #ff4500; // 火焰色
@color-secondary: #00bfff; // 科技蓝
@color-danger: #dc143c; // 警告红
@color-text: #ffffff;
@default-shadow-depth: 6px;

// --- LESS 混入 (Mixin) 定义 ---

// 核心的按下效果混入
.push-effect(@shadow-color) {
  // 初始立体效果
  box-shadow: 0 @default-shadow-depth 0 @shadow-color;
  transform: translateY(0);

  // 鼠标按下/点击效果 (让按钮“沉下去”)
  &:not(:disabled):active {
    box-shadow: 0 2px 0 @shadow-color;
    /* 阴影高度减小 */
    transform: translateY(@default-shadow-depth - 2px);
    /* 按钮向下移动 4px (6-2) */
  }
}

// --- 基础样式 ---

.game-button-less {
  padding: 10px 20px;
  font-family: 'Arial Black', sans-serif;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  color: @color-text;
  text-transform: uppercase;
  transition: all 0.08s ease-out;
  /* 快速反馈 */

  // 鼠标悬停效果
  &:not(:disabled):hover {
    filter: brightness(1.1);
  }

  // 禁用状态
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    // 禁用状态的阴影可以更浅
    box-shadow: 0 4px 0 fadeout(@color-text, 50%);
  }
}

// --- 变体（Variant）样式 ---

/* Primary (主要/火焰) */
.game-button-less--primary {
  background-color: @color-primary;
  // 使用 LESS 的 darken 函数计算阴影颜色
  .push-effect(darken(@color-primary, 20%));
}

/* Secondary (次要/科技) */
.game-button-less--secondary {
  background-color: @color-secondary;
  .push-effect(darken(@color-secondary, 20%));
}

/* Danger (危险/警告) */
.game-button-less--danger {
  background-color: @color-danger;
  .push-effect(darken(@color-danger, 20%));
}

/* Pixel (像素风格) */
.game-button-less--pixel {
  background-color: #333333;
  color: #c0c0c0;
  border: 4px solid #c0c0c0;
  border-radius: 0; // 移除圆角
  font-family: 'Monospace', monospace;
  padding: 8px 16px;

  // 像素风的特殊阴影和按下效果
  box-shadow: 4px 4px 0 #000000;
  transform: translate(0, 0);

  &:not(:disabled):active {
    // 按下时，阴影和按钮本身都偏移到右下方
    box-shadow: 0 0 0 #000000;
    transform: translate(4px, 4px);
  }
}
</style>