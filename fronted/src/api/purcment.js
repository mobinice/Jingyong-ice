import { get, post, put, del } from './request.js'

/**
 * 取得全部 Purcment 記錄
 * @returns {Promise} { success, data, message }
 */
export function getAllPurcment() {
  return get('/purcment')
}

/**
 * 查詢 Purcment 記錄（支援 BSART, EBELN, EINDT_from, EINDT_to, LIFNR, MATNR）
 * @param {object} filters - 查詢條件
 * @returns {Promise} { success, data, message }
 */
export function queryPurcment(filters = {}) {
  return get('/purcment/query', filters)
}

/**
 * 依主鍵取得單筆 Purcment 記錄
 * @param {string} BSART
 * @param {string} EBELN
 * @param {string} EBELP
 * @returns {Promise} { success, data, message }
 */
export function getPurcmentByKey(BSART, EBELN, EBELP) {
  return get(`/purcment/${encodeURIComponent(BSART)}/${encodeURIComponent(EBELN)}/${encodeURIComponent(EBELP)}`)
}

/**
 * 新增 Purcment 記錄
 * @param {object} data - 欄位資料
 * @returns {Promise} { success, data, message }
 */
export function createPurcment(data) {
  return post('/purcment', data)
}

/**
 * 更新 Purcment 記錄
 * @param {string} BSART
 * @param {string} EBELN
 * @param {string} EBELP
 * @param {object} data - 要更新的欄位（不含主鍵）
 * @returns {Promise} { success, data, message }
 */
export function updatePurcment(BSART, EBELN, EBELP, data) {
  return put(
    `/purcment/${encodeURIComponent(BSART)}/${encodeURIComponent(EBELN)}/${encodeURIComponent(EBELP)}`,
    data
  )
}

/**
 * 刪除 Purcment 記錄
 * @param {string} BSART
 * @param {string} EBELN
 * @param {string} EBELP
 * @returns {Promise} { success, message }
 */
export function deletePurcment(BSART, EBELN, EBELP) {
  return del(
    `/purcment/${encodeURIComponent(BSART)}/${encodeURIComponent(EBELN)}/${encodeURIComponent(EBELP)}`
  )
}

export default {
  getAllPurcment,
  queryPurcment,
  getPurcmentByKey,
  createPurcment,
  updatePurcment,
  deletePurcment
}
