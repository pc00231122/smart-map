<template>
  <div class="home-view">
    <!-- 地图容器 -->
    <div class="map-area">
      <MapContainer 
        ref="mapRef"
        @click="handleMapClick"
        @ready="handleMapReady"
      />
      
      <!-- 欢迎提示 -->
      <transition name="fade">
        <div v-if="showWelcome" class="welcome-tip">
          <div class="welcome-content">
            <h3>欢迎使用智能地图</h3>
            <p>点击地图添加标记，使用左侧面板搜索地点</p>
            <el-button type="primary" size="small" @click="showWelcome = false">
              开始探索
            </el-button>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- 侧边栏 -->
    <transition name="slide">
      <div v-if="showSidebar" class="sidebar">
        <div class="sidebar-header">
          <h3>地图控制面板</h3>
          <el-button type="text" @click="toggleSidebar">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </div>
        
        <div class="sidebar-content">
          <!-- 标记点管理 -->
          <div class="sidebar-section">
            <h4>📌 标记点管理</h4>
            <div class="marker-actions">
              <el-button type="primary" size="small" @click="addMarkerAtCenter">
                <el-icon><Plus /></el-icon>
                在当前中心添加标记
              </el-button>
              <el-button size="small" @click="exportMarkers">
                <el-icon><Download /></el-icon>
                导出标记
              </el-button>
            </div>
            
            <div v-if="markers.length > 0" class="marker-list">
              <div 
                v-for="marker in markers" 
                :key="marker.id"
                class="marker-item"
              >
                <div class="marker-info">
                  <span class="marker-title">{{ marker.title || '未命名标记' }}</span>
                  <span class="marker-coords">
                    {{ marker.lat.toFixed(4) }}, {{ marker.lng.toFixed(4) }}
                  </span>
                </div>
                <div class="marker-actions">
                  <el-button type="text" size="small" @click="zoomToMarker(marker)">
                    <el-icon><ZoomIn /></el-icon>
                  </el-button>
                  <el-button type="text" size="small" @click="removeMarker(marker.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <el-empty description="暂无标记点" :image-size="80" />
            </div>
          </div>
          
          <!-- 图层选择 -->
          <div class="sidebar-section">
            <h4>🗺️ 地图图层</h4>
            <div class="layer-buttons">
              <el-radio-group v-model="activeLayer">
                <el-radio-button label="osm">街道</el-radio-button>
                <el-radio-button label="satellite">卫星</el-radio-button>
                <el-radio-button label="topographic">地形</el-radio-button>
                <el-radio-button label="dark">深色</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          
          <!-- 工具 -->
          <div class="sidebar-section">
            <h4>🛠️ 工具</h4>
            <div class="tool-grid">
              <div class="tool-item" @click="measureDistance">
                <el-icon><Ruler /></el-icon>
                <span>测量距离</span>
              </div>
              <div class="tool-item" @click="drawPolygon">
                <el-icon><EditPen /></el-icon>
                <span>绘制区域</span>
              </div>
              <div class="tool-item" @click="takeScreenshot">
                <el-icon><Camera /></el-icon>
                <span>截图</span>
              </div>
              <div class="tool-item" @click="printMap">
                <el-icon><Printer /></el-icon>
                <span>打印</span>
              </div>
            </div>
          </div>
          
          <!-- 统计信息 -->
          <div class="sidebar-section">
            <h4>📊 统计信息</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">标记点</span>
                <span class="stat-value">{{ markers.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">搜索次数</span>
                <span class="stat-value">{{ searchHistory.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">地图缩放</span>
                <span class="stat-value">{{ zoomLevel }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">当前坐标</span>
                <span class="stat-value">
                  {{ currentLocation.lat.toFixed(2) }}, {{ currentLocation.lng.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 侧边栏切换按钮 -->
    <div class="sidebar-toggle" @click="toggleSidebar">
      <el-icon>
        <component :is="showSidebar ? ArrowRight : ArrowLeft" />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '@/store/modules/map'
import MapContainer from '@/components/map/MapContainer.vue'
import { 
  ArrowLeft, ArrowRight, Plus, Download,
  ZoomIn, Delete, Ruler, EditPen,
  Camera, Printer
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Store
const mapStore = useMapStore()

// Refs
const mapRef = ref(null)
const showWelcome = ref(true)
const showSidebar = ref(true)

// Computed
const markers = computed(() => mapStore.markers)
const searchHistory = computed(() => mapStore.searchHistory)
const zoomLevel = computed(() => mapStore.zoomLevel)
const currentLocation = computed(() => mapStore.currentLocation)
const activeLayer = computed({
  get: () => mapStore.activeLayer,
  set: (value) => mapStore.setActiveLayer(value)
})

// 地图准备就绪
const handleMapReady = (mapInstance) => {
  console.log('地图准备就绪:', mapInstance)
  
  // 自动隐藏欢迎提示
  setTimeout(() => {
    showWelcome.value = false
  }, 3000)
}

// 地图点击事件
const handleMapClick = (event) => {
  console.log('地图点击:', event)
  
  // 如果需要添加标记，可以在这里处理
  // 例如：if (isAddingMarker.value) { addMarker(event.lat, event.lng) }
}

// 切换侧边栏
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// 在当前中心添加标记
const addMarkerAtCenter = async () => {
  try {
    const location = currentLocation.value
    
    const { value: title } = await ElMessageBox.prompt('请输入标记点名称', '添加标记', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '标记点名称',
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return '标记点名称不能为空'
        }
        if (value.length > 50) {
          return '名称不能超过50个字符'
        }
        return true
      }
    })
    
    if (title) {
      const marker = mapStore.addMarker({
        lat: location.lat,
        lng: location.lng,
        title: title.trim(),
        type: 'default'
      })
      
      ElMessage.success('标记点添加成功')
      
      // 如果地图实例可用，跳转到标记点
      if (mapRef.value) {
        mapRef.value.panTo(location.lat, location.lng)
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('添加标记失败:', error)
      ElMessage.error('添加标记失败')
    }
  }
}

// 导出标记点
const exportMarkers = () => {
  if (markers.value.length === 0) {
    ElMessage.warning('暂无标记点可导出')
    return
  }
  
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    totalMarkers: markers.value.length,
    markers: markers.value
  }
  
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = `map-markers-${new Date().getTime()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('标记点已导出')
}

// 跳转到标记点
const zoomToMarker = (marker) => {
  if (mapRef.value) {
    mapRef.value.panTo(marker.lat, marker.lng, 16)
  }
}

// 删除标记点
const removeMarker = (id) => {
  mapStore.removeMarker(id)
  ElMessage.success('标记点已删除')
}

// 测量距离
const measureDistance = () => {
  if (mapRef.value) {
    mapRef.value.startMeasuring()
    ElMessage.info('点击地图两点进行距离测量')
  }
}

// 绘制多边形
const drawPolygon = () => {
  if (mapRef.value) {
    mapRef.value.startDrawing()
    ElMessage.info('点击地图绘制多边形，双击结束')
  }
}

// 截图
const takeScreenshot = () => {
  ElMessage.info('截图功能开发中...')
  // 可以使用html2canvas库实现
}

// 打印地图
const printMap = () => {
  window.print()
}

// 键盘快捷键
const handleKeydown = (event) => {
  switch (event.key) {
    case 'Escape':
      // 退出当前模式
      if (mapRef.value) {
        mapRef.value.stopCurrentMode()
      }
      break
    case '+':
    case '=':
      // 放大
      event.preventDefault()
      // 调用地图放大方法
      break
    case '-':
    case '_':
      // 缩小
      event.preventDefault()
      // 调用地图缩小方法
      break
    case 'm':
    case 'M':
      // 切换侧边栏
      if (event.ctrlKey) {
        event.preventDefault()
        toggleSidebar()
      }
      break
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.home-view {
  height: 100%;
  position: relative;
}

.map-area {
  width: 100%;
  height: 100%;
  position: relative;
}

.welcome-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
}

.welcome-content {
  background: var(--bg-color);
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--shadow-color);
  text-align: center;
  pointer-events: auto;
  
  h3 {
    margin-bottom: 15px;
    color: var(--text-color);
  }
  
  p {
    margin-bottom: 20px;
    color: var(--info-color);
    font-size: 14px;
  }
}

.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
  background: var(--bg-color);
  border-right: 1px solid var(--border-color);
  box-shadow: 2px 0 12px var(--shadow-color);
  z-index: 900;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    color: var(--text-color);
    font-size: 18px;
  }
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.sidebar-section {
  margin-bottom: 30px;
  
  h4 {
    margin-bottom: 15px;
    color: var(--text-color);
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.marker-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  
  .el-button {
    flex: 1;
  }
}

.marker-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.marker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--hover-color);
  border-radius: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background: var(--border-color);
  }
}

.marker-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.marker-title {
  font-weight: 500;
  color: var(--text-color);
}

.marker-coords {
  font-size: 12px;
  color: var(--info-color);
  font-family: 'Courier New', monospace;
}

.marker-actions {
  display: flex;
  gap: 5px;
}

.empty-state {
  padding: 30px 0;
  text-align: center;
}

.layer-buttons {
  .el-radio-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: var(--hover-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--border-color);
    transform: translateY(-2px);
  }
  
  .el-icon {
    font-size: 24px;
    color: var(--primary-color);
    margin-bottom: 8px;
  }
  
  span {
    font-size: 12px;
    color: var(--text-color);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: var(--hover-color);
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: var(--info-color);
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
}

.sidebar-toggle {
  position: absolute;
  top: 50%;
  left: 320px;
  transform: translateY(-50%);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-left: none;
  border-radius: 0 8px 8px 0;
  width: 24px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 901;
  transition: all 0.3s;
  
  &:hover {
    background: var(--hover-color);
  }
  
  .el-icon {
    color: var(--text-color);
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

// 响应式设计
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
  }
  
  .sidebar-toggle {
    left: 280px;
  }
  
  .tool-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>