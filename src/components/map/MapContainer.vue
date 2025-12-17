<template>
  <div class="map-container">
    <!-- 地图容器 -->
    <div 
      ref="mapContainer" 
      class="map"
      :class="{ 'measuring-mode': isMeasuring, 'drawing-mode': isDrawing }"
    ></div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="map-loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>{{ loadingText }}</p>
      </div>
    </div>
    
    <!-- 坐标显示 -->
    <div v-if="showCoordinates" class="coordinate-display">
      <div class="coordinate-item">
        <span class="label">经度</span>
        <span class="value">{{ currentLng.toFixed(6) }}</span>
      </div>
      <div class="coordinate-item">
        <span class="label">纬度</span>
        <span class="value">{{ currentLat.toFixed(6) }}</span>
      </div>
      <div class="coordinate-item">
        <span class="label">缩放</span>
        <span class="value">{{ currentZoom }}</span>
      </div>
    </div>
    
    <!-- 比例尺 -->
    <div ref="scaleControl" class="scale-control"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMapStore } from '@/store/modules/map'

// Props
const props = defineProps({
  showCoordinates: {
    type: Boolean,
    default: true
  },
  interactive: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['ready', 'click', 'moveend', 'zoomend'])

// Refs
const mapContainer = ref(null)
const scaleControl = ref(null)
const mapInstance = ref(null)

// Store
const mapStore = useMapStore()

// 状态
const isLoading = ref(true)
const loadingText = ref('地图加载中...')
const currentLat = ref(0)
const currentLng = ref(0)
const currentZoom = ref(13)
const isMeasuring = ref(false)
const isDrawing = ref(false)

// 图层配置
const layers = {
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }),
  
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 19
  }),
  
  topographic: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17
  }),
  
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  })
}

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return
  
  try {
    isLoading.value = true
    loadingText.value = '正在初始化地图...'
    
    await nextTick()
    
    // 创建地图实例
    mapInstance.value = L.map(mapContainer.value, {
      center: [mapStore.currentLocation.lat, mapStore.currentLocation.lng],
      zoom: mapStore.zoomLevel,
      zoomControl: false,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 19,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 60
    })
    
    // 添加默认图层
    layers[mapStore.activeLayer].addTo(mapInstance.value)
    
    // 添加缩放控件
    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance.value)
    
    // 添加比例尺
    if (scaleControl.value) {
      L.control.scale({
        imperial: false,
        position: 'bottomleft'
      }).addTo(mapInstance.value)
    }
    
    // 监听地图事件
    setupMapEvents()
    
    // 加载保存的标记
    loadSavedMarkers()
    
    isLoading.value = false
    emit('ready', mapInstance.value)
    
  } catch (error) {
    console.error('地图初始化失败:', error)
    loadingText.value = '地图加载失败，请刷新页面重试'
  }
}

// 设置地图事件
const setupMapEvents = () => {
  if (!mapInstance.value) return
  
  // 地图点击事件
  mapInstance.value.on('click', (e) => {
    const { lat, lng } = e.latlng
    currentLat.value = lat
    currentLng.value = lng
    
    emit('click', { lat, lng, event: e })
    
    // 如果是测量模式
    if (isMeasuring.value) {
      // 处理测量逻辑
    }
    
    // 如果是绘制模式
    if (isDrawing.value) {
      // 处理绘制逻辑
    }
  })
  
  // 地图移动事件
  mapInstance.value.on('moveend', () => {
    const center = mapInstance.value.getCenter()
    mapStore.currentLocation = { lat: center.lat, lng: center.lng }
    emit('moveend', center)
  })
  
  // 地图缩放事件
  mapInstance.value.on('zoomend', () => {
    currentZoom.value = mapInstance.value.getZoom()
    mapStore.zoomLevel = currentZoom.value
    emit('zoomend', currentZoom.value)
  })
  
  // 地图加载事件
  mapInstance.value.on('load', () => {
    isLoading.value = false
  })
}

// 加载保存的标记
const loadSavedMarkers = () => {
  if (!mapInstance.value || !mapStore.markers.length) return
  
  mapStore.markers.forEach(markerData => {
    createMarker(markerData)
  })
}

// 创建标记
const createMarker = (markerData) => {
  if (!mapInstance.value) return null
  
  const marker = L.marker([markerData.lat, markerData.lng], {
    title: markerData.title || '标记点',
    draggable: markerData.draggable || false,
    icon: createCustomIcon(markerData.type || 'default')
  }).addTo(mapInstance.value)
  
  // 添加弹出窗口
  if (markerData.popupContent) {
    marker.bindPopup(createPopupContent(markerData))
  }
  
  // 添加拖拽事件
  if (markerData.draggable) {
    marker.on('dragend', (e) => {
      const newPos = e.target.getLatLng()
      mapStore.updateMarker(markerData.id, {
        lat: newPos.lat,
        lng: newPos.lng
      })
    })
  }
  
  return marker
}

