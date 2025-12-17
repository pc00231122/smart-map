import axios from 'axios'

// 创建axios实例
const http = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 显示加载状态
    if (config.showLoading !== false) {
      // 可以在这里触发全局loading
    }
    
    // 添加用户代理（某些API需要）
    if (config.url.includes('nominatim')) {
      config.headers['User-Agent'] = 'SmartMapApp/1.0 (contact@example.com)'
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    // 隐藏加载状态
    // 可以在这里触发全局loading隐藏
    
    return response.data
  },
  (error) => {
    console.error('API请求错误:', error)
    
    // 统一错误处理
    let message = '请求失败'
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权访问'
          break
        case 403:
          message = '访问被拒绝'
          break
        case 404:
          message = '资源不存在'
          break
        case 429:
          message = '请求过于频繁，请稍后重试'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
        case 503:
        case 504:
          message = '服务暂时不可用'
          break
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络'
    } else {
      message = error.message
    }
    
    // 可以在这里触发全局错误提示
    return Promise.reject({ message, original: error })
  }
)

// 地理编码服务
export const geocodeService = {
  // 搜索地点
  async search(query, type = 'place') {
    try {
      const params = {
        q: query,
        format: 'json',
        limit: 10,
        addressdetails: 1,
        'accept-language': 'zh-CN'
      }
      
      // 根据类型调整参数
      if (type === 'address') {
        params.addressdetails = 1
      } else if (type === 'poi') {
        params.polygon_geojson = 1
      }
      
      const response = await http.get('/nominatim/search', {
        params,
        showLoading: true
      })
      
      return Array.isArray(response) ? response[0] : response
    } catch (error) {
      console.error('地理编码搜索失败:', error)
      throw error
    }
  },
  
  // 反向地理编码
  async reverse(lat, lng) {
    try {
      const response = await http.get('/nominatim/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json',
          'accept-language': 'zh-CN'
        }
      })
      
      return response
    } catch (error) {
      console.error('反向地理编码失败:', error)
      throw error
    }
  },
  
  // 获取搜索建议
  async getSuggestions(query, type = 'place') {
    try {
      const response = await http.get('/nominatim/search', {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          addressdetails: 0,
          'accept-language': 'zh-CN'
        }
      })
      
      return (Array.isArray(response) ? response : []).map(item => ({
        value: item.display_name,
        lat: item.lat,
        lon: item.lon,
        type: item.type,
        importance: item.importance
      }))
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      return []
    }
  },
  
  // 获取附近POI
  async getNearbyPOI(lat, lng, radius = 1000, categories = []) {
    try {
      // 构建Overpass QL查询
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"](${lat - 0.01},${lng - 0.01},${lat + 0.01},${lng + 0.01});
          node["shop"](${lat - 0.01},${lng - 0.01},${lat + 0.01},${lng + 0.01});
          node["tourism"](${lat - 0.01},${lng - 0.01},${lat + 0.01},${lng + 0.01});
        );
        out body;
        >;
        out skel qt;
      `
      
      const response = await http.post('/overpass/api/interpreter', query, {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
      
      return response.elements || []
    } catch (error) {
      console.error('获取附近POI失败:', error)
      return []
    }
  }
}

// 路线规划服务
export const routingService = {
  // 计算路线
  async calculateRoute(start, end, profile = 'driving') {
    try {
      const response = await http.get(`/router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}`, {
        params: {
          overview: 'full',
          geometries: 'geojson',
          steps: true,
          alternatives: 3
        }
      })
      
      return response
    } catch (error) {
      console.error('路线规划失败:', error)
      
      // 如果OSRM服务不可用，返回模拟数据
      return {
        routes: [{
          distance: 10000,
          duration: 1800,
          geometry: {
            coordinates: [
              [start.lng, start.lat],
              [(start.lng + end.lng) / 2, (start.lat + end.lat) / 2],
              [end.lng, end.lat]
            ]
          },
          legs: [{
            steps: [],
            summary: '',
            distance: 10000,
            duration: 1800
          }]
        }],
        waypoints: [
          { location: [start.lng, start.lat], name: '起点' },
          { location: [end.lng, end.lat], name: '终点' }
        ]
      }
    }
  },
  
  // 获取距离矩阵
  async getDistanceMatrix(origins, destinations, profile = 'driving') {
    try {
      // 简化实现：计算两点间直线距离
      const matrix = origins.map(origin => {
        return destinations.map(destination => {
          const distance = calculateDistance(origin, destination)
          return {
            distance,
            duration: distance / 10 // 假设平均速度10m/s
          }
        })
      })
      
      return matrix
    } catch (error) {
      console.error('获取距离矩阵失败:', error)
      throw error
    }
  }
}

// 天气服务
export const weatherService = {
  // 获取天气信息
  async getWeather(lat, lng) {
    try {
      const response = await http.get('/weather/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lng,
          current_weather: true,
          hourly: 'temperature_2m,relativehumidity_2m,weathercode,windspeed_10m',
          daily: 'weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset',
          timezone: 'auto'
        }
      })
      
      return response
    } catch (error) {
      console.error('获取天气信息失败:', error)
      
      // 返回模拟数据
      return {
        current_weather: {
          temperature: 25,
          windspeed: 3,
          winddirection: 180,
          weathercode: 1,
          time: new Date().toISOString()
        },
        daily: {
          time: [new Date().toISOString().split('T')[0]],
          weathercode: [1],
          temperature_2m_max: [28],
          temperature_2m_min: [22],
          sunrise: ['06:00'],
          sunset: ['18:00']
        }
      }
    }
  },
  
  // 获取空气质量
  async getAirQuality(lat, lng) {
    try {
      // 使用OpenAQ API（免费）
      const response = await http.get('https://api.openaq.org/v2/latest', {
        params: {
          coordinates: `${lat},${lng}`,
          radius: 10000,
          limit: 1
        }
      })
      
      return response.results?.[0] || null
    } catch (error) {
      console.error('获取空气质量失败:', error)
      return null
    }
  }
}

// 工具函数
function calculateDistance(coord1, coord2) {
  const R = 6371e3 // 地球半径，单位：米
  const φ1 = coord1.lat * Math.PI / 180
  const φ2 = coord2.lat * Math.PI / 180
  const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180
  const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c // 距离，单位：米
}

export default http