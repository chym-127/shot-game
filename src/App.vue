<script setup>
</script>

<template>
  <div>
    <GButton class="b-l" variant="secondary" @click="open">
      设置
    </GButton>
    <div id="game-screen" v-if="show">
      <GSettingsPanel>
        <GSettingItem label="用户名" type="text" v-model="modalSettings.username" placeholder="输入您的角色名称" />
        <GSettingItem label="鼠标灵敏度" type="text" v-model="modalSettings.sensitivity" placeholder="0.1 - 2.0" />

        <GSettingItem label="每局游戏时长" type="number" v-model="modalSettings.game_duration" placeholder="秒" />


        <template #footer>
          <GButton variant="primary" @click="save">
            保存
          </GButton>
        </template>
      </GSettingsPanel>
    </div>
  </div>
  <router-view></router-view>
</template>
<script setup>
import { useLocalStorage } from '@vueuse/core'
import { ref } from "vue";
import { watch } from 'vue'
import { emitter } from './eventBus.js'



let settings = useLocalStorage('settings', {
  username:'',
  sensitivity: 1,
  game_duration: 30
})


let modalSettings = ref({...settings._rawValue})

// 监听对象变化
watch(settings, (newVal) => {
  emitter.emit('settingsChanged', newVal)  // 触发全局事件
}, { deep: true })
let show = ref(false)
function save() {
  Object.assign(settings,modalSettings)
  show.value = false
}

function open(){
  Object.assign(modalSettings,settings)
  show.value = true
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

.b-l {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 999998;
}
</style>
