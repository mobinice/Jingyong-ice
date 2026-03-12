let partNumberCounter = 1000

export function generatePartNumber(form) {
  const categoryPrefix = {
    product: 'PRD',
    semi: 'SEM',
    material: 'MAT',
    packaging: 'PKG'
  }

  const prefix = categoryPrefix[form.category] || 'GEN'
  const timestamp = Date.now().toString().slice(-6)
  const counter = (partNumberCounter++).toString().padStart(4, '0')
  
  const partNumber = `${prefix}${timestamp}${counter}`
  
  // 儲存到歷史記錄
  const history = getPartNumberHistory()
  history.unshift({
    partNumber,
    category: form.category,
    productName: form.productName,
    specification: form.specification,
    unit: form.unit,
    vendor: form.vendor,
    createTime: new Date().toLocaleString('zh-TW')
  })
  
  // 限制歷史記錄數量
  if (history.length > 50) {
    history.pop()
  }
  
  localStorage.setItem('partNumberHistory', JSON.stringify(history))
  
  return partNumber
}

export function getPartNumberHistory() {
  const stored = localStorage.getItem('partNumberHistory')
  if (stored) {
    return JSON.parse(stored)
  }
  
  // 預設歷史資料
  return [
    {
      partNumber: 'PRD1234561000',
      category: 'product',
      productName: 'Beat SL 24" A',
      specification: '24" X 12.5"',
      unit: 'SET',
      vendor: '台發-越南',
      createTime: '2025/11/20 14:30:00'
    },
    {
      partNumber: 'MAT1234560999',
      category: 'material',
      productName: 'FRONT HUB',
      specification: 'DC-19 140x',
      unit: 'PC',
      vendor: '台發-越南',
      createTime: '2025/11/20 13:15:00'
    },
    {
      partNumber: 'PKG1234560998',
      category: 'packaging',
      productName: 'CARTON 紙箱',
      specification: '1230*195*690MM',
      unit: 'PC',
      vendor: '台發-越南',
      createTime: '2025/11/20 12:00:00'
    }
  ]
}

