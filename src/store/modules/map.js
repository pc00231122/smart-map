import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useMapStore = defineStore('map', () => {
  // 状态定义
  const currentLocation = ref({
    lat: parseFloat(process.env.VUE_APP_MAP_CENTER_LAT) || 39.9042,
    lng: parseFloat(process.env.VUE_APP_MAP_CENTER_LNG) || 116.4074
  })
  
  const zoomLevel = ref(parseInt(process.env.VUE_APP_DEFAULT_ZOOM) || 13)
  const markers = ref([])
  const polylines = ref([])
  const polygons = ref([])
  const searchHistory = ref([])
  const mapTheme = ref('light')
  const activeLayer = ref('osm')
  const isMeasuring = ref(false)
  const isDrawing = ref(false)
  const isLoading = ref(false)
  
  // Getter计算属性
  const markerCount = computed(() => markers.value.length)
  const recentSearches = computed(() => searchHistory.value.slice(0, 5))
  const totalDistance = computed(() => {
    return polylines.value.reduce((total, line) => total + line.distance, 0)
  })
  
  // Actions
  const addMarker = (marker) => {
    const newMarker = {
      ...marker,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString()
    }
    markers.value.push(newMarker)
    saveToLocalStorage()
    return newMarker
  }
  
  const removeMarker = (id) => {
    const index = markers.value.findIndex(m => m.id === id)
    if (index !== -1) {
      markers.value.splice(index, 1)
      saveToLocalStorage()
    }
  }
  
  const updateMarker = (id, updates) => {
    const marker = markers.value.find(m => m.id === id)
    if (marker) {
      Object.assign(marker, updates)
      saveToLocalStorage()
    }
  }
  
  const addSearchToHistory = (query, lat, lng) => {
    // 移除重复的
    const existingIndex = searchHistory.value.findIndex(
      item => item.query === query
    )
    
    if (existingIndex !== -1) {
      searchHistory.value.splice(existingIndex, 1)
    }
    
    // 添加到开头
    searchHistory.value.unshift({
      query,
      lat,
      lng,
      timestamp: new Date().toISOString()
    })
    
    // 限制历史记录数量
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10)
    }
    
    saveToLocalStorage()
  }
  
  const clearSearchHistory = () => {
    searchHistory.value = []
    saveToLocalStorage()
  }
  
  const toggleTheme = () => {
    mapTheme.value = mapTheme.value === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', mapTheme.value)
    localStorage.setItem('theme', mapTheme.value)
  }
  
  const setActiveLayer = (layerId) => {
    activeLayer.value = layerId
    localStorage.setItem('activeLayer', layerId)
  }
  
  const saveToLocalStorage = () => {
    try {
      const data = {
        markers: markers.value,
        searchHistory: searchHistory.value,
        currentLocation: currentLocation.value,
        zoomLevel: zoomLevel.value
      }
      localStorage.setItem('mapData', JSON.stringify(data))
    } catch (error) {
      console.error('保存到本地存储失败:', error)
    }
  }
  
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('mapData')
      const savedTheme = localStorage.getItem('theme')
      const savedLayer = localStorage.getItem('activeLayer')
      
      if (savedData) {
        const data = JSON.parse(savedData)
        markers.value = data.markers || []
        searchHistory.value = data.searchHistory || []
        currentLocation.value = data.currentLocation || currentLocation.value
        zoomLevel.value = data.zoomLevel || zoomLevel.value
      }
      
      if (savedTheme) {
        mapTheme.value = savedTheme
        document.documentElement.setAttribute('data-theme', savedTheme)
      }
      
      if (savedLayer) {
        activeLayer.value = savedLayer
      }
    } catch (error) {
      console.error('从本地存储加载失败:', error)
    }
  }
  
  const clearAllData = () => {
    markers.value = []
    polylines.value = []
    polygons.value = []
    searchHistory.value = []
    saveToLocalStorage()
  }
  
  // 初始化时加载数据
  loadFromLocalStorage()
  
  // 监听状态变化自动保存
  watch(
    [markers, searchHistory, currentLocation, zoomLevel],
    () => {
      saveToLocalStorage()
    },
    { deep: true }
  )
  
  return {
    // 状态
    currentLocation,
    zoomLevel,
    markers,
    polylines,
    polygons,
    searchHistory,
    mapTheme,
    activeLayer,
    isMeasuring,
    isDrawing,
    isLoading,
    
    // Getter
    markerCount,
    recentSearches,
    totalDistance,
    
    // Actions
    addMarker,
    removeMarker,
    updateMarker,
    addSearchToHistory,
    clearSearchHistory,
    toggleTheme,
    setActiveLayer,
    loadFromLocalStorage,
    clearAllData
  }
})