<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="modal-mask" @click.self="handleMaskClick">

        <div class="modal-wrapper">
          <div class="modal-container" :style="{ width: width }">

            <div class="modal-header">
              <h3>{{ title }}</h3>
              <button class="modal-close" @click="closeModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <slot></slot>
            </div>

            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer"></slot>
            </div>
            <div v-else class="modal-footer default-footer">
              <button class="btn btn-secondary" @click="closeModal">取消</button>
              <button class="btn btn-primary" @click="handleOk">确定</button>
            </div>

          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '模态框标题'
  },
  closable: {
    type: Boolean,
    default: true
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  width: {
    type: String,
    default: '500px'
  }
});

const emit = defineEmits(['update:visible', 'ok', 'cancel']);

// 关闭模态框
const closeModal = () => {
  if (props.closable) {
    emit('update:visible', false);
    emit('cancel');
  }
};

// 处理遮罩点击
const handleMaskClick = () => {
  if (props.maskClosable) {
    closeModal();
  }
};

// 处理确定按钮点击
const handleOk = () => {
  emit('ok');
  closeModal(); // 默认点击确定后关闭
};

</script>

<style scoped>
/* ======================== 动画样式 ======================== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 模态框主体动画 (从顶部滑入) */
.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s ease-out;
}

.modal-fade-enter-from .modal-container {
  transform: translateY(-50px);
}

.modal-fade-leave-to .modal-container {
  transform: translateY(-50px);
}

/* ======================== 模态框结构样式 ======================== */

/* 遮罩层 */
.modal-mask {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  /* 半透明深色遮罩 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 模态框外包裹层（处理垂直居中） */
.modal-wrapper {
  margin-top: -5vh;
  /* 稍微向上移动，模仿 AntD 的效果 */
}

/* 模态框主体 */
.modal-container {
  /* width: v-bind(width); */
  /* 使用 v-bind 绑定 props.width */
  max-width: 90vw;
  background-color: #222222;
  /* 深灰背景 */
  border-radius: 8px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.7);
  border: 1px solid #00ffff;
  /* 科技感边框 */
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #eeeeee;
  transform: rotateX(2deg);
  /* 保持轻微立体感 */
}

/* --- 头部 --- */
.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333333;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #00ffff;
  /* 亮青色标题 */
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.4);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s;
}

.modal-close:hover {
  transform: rotate(90deg);
}

/* --- 内容区 --- */
.modal-body {
  padding: 20px;
  min-height: 80px;
  max-height: 70vh;
  overflow-y: auto;
}

/* --- 底部 --- */
.modal-footer {
  padding: 10px 20px;
  border-top: 1px solid #444;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #333333;
}

/* 默认 Footer 按钮样式 */
.default-footer {
  display: flex;
  justify-content: flex-end;
}

/* --- 按钮样式 (沿用之前的风格) --- */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.btn-primary {
  background-color: #ffaa00;
  /* 橙色确定按钮 */
  color: #1a1a1a;
}

.btn-primary:hover {
  background-color: #ffb733;
  box-shadow: 0 0 8px rgba(255, 170, 0, 0.7);
}

.btn-secondary {
  background-color: #555;
  color: #eeeeee;
}

.btn-secondary:hover {
  background-color: #666;
}
</style>