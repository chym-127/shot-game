import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import 'virtual:uno.css'

import GButton from '@/components/GButton.vue';
import GSettingsPanel from '@/components/GSettingsPanel.vue';
import GSettingItem from '@/components/GSettingItem.vue';
import GModal from '@/components/GModal.vue';

const app = createApp(App);

app.component('GButton', GButton);
app.component('GSettingsPanel', GSettingsPanel);
app.component('GSettingItem', GSettingItem);
app.component('GModal', GModal);


app.use(router).mount('#app')
