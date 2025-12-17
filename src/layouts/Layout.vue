<template>
  <div class="app-layout">
    <!-- 头部 -->
    <AppHeader />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 侧边栏 -->
      <AppSidebar v-if="showSidebar" />
      
      <!-- 页面内容 -->
      <div class="content-area" :class="{ 'with-sidebar': showSidebar }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
      
      <!-- 地图控制面板 -->
      <MapControls v-if="$route.name === 'Home'" />
    </main>
    
    <!-- 底部 -->
    <AppFooter />
    
    <!-- 全局通知 -->
    <GlobalNotifications />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MapControls from '@/components/map/MapControls.vue'
import GlobalNotifications from '@/components/ui/GlobalNotifications.vue'

const route = useRoute()

// 是否显示侧边栏
const showSidebar = computed(() => {
  return route.name === 'Home'
})
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.content-area {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: var(--bg-color);
  
  &.with-sidebar {
    padding: 20px 20px 20px 300px; // 侧边栏宽度280px + 20px间距
  }
}
</style>