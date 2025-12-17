<template>
  <div class="about-view">
    <div class="about-container">
      <!-- 头部 -->
      <div class="about-header">
        <h1>关于 {{ appTitle }}</h1>
        <p>版本 {{ appVersion }}</p>
      </div>
      
      <!-- 内容 -->
      <div class="about-content">
        <!-- 介绍 -->
        <section class="about-section">
          <h2>项目介绍</h2>
          <p>{{ appTitle }} 是一个基于 Vue.js 3 和 Leaflet 开发的现代化地图应用，提供丰富的地图功能和友好的用户体验。</p>
        </section>
        
        <!-- 功能特性 -->
        <section class="about-section">
          <h2>功能特性</h2>
          <div class="features-grid">
            <div class="feature-item">
              <el-icon><MapLocation /></el-icon>
              <h3>地图浏览</h3>
              <p>支持多种地图图层，流畅的缩放和拖拽体验</p>
            </div>
            <div class="feature-item">
              <el-icon><Search /></el-icon>
              <h3>智能搜索</h3>
              <p>快速搜索全球地点，支持地址、兴趣点等多种搜索方式</p>
            </div>
            <div class="feature-item">
              <el-icon><Location /></el-icon>
              <h3>标记管理</h3>
              <p>添加、编辑、删除标记点，支持自定义图标和样式</p>
            </div>
            <div class="feature-item">
              <el-icon><Guide /></el-icon>
              <h3>路径规划</h3>
              <p>多种出行方式路线规划，支持实时路况（可选）</p>
            </div>
          </div>
        </section>
        
        <!-- 技术栈 -->
        <section class="about-section">
          <h2>技术栈</h2>
          <div class="tech-stack">
            <el-tag v-for="tech in techStack" :key="tech" type="info">
              {{ tech }}
            </el-tag>
          </div>
        </section>
        
        <!-- 数据来源 -->
        <section class="about-section">
          <h2>数据来源</h2>
          <ul class="data-sources">
            <li>地图数据：OpenStreetMap</li>
            <li>地理编码：Nominatim</li>
            <li>路线规划：OSRM</li>
            <li>天气数据：Open-Meteo</li>
          </ul>
        </section>
        
        <!-- 开源协议 -->
        <section class="about-section">
          <h2>开源协议</h2>
          <p>本项目基于 MIT 协议开源，您可以自由使用、修改和分发代码。</p>
          <el-button type="primary" @click="viewSource">
            <el-icon><View /></el-icon>
            查看源代码
          </el-button>
        </section>
      </div>
      
      <!-- 页脚 -->
      <div class="about-footer">
        <p>© {{ currentYear }} {{ appTitle }} - 保留所有权利</p>
        <p>
          <router-link to="/privacy">隐私政策</router-link> | 
          <router-link to="/terms">服务条款</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  MapLocation, Search, Location, Guide, View
} from '@element-plus/icons-vue'

const appTitle = process.env.VUE_APP_TITLE
const appVersion = process.env.VUE_APP_VERSION
const currentYear = computed(() => new Date().getFullYear())

const techStack = [
  'Vue.js 3', 'Pinia', 'Vue Router', 'Leaflet',
  'Element Plus', 'Axios', 'Sass/SCSS', 'ESLint'
]

const viewSource = () => {
  window.open('https://github.com/your-username/smart-map', '_blank')
}
</script>

<style lang="scss" scoped>
.about-view {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.about-container {
  background: var(--bg-color);
  border-radius: 12px;
  box-shadow: 0 4px 24px var(--shadow-color);
  overflow: hidden;
}

.about-header {
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  color: white;
  padding: 60px 40px;
  text-align: center;
  
  h1 {
    margin: 0 0 10px 0;
    font-size: 36px;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
    font-size: 16px;
  }
}

.about-content {
  padding: 40px;
}

.about-section {
  margin-bottom: 40px;
  
  h2 {
    margin-bottom: 20px;
    color: var(--text-color);
    font-size: 24px;
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 10px;
  }
  
  p {
    line-height: 1.6;
    color: var(--text-color);
    margin-bottom: 15px;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.feature-item {
  background: var(--hover-color);
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }
  
  .el-icon {
    font-size: 48px;
    color: var(--primary-color);
    margin-bottom: 20px;
  }
  
  h3 {
    margin: 0 0 15px 0;
    color: var(--text-color);
    font-size: 18px;
  }
  
  p {
    margin: 0;
    color: var(--info-color);
    font-size: 14px;
    line-height: 1.5;
  }
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.data-sources {
  list-style: none;
  padding: 0;
  
  li {
    padding: 8px 0;
    color: var(--text-color);
    border-bottom: 1px solid var(--border-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    &:before {
      content: '•';
      color: var(--primary-color);
      margin-right: 10px;
    }
  }
}

.about-footer {
  background: var(--hover-color);
  padding: 30px 40px;
  text-align: center;
  border-top: 1px solid var(--border-color);
  
  p {
    margin: 10px 0;
    color: var(--info-color);
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .about-view {
    padding: 20px;
  }
  
  .about-header {
    padding: 40px 20px;
    
    h1 {
      font-size: 28px;
    }
  }
  
  .about-content {
    padding: 20px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>