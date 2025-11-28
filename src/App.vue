<template>
  <div>
    <router-view></router-view>
  </div>
</template>
<script setup>

</script>
<style>
/* --- 1. 针对 WebKit 浏览器 (Chrome, Safari, Edge, Opera) --- */
/* 隐藏主窗口滚动条 */
body {
  overflow: hidden;
  /* 隐藏主窗口的滚动条，但如果内容溢出，用户无法滚动 */
  /* 或者使用 overflow-y: scroll 保持功能，但隐藏滚动条轨道 */
}

/* 隐藏所有元素的滚动条轨道和拇指 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
  /* 隐藏 WebKit 滚动条的背景 */
}

/* 针对所有元素，包括设置了 overflow 的 div */
* {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}
</style>
