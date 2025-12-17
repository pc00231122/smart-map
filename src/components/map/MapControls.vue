<template>
  <div class="map-controls">
    <!-- 搜索控制 -->
    <div class="control-group search-group">
      <el-autocomplete
        v-model="searchQuery"
        :fetch-suggestions="fetchSuggestions"
        placeholder="搜索地点..."
        @select="handleSelect"
        @keyup.enter="handleSearch"
        clearable
        :loading="isSearching"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch" :loading="isSearching">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
        <template #suffix>
          <el-dropdown @command="handleSearchType">
            <el-button size="small" text>
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="place" :icon="searchType === 'place' ? Check : ''">
                  地点
                </el-dropdown-item>
                <el-dropdown-item command="address" :icon="searchType === 'address' ? Check : ''">
                  地址
                </el-dropdown-item>
                <el-dropdown-item command="poi" :icon="searchType === 'poi' ? Check : ''">
                  兴趣点
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-autocomplete>
      
      <!-- 搜索历史 -->
      <div v-if="showSearchHistory && recentSearches.length > 0" class="search-history">
        <div class="history-header">
          <span>最近搜索</span>
          <el-button type="text" size="small" @click="clearSearchHistory">
            清空
          </el-button>
        </div>
        <div class="history-list">
          <div 
            v-for="item in recentSearches" 
            :key="item.timestamp"
            class="history-item"
            @click="searchFromHistory(item)"
          >
            <el-icon><Clock /></el-icon>
            <span class="query">{{ item.query }}</span>
            <span class="time">{{ formatTime(item.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图层控制 -->
    <div class="control-group layer-group">
      <el-button-group>
        <el-tooltip content="街道地图" placement="left">
          <el-button 
            :type="activeLayer === 'osm' ? 'primary' : 'default'"
            @click="changeLayer('osm')"
            size="small"
          >
            <el-icon><MapLocation /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="卫星影像" placement="left">
          <el-button 
            :type="activeLayer === 'satellite' ? 'primary' : 'default'"
            @click="changeLayer('satellite')"
            size="small"
          >
            <el-icon><Picture /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="地形图" placement="left">
          <el-button 
            :type="activeLayer === 'topographic' ? 'primary' : 'default'"
            @click="changeLayer('topographic')"
            size="small"
          >
            <el-icon><Promotion /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="深色主题" placement="left">
          <el-button 
            :type="activeLayer === 'dark' ? 'primary' : 'default'"
            @click="changeLayer('dark')"
            size="small"
          >
            <el-icon><MoonNight /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
    </div>
    
    <!-- 工具控制 -->
    <div class="control-group tool-group">
      <el-button-group vertical>
        <el-tooltip content="添加标记" placement="left">
          <el-button 
            :type="isAddingMarker ? 'primary' : 'default'"
            @click="toggleAddMarker"
            size="small"
          >
            <el-icon><Location /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="路径规划" placement="left">
          <el-button 
            :type="isPlanningRoute ? 'primary' : 'default'"
            @click="toggleRoutePlanning"
            size="small"
          >
            <el-icon><Guide /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="测量工具" placement="left">
          <el-button 
            :type="isMeasuring ? 'primary' : 'default'"
            @click="toggleMeasure"
            size="small"
          >
            <el-icon><Ruler /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="绘制工具" placement="left">
          <el-button 
            :type="isDrawing ? 'primary' : 'default'"
            @click="toggleDraw"
            size="small"
          >
            <el-icon><EditPen /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="我的位置" placement="left">
          <el-button 
            @click="locateMe"
            size="small"
          >
            <el-icon><Position /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
    </div>
    
    <!-- 地图操作 -->
    <div class="control-group action-group">
      <el-button-group vertical>
        <el-tooltip content="重置视图" placement="left">
          <el-button @click="resetView" size="small">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="清空地图" placement="left">
          <el-button @click="clearMap" size="small">
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="切换主题" placement="left">
          <el-button @click="toggleTheme" size="small">
            <el-icon>
              <component :is="themeIcon" />
            </el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="全屏显示" placement="left">
          <el-button @click="toggleFullscreen" size="small">
            <el-icon>
              <component :is="fullscreenIcon" />
            </el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="分享地图" placement="left">
          <el-button @click="shareMap" size="small">
            <el-icon><Share /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
    </div>
    
    <!-- 缩放控制 -->
    <div class="control-group zoom-group">
      <el-button-group vertical>
        <el-tooltip content="放大" placement="left">
          <el-button @click="zoomIn" size="small">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="缩小" placement="left">
          <el-button @click="zoomOut" size="small">
            <el-icon><Minus /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="适合窗口" placement="left">
          <el-button @click="fitBounds" size="small">
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
    </div>
    
    <!-- 路径规划面板 -->
    <RoutePlanningPanel 
      v-if="isPlanningRoute"
      @close="closeRoutePlanning"
      @calculate="calculateRoute"
    />
    
    <!-- 标记点列表面板 -->
    <MarkerListPanel 
      v-if="showMarkerList"
      @close="showMarkerList = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '@/store/modules/map'
import { geocodeService } from '@/api/mapService'
import RoutePlanningPanel from './RoutePlanningPanel.vue'
import MarkerListPanel from './MarkerListPanel.vue'
import { 
  Search, ArrowDown, Check, Clock,
  MapLocation, Picture, Promotion, MoonNight,
  Location, Guide, Ruler, EditPen,
  Position, Refresh, Delete, Share,
  Plus, Minus, FullScreen, Sunny,
  Moon, Expand, Fold
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Store
const mapStore = useMapStore()

// Refs
const searchQuery = ref('')
const isSearching = ref(false)
const searchType = ref('place')
const showSearchHistory = ref(false)
const isAddingMarker = ref(false)
const isPlanningRoute = ref(false)
const isMeasuring = ref(false)
const isDrawing = ref(false)
const isFullscreen = ref(false)
const showMarkerList = ref(false)

// Computed
const recentSearches = computed(() => mapStore.recentSearches)
const activeLayer = computed(() => mapStore.activeLayer)
const themeIcon = computed(() => mapStore.mapTheme === 'light' ? Moon : Sunny)
const fullscreenIcon = computed(() => isFullscreen.value ? Fold : Expand)

// 获取搜索建议
const fetchSuggestions = async (query, callback) => {
  if (!query.trim()) {
    showSearchHistory.value = true
    callback([])
    return
  }
  
  showSearchHistory.value = false
  
  try {
    const suggestions = await geocodeService.getSuggestions(query, searchType.value)
    callback(suggestions)
  } catch (error) {
    console.error('获取搜索建议失败:', error)
    callback([])
  }
}

// 处理选择建议
const handleSelect = (item) => {
  searchQuery.value = item.value
  handleSearch()
}

// 执行搜索
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }
  
  isSearching.value = true
  
  try {
    const result = await geocodeService.search(searchQuery.value, searchType.value)
    
    if (result && result.lat && result.lng) {
      // 添加到搜索历史
      mapStore.addSearchToHistory(searchQuery.value, result.lat, result.lng)
      
      // 跳转到位置
      emit('search-result', result)
      
      // 在地图上添加标记
      emit('add-marker', {
        lat: result.lat,
        lng: result.lng,
        title: result.display_name || searchQuery.value,
        type: 'poi'
      })
      
      ElMessage.success(`已找到: ${result.display_name || searchQuery.value}`)
    } else {
      ElMessage.warning('未找到相关地点')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    isSearching.value = false
  }
}

// 从历史记录搜索
const searchFromHistory = (item) => {
  searchQuery.value = item.query
  emit('search-result', { lat: item.lat, lng: item.lng })
}

// 清空搜索历史
const clearSearchHistory = () => {
  mapStore.clearSearchHistory()
  ElMessage.success('已清空搜索历史')
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60 * 60 * 1000) { // 1小时内
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  } else if (diff < 24 * 60 * 60 * 1000) { // 1天内
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  } else {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }
}

// 切换搜索类型
const handleSearchType = (type) => {
  searchType.value = type
}

// 切换图层
const changeLayer = (layerId) => {
  mapStore.setActiveLayer(layerId)
}

// 切换添加标记模式
const toggleAddMarker = () => {
  isAddingMarker.value = !isAddingMarker.value
  isPlanningRoute.value = false
  isMeasuring.value = false
  isDrawing.value = false
  
  emit('toggle-add-marker', isAddingMarker.value)
}

// 切换路径规划
const toggleRoutePlanning = () => {
  isPlanningRoute.value = !isPlanningRoute.value
  isAddingMarker.value = false
  isMeasuring.value = false
  isDrawing.value = false
}

// 切换测量模式
const toggleMeasure = () => {
  isMeasuring.value = !isMeasuring.value
  isAddingMarker.value = false
  isPlanningRoute.value = false
  isDrawing.value = false
  
  emit('toggle-measure', isMeasuring.value)
}

// 切换绘制模式
const toggleDraw = () => {
  isDrawing.value = !isDrawing.value
  isAddingMarker.value = false
  isPlanningRoute.value = false
  isMeasuring.value = false
  
  emit('toggle-draw', isDrawing.value)
}

// 定位到我的位置
const locateMe = () => {
  if (!navigator.geolocation) {
    ElMessage.error('您的浏览器不支持地理位置功能')
    return
  }
  
  ElMessage.info('正在获取您的位置...')
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      emit('locate-me', { lat: latitude, lng: longitude })
      ElMessage.success('已定位到您的位置')
    },
    (error) => {
      console.error('定位失败:', error)
      let message = '获取位置失败'
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = '位置访问被拒绝，请检查浏览器设置'
          break
        case error.POSITION_UNAVAILABLE:
          message = '位置信息不可用'
          break
        case error.TIMEOUT:
          message = '获取位置超时'
          break
      }
      
      ElMessage.error(message)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

// 重置视图
const resetView = () => {
  emit('reset-view')
}

// 清空地图
const clearMap = () => {
  ElMessageBox.confirm('确定要清空地图上的所有标记和路线吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    mapStore.clearAllData()
    emit('clear-map')
    ElMessage.success('地图已清空')
  }).catch(() => {})
}

// 切换主题
const toggleTheme = () => {
  mapStore.toggleTheme()
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error('全屏失败:', err)
      ElMessage.error('全屏模式不可用')
    })
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 分享地图
const shareMap = () => {
  const url = window.location.href
  const title = document.title
  
  if (navigator.share) {
    navigator.share({
      title: title,
      text: '来看看这个地图',
      url: url
    }).catch(err => {
      console.error('分享失败:', err)
      copyToClipboard(url)
    })
  } else {
    copyToClipboard(url)
  }
}

// 复制到剪贴板
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  }).catch(err => {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动复制链接')
  })
}

// 缩放控制
const zoomIn = () => {
  emit('zoom-in')
}

const zoomOut = () => {
  emit('zoom-out')
}

const fitBounds = () => {
  emit('fit-bounds')
}

// 关闭路径规划
const closeRoutePlanning = () => {
  isPlanningRoute.value = false
}

// 计算路线
const calculateRoute = (data) => {
  emit('calculate-route', data)
}

// 监听点击外部关闭搜索历史
const handleClickOutside = (event) => {
  if (!event.target.closest('.search-group')) {
    showSearchHistory.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 监听搜索框变化
watch(searchQuery, (newVal) => {
  if (!newVal) {
    showSearchHistory.value = true
  }
})

// Emits
const emit = defineEmits([
  'search-result',
  'add-marker',
  'toggle-add-marker',
  'toggle-measure',
  'toggle-draw',
  'locate-me',
  'reset-view',
  'clear-map',
  'zoom-in',
  'zoom-out',
  'fit-bounds',
  'calculate-route'
])
</script>

<style lang="scss" scoped>
.map-controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-group {
  background: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px var(--shadow-color);
  overflow: hidden;
}

.search-group {
  width: 350px;
  padding: 10px;
  
  :deep(.el-autocomplete) {
    width: 100%;
  }
}

.search-history {
  margin-top: 10px;
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 5px;
  
  span {
    font-size: 12px;
    color: var(--info-color);
  }
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 8px;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  .query {
    flex: 1;
    font-size: 13px;
    color: var(--text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .time {
    font-size: 11px;
    color: var(--info-color);
  }
  
  .el-icon {
    color: var(--info-color);
    font-size: 12px;
  }
}

.layer-group {
  padding: 8px;
  
  .el-button-group {
    display: flex;
    gap: 2px;
  }
}

.tool-group,
.action-group,
.zoom-group {
  padding: 8px;
  
  .el-button-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .map-controls {
    top: 10px;
    left: 10px;
    right: 10px;
  }
  
  .search-group {
    width: 100%;
  }
  
  .layer-group,
  .tool-group,
  .action-group,
  .zoom-group {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    
    .el-button-group {
      flex-direction: row;
    }
  }
  
  .layer-group {
    bottom: 80px;
  }
}
</style>