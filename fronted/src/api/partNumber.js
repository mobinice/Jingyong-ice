import { get, post } from './request.js'

export function getAttrGroups() {
  return get('/part-numbers/attr-groups')
}

export function getNextSerial(attrGroup) {
  return post('/part-numbers/serial/next', { attrGroup })
}

export function createPartNumber(payload) {
  return post('/part-numbers', payload)
}

export function getBOMList(keyword = '') {
  return get('/part-numbers/bom-list', keyword ? { keyword } : {})
}
