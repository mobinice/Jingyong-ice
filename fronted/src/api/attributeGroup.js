import { get, post, put, del } from './request.js'

/**
 * 屬性組規則列表（後端回傳欄位：code, definition, style, serialNumber, sapModel, status）
 * @param {string} keyword - 搜尋代碼或定義
 * @returns {Promise} { success, data, message }
 */
export function getRulesList(keyword = '') {
  return get('/attributeGroup/rules', keyword ? { keyword } : {})
}

/**
 * 依 code 取得單筆規則
 * @param {string} code - 代碼（INVMB.MI002）
 * @returns {Promise} { success, data, message }
 */
export function getRuleByCode(code) {
  return get(`/attributeGroup/rules/${encodeURIComponent(code)}`)
}

/**
 * 屬性代碼清單（後端回傳欄位：code, definition, refs）
 * @param {string} lang - 語系 zh-TW | en
 * @returns {Promise} { success, data, message }
 */
export function getDictionaryList(lang = 'zh-TW') {
  return get('/attributeGroup/dictionary', { lang })
}

/**
 * 依 code 取得詳情與屬性值（後端回傳：code, definition, refs, values[{ value, label }]）
 * @param {string} code - 代碼
 * @returns {Promise} { success, data, message }
 */
export function getDictionaryByCode(code) {
  return get(`/attributeGroup/dictionary/${encodeURIComponent(code)}`)
}

export function createRule(data) {
  return post('/attributeGroup/rules', data)
}
export function updateRule(code, data) {
  return put(`/attributeGroup/rules/${encodeURIComponent(code)}`, data)
}
export function deleteRule(code) {
  return del(`/attributeGroup/rules/${encodeURIComponent(code)}`)
}
export function createDictionaryCode(data) {
  return post('/attributeGroup/dictionary', data)
}
export function updateDictionaryCode(code, data) {
  return put(`/attributeGroup/dictionary/${encodeURIComponent(code)}`, data)
}
export function deleteDictionaryCode(code) {
  return del(`/attributeGroup/dictionary/${encodeURIComponent(code)}`)
}
export function createOptionValue(code, data) {
  return post(`/attributeGroup/dictionary/${encodeURIComponent(code)}/values`, data)
}
export function updateOptionValue(code, value, data) {
  return put(`/attributeGroup/dictionary/${encodeURIComponent(code)}/values/${encodeURIComponent(value)}`, data)
}
export function deleteOptionValue(code, value) {
  return del(`/attributeGroup/dictionary/${encodeURIComponent(code)}/values/${encodeURIComponent(value)}`)
}

export default {
  getRulesList,
  getRuleByCode,
  getDictionaryList,
  getDictionaryByCode,
  createRule,
  updateRule,
  deleteRule,
  createDictionaryCode,
  updateDictionaryCode,
  deleteDictionaryCode,
  createOptionValue,
  updateOptionValue,
  deleteOptionValue
}
