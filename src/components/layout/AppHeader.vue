<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo -->
      <div class="logo" @click="goHome">
        <span class="logo-icon">🗺️</span>
        <span class="logo-text">{{ appTitle }}</span>
        <span class="logo-version">{{ appVersion }}</span>
      </div>
      
      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ 'active': $route.path === item.path }"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>
      
      <!-- 用户操作 -->
      <div class="user-actions">
        <el-button type="text" @click="toggleTheme">
          <el-icon>
            <component :is="themeIcon" />
          </el-icon>
        </el-button>
        
        <el-dropdown @command="handleCommand">
          <el-button type="text">
            <el-icon><User /></el-icon>
            用户
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item divided command="help">帮助中心</el-dropdown-item>
              <el-dropdown-item command="feedback">反馈建议</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMapStore } from '@/store/modules/map'
import { 
  HomeFilled, Compass, Star, Setting, 
  User, Sunny, Moon
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const mapStore = useMapStore()

const appTitle = process.env.VUE_APP_TITLE
const appVersion = process.env.VUE_APP_VERSION

const navItems = [
  { path: '/home', name: '首页', icon: HomeFilled },
  { path: '/explore', name: '探索', icon: Compass },
  { path: '/saved', name: '收藏', icon: Star },
  { path: '/settings', name: '设置', icon: Setting }
]

const themeIcon = computed(() => mapStore.mapTheme === 'light' ? Moon : Sunny)

const goHome = () => {
  router.push('/home')
}

const toggleTheme = () => {
  mapStore.toggleTheme()
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'help':
      window.open('/help', '_blank')
      break
    case 'feedback':
      window.open('/feedback', '_blank')
      break
    case 'logout':
      // 处理退出登录
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow-color);
  position: relative;
  z-index: 1000;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: var(--header-height);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
}

.logo-version {
  font-size: 12px;
  color: var(--info-color);
  background: var(--hover-color);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.nav-menu {
  display: flex;
  gap: 2px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.2s;
  
  &:hover {
    background: var(--hover-color);
    color: var(--primary-color);
  }
  
  &.active {
    background: var(--primary-color);
    color: white;
  }
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

// 响应式
@media (max-width: 768px) {
  .header-container {
    padding: 0 12px;
  }
  
  .logo-text {
    display: none;
  }
  
  .nav-item span {
    display: none;
  }
}
</style>