// 创建自定义图标
const createCustomIcon = (type) => {
  const iconColors = {
    default: '#409EFF',
    home: '#67C23A',
    work: '#E6A23C',
    favorite: '#F56C6C',
    poi: '#909399'
  }
  
  const color = iconColors[type] || iconColors.default
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  })
}

// 创建弹出窗口内容
const createPopupContent = (markerData) => {
  return `
    <div style="min-width: 200px;">
      <h3 style="margin: 0 0 10px 0; color: var(--text-color);">${markerData.title || '标记点'}</h3>
      <p style="margin: 5px 0; color: var(--info-color);">
        纬度: ${markerData.lat.toFixed(6)}<br>
        经度: ${markerData.lng.toFixed(6)}
      </p>
      ${markerData.description ? `<p style="margin: 10px 0; color: var(--text-color);">${markerData.description}</p>` : ''}
      <div style="margin-top: 10px; font-size: 12px; color: var(--info-color);">
        创建于: ${new Date(markerData.createdAt).toLocaleString()}
      </div>
    </div>
  `
}

// 切换到测量模式
const startMeasuring = () => {
  isMeasuring.value = true
  isDrawing.value = false
  
  // 这里可以集成leaflet-measure插件
  // 为了简化，我们先实现基础功能
}

// 切换到绘制模式
const startDrawing = () => {
  isDrawing.value = true
  isMeasuring.value = false
}

// 停止当前模式
const stopCurrentMode = () => {
  isMeasuring.value = false
  isDrawing.value = false
}

// 清除地图上的所有覆盖物
const clearMap = () => {
  if (!mapInstance.value) return
  
  // 清除所有图层
  mapInstance.value.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Polygon) {
      mapInstance.value.removeLayer(layer)
    }
  })
}

// 移动到指定位置
const panTo = (lat, lng, zoom = 15) => {
  if (!mapInstance.value) return
  
  mapInstance.value.flyTo([lat, lng], zoom, {
    duration: 1.5,
    easeLinearity: 0.25
  })
}

// 获取地图实例
const getMap = () => mapInstance.value

// 生命周期
onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.remove()
  }
})

// 监听主题变化
watch(() => mapStore.mapTheme, (newTheme) => {
  if (mapInstance.value) {
    // 重新加载地图以适应主题
    mapInstance.value.invalidateSize()
  }
})

// 监听图层变化
watch(() => mapStore.activeLayer, (newLayer) => {
  if (mapInstance.value && layers[newLayer]) {
    // 移除当前图层
    mapInstance.value.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstance.value.removeLayer(layer)
      }
    })
    
    // 添加新图层
    layers[newLayer].addTo(mapInstance.value)
  }
})

// 暴露方法给父组件
defineExpose({
  getMap,
  panTo,
  clearMap,
  startMeasuring,
  startDrawing,
  stopCurrentMode
})
</script>

<style lang="scss" scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  width: 100%;
  height: 100%;
  background: var(--hover-color);
  
  &.measuring-mode {
    cursor: crosshair;
  }
  
  &.drawing-mode {
    cursor: crosshair;
  }
}

.map-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  background: var(--bg-color);
  padding: 30px 40px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.loading-content p {
  margin-top: 15px;
  color: var(--text-color);
}

.coordinate-display {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: var(--bg-color);
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  z-index: 800;
  display: flex;
  gap: 15px;
}

.coordinate-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.coordinate-item .label {
  font-size: 12px;
  color: var(--info-color);
  margin-bottom: 4px;
}

.coordinate-item .value {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: var(--text-color);
}

.scale-control {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 800;
}

// Leaflet覆盖默认样式
:deep(.leaflet-control-attribution) {
  background: rgba(255, 255, 255, 0.8) !important;
  font-size: 11px !important;
  
  [data-theme="dark"] & {
    background: rgba(0, 0, 0, 0.8) !important;
    color: #ccc !important;
  }
}

:deep(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: 0 2px 8px var(--shadow-color) !important;
  border-radius: 8px !important;
  overflow: hidden;
  
  a {
    background: var(--bg-color) !important;
    color: var(--text-color) !important;
    border: 1px solid var(--border-color) !important;
    width: 36px !important;
    height: 36px !important;
    line-height: 36px !important;
    font-size: 18px !important;
    
    &:hover {
      background: var(--hover-color) !important;
    }
  }
}

:deep(.leaflet-control-scale) {
  background: var(--bg-color) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 4px !important;
  padding: 2px 5px !important;
  color: var(--text-color) !important;
  font-size: 11px !important;
}

:deep(.leaflet-popup-content-wrapper) {
  background: var(--bg-color) !important;
  color: var(--text-color) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px var(--shadow-color) !important;
}

:deep(.leaflet-popup-tip) {
  background: var(--bg-color) !important;
}
</style>