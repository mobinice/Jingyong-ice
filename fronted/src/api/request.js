// API 基礎配置
// 開發環境：設定 VITE_API_BASE_URL=http://localhost:3000/api
// 生產環境：使用相對路徑 /api，由 Nginx 代理到後端
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 通用 fetch 請求函數
 * @param {string} url - 請求 URL
 * @param {object} options - fetch 選項
 * @returns {Promise} 響應數據
 */
export async function request(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  const config = {
    ...defaultOptions,
    ...options
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '請求失敗' }))
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

/**
 * GET 請求
 */
export function get(url, params = {}) {
  const queryString = new URLSearchParams(params).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url
  return request(fullUrl, {
    method: 'GET'
  })
}

/**
 * POST 請求
 */
export function post(url, data = {}) {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * PUT 請求
 */
export function put(url, data = {}) {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * DELETE 請求
 */
export function del(url) {
  return request(url, {
    method: 'DELETE'
  })
}

export default {
  request,
  get,
  post,
  put,
  delete: del
}
