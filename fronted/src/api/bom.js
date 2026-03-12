import { get, post, put, del } from './request.js'

/**
 * 查詢 BOM 記錄（支持多條件）
 * @param {object} filters - 查詢條件
 * @returns {Promise} BOM 記錄列表
 */
export function queryBOM(filters = {}) {
  return get('/bom/query', filters)
}

/**
 * 獲取所有 BOM 記錄
 * @returns {Promise} BOM 記錄列表
 */
export function getAllBOM() {
  return get('/bom')
}

/**
 * 根據 ID 獲取 BOM 記錄
 * @param {number} id - BOM ID
 * @returns {Promise} BOM 記錄
 */
export function getBOMById(id) {
  return get(`/bom/${id}`)
}

/**
 * 創建 BOM 記錄
 * @param {object} data - BOM 數據
 * @returns {Promise} 創建的 BOM 記錄
 */
export function createBOM(data) {
  return post('/bom', data)
}

/**
 * 更新 BOM 記錄
 * @param {number} id - BOM ID
 * @param {object} data - BOM 數據
 * @returns {Promise} 更新的 BOM 記錄
 */
export function updateBOM(id, data) {
  return put(`/bom/${id}`, data)
}

/**
 * 刪除 BOM 記錄
 * @param {number} id - BOM ID
 * @returns {Promise} 刪除結果
 */
export function deleteBOM(id) {
  return del(`/bom/${id}`)
}

/**
 * 批量更新 custMatnr（客戶物料編號）
 * @param {Array} updates - 更新數據陣列，每個元素包含 { id, custMatnr }
 * @returns {Promise} 更新結果
 */
export function batchUpdateCustMatnr(updates) {
  // 如果後端支持批量更新，可以使用此方法
  // 目前先逐個更新
  return Promise.all(updates.map(update => updateBOM(update.id, { custMatnr: update.custMatnr })))
}

export default {
  queryBOM,
  getAllBOM,
  getBOMById,
  createBOM,
  updateBOM,
  deleteBOM,
  batchUpdateCustMatnr
}
