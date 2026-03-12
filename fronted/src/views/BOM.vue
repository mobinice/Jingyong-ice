<template>
  <div>
    <el-row justify="space-between" align="middle" style="margin-bottom: 20px">
      <el-col>
        <h2 style="margin: 0">{{ t('bom.title') }}</h2>
      </el-col>
      <el-col :span="12" style="text-align: right">
        <el-space>
          <el-button v-show="false" :icon="Check" @click="handleSubmit">{{ t('bom.submit') }}</el-button>
          <el-button v-show="false" :icon="Printer">{{ t('bom.print') }}</el-button>
          <el-button v-show="false" :icon="Download" @click="handleExcelExport">{{ t('bom.excelExport') }}</el-button>
          <el-button v-show="false" :icon="Upload" @click="handleExcelImport">{{ t('bom.excelImport') }}</el-button>
          <el-button v-show="false" :icon="DocumentCopy" @click="handleDownloadDemo">{{ t('bom.excelImportDemo') }}</el-button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".xlsx,.xls"
            style="display: none"
            @change="handleFileChange"
          />
          <el-button v-show="false" :icon="DocumentChecked">{{ t('bom.dataValidation') }}</el-button>
        </el-space>
      </el-col>
    </el-row>
      <el-card style="margin-bottom: 20px">
      <el-form :model="searchForm" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('bom.finalProduct')">
              <el-autocomplete
                v-model="searchForm.prodNr"
                :fetch-suggestions="queryProdNrOptions"
                :placeholder="t('bom.searchPlaceholder')"
                style="width: 100%"
                clearable
                :trigger-on-focus="true"
                @select="handleProdNrSelect"
              />
            </el-form-item>
            <el-form-item :label="t('bom.productName')">
              <el-autocomplete
                v-model="searchForm.prodName"
                :fetch-suggestions="queryProdNameOptions"
                :placeholder="t('bom.searchPlaceholder')"
                style="width: 100%"
                clearable
                :trigger-on-focus="true"
                @select="handleProdNameSelect"
              />
            </el-form-item>
            <el-form-item :label="t('bom.ajProductNo')">
              <el-input
                v-model="searchForm.matnr"
                placeholder=""
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('bom.custProductNo')">
              <el-input
                v-model="searchForm.custProdNr"
                placeholder=""
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item :label="t('bom.ajOrderNo')">
              <el-autocomplete
                v-model="searchForm.soNr"
                :fetch-suggestions="querySoNrOptions"
                :placeholder="t('bom.searchPlaceholder')"
                style="width: 100%"
                clearable
                :trigger-on-focus="true"
                @select="handleSoNrSelect"
              />
            </el-form-item>
            <el-form-item :label="t('bom.referenctNo')">
              <el-input
                v-model="searchForm.referenctNo"
                placeholder=""
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-space>
            <el-button type="primary" :icon="Search" @click="handleQuery">{{ t('bom.query') }}</el-button>
            <el-button type="primary" @click="handleReset">{{ t('bom.reset') }}</el-button>
          </el-space>
        </el-form-item>
      </el-form>
      </el-card>

      <el-table
        ref="tableRef"
        :data="groupedTableData"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
        row-key="uniqueKey"
        :default-expand-all="false"
        fit
      >
        <el-table-column type="expand">
          <template #default="props">
            <div style="margin: 20px 20px 20px 40px">
              <!-- 第二層：子表 BOM 細項 -->
              <el-card shadow="never" style="background-color: #fafafa">
                <template #header>
                  <el-row justify="space-between" align="middle">
                    <span style="font-size: 15px; font-weight: 600; color: #303133">{{ t('bom.bomDetails', [props.row.prodNr]) }}</span>
                    <el-space>
                      <el-button size="small" :icon="Download" @click="handleExportBOMForParent(props.row)">{{ t('bom.exportBom') }}</el-button>
                      <el-button size="small" :icon="Upload" @click="handleImportBOMForParent(props.row)">{{ t('bom.importBom') }}</el-button>
                      <el-button size="small" :icon="DocumentCopy" @click="handleDownloadDemo">{{ t('bom.bomDemo') }}</el-button>
                    </el-space>
                  </el-row>
                </template>
                <el-table :data="props.row.children" border size="small" style="width: 100%" row-key="uniqueKey">
                  <el-table-column :label="t('bom.internalPartNo')" min-width="160">
                    <template #default="scope">
                      <span v-if="editingRow !== getRowKey(scope.row) || editingField !== 'matnr'" class="cell-with-edit">
                        {{ scope.row.matnr || '-' }}
                        <el-icon class="edit-icon" @click="handleCellEditClick(getRowKey(scope.row), 'matnr', scope.row)"><Edit /></el-icon>
                      </span>
                      <el-input
                        v-else
                        v-model="scope.row.matnr"
                        size="small"
                        class="cell-input"
                        @blur="handleCellBlur(getRowKey(scope.row), 'matnr', scope.row)"
                        @keyup.enter="handleCellBlur(getRowKey(scope.row), 'matnr', scope.row)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column :label="t('bom.component')" min-width="140" prop="vendorName" show-overflow-tooltip />
                  <el-table-column :label="t('bom.spec')" min-width="160" prop="matnrSpec" show-overflow-tooltip />
                  <el-table-column :label="t('bom.qty')" min-width="90" prop="usageQnty" align="right" />
                  <el-table-column :label="t('bom.customerPartNo')" min-width="160">
                    <template #default="scope">
                      <span v-if="editingRow !== getRowKey(scope.row) || editingField !== 'custMatnr'" class="cell-with-edit">
                        {{ scope.row.custMatnr || '-' }}
                        <el-icon class="edit-icon" @click="handleCellEditClick(getRowKey(scope.row), 'custMatnr', scope.row)"><Edit /></el-icon>
                      </span>
                      <el-input
                        v-else
                        v-model="scope.row.custMatnr"
                        size="small"
                        class="cell-input"
                        @blur="handleCellBlur(getRowKey(scope.row), 'custMatnr', scope.row)"
                        @keyup.enter="handleCellBlur(getRowKey(scope.row), 'custMatnr', scope.row)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column :label="t('bom.origin')" min-width="120">
                    <template #default="scope">
                      <span v-if="editingRow !== getRowKey(scope.row) || editingField !== 'originLocal'" class="cell-with-edit">
                        {{ scope.row.originLocal || '-' }}
                        <el-icon class="edit-icon" @click="handleCellEditClick(getRowKey(scope.row), 'originLocal', scope.row)"><Edit /></el-icon>
                      </span>
                      <el-input
                        v-else
                        v-model="scope.row.originLocal"
                        size="small"
                        class="cell-input"
                        @blur="handleCellBlur(getRowKey(scope.row), 'originLocal', scope.row)"
                        @keyup.enter="handleCellBlur(getRowKey(scope.row), 'originLocal', scope.row)"
                      />
                    </template>
                  </el-table-column>
                </el-table>
                <el-row justify="end" style="margin-top: 12px">
                  <el-space>
                    <el-button @click="handleCancelExpand(props.row)">{{ t('bom.cancel') }}</el-button>
                    <el-button type="primary" @click="handleSaveForParent(props.row)">{{ t('bom.save') }}</el-button>
                  </el-space>
                </el-row>
              </el-card>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('bom.finalProductCol')" min-width="160" show-overflow-tooltip>
          <template #default="scope">
            <span style="font-weight: 600; color: #303133">{{ scope.row.prodNr || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('bom.internalPartNo')" min-width="140" align="center">
          <template #default>-</template>
        </el-table-column>
        <el-table-column prop="custProdNr" :label="t('bom.custProductNoCol')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="prodName" :label="t('bom.productNameCol')" min-width="180" show-overflow-tooltip />
        <el-table-column prop="prodSpec" :label="t('bom.spec')" min-width="140" show-overflow-tooltip />
        <el-table-column :label="t('bom.custPartNoCol')" min-width="160">
          <template #default="scope">
            <el-input v-model="scope.row.custPartNo" size="small" placeholder="" clearable />
          </template>
        </el-table-column>
      </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Printer, Download, Upload, DocumentChecked, Search, DocumentCopy, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { queryBOM, updateBOM } from '@/api/bom'

const { t } = useI18n()

const loading = ref(false)
const flatTableData = ref([])
const groupedTableData = ref([])
const editingRow = ref(null)
const editingField = ref(null)
const fileInputRef = ref(null)
const tableRef = ref(null)
const importTargetParent = ref(null)
const allProdNrOptions = ref([]) // 儲存所有 Final Product 選項
const allProdNameOptions = ref([]) // 儲存所有 Product Name 選項
const allSoNrOptions = ref([]) // 儲存所有 A&J Order No 選項

const searchForm = reactive({
  prodNr: '',
  prodName: '',
  matnr: '',
  custProdNr: '',
  soNr: '',
  referenctNo: ''
})

// 將扁平資料轉換為分組結構（用於 expand 表格）
const convertToGroupedData = (flatData) => {
  const grouped = {}
  
  flatData.forEach((item) => {
    const key = item.prodNr
    if (!grouped[key]) {
      // 找到父項目（matnr === prodNr）
      const parentItem = flatData.find(i => i.prodNr === key && i.matnr === key)
      grouped[key] = {
        uniqueKey: `parent-${key}`,
        prodNr: item.prodNr,
        custProdNr: item.custProdNr || '',
        prodName: item.prodName || '',
        prodSpec: item.prodSpec || '',
        custPartNo: item.custPartNo ?? item.custProdNr ?? '',
        children: []
      }
    }
    
    // 添加子項目（排除與父層相同的項目，即 matnr === prodNr 的情況）
    if (item.matnr !== item.prodNr) {
      grouped[key].children.push({
        uniqueKey: `${item.prodNr}-${item.matnr}-${item.id}`,
        ...item,
        originLocal: item.originLocal ?? ''
      })
    }
  })
  
  return Object.values(grouped)
}

// 取得行唯一鍵值
const getRowKey = (row) => {
  return row.uniqueKey || `${row.prodNr}-${row.matnr}-${row.id}`
}

// 載入所有選項（Final Product 和 Product Name）
const loadAllOptions = async () => {
  try {
    // 不帶任何過濾條件，獲取所有資料
    const response = await queryBOM({})
    if (response.success) {
      const data = response.data || []
      
      // 提取唯一的 prodNr 並去重，同時保留產品名稱等信息
      const prodNrMap = new Map()
      data.forEach(item => {
        if (item.prodNr && !prodNrMap.has(item.prodNr)) {
          prodNrMap.set(item.prodNr, {
            value: item.prodNr,
            label: item.prodNr,
            prodName: item.prodName || '',
            custProdNr: item.custProdNr || ''
          })
        }
      })
      
      allProdNrOptions.value = Array.from(prodNrMap.values())
      
      // 提取唯一的 prodName 並去重
      const prodNameMap = new Map()
      data.forEach(item => {
        if (item.prodName && !prodNameMap.has(item.prodName)) {
          prodNameMap.set(item.prodName, {
            value: item.prodName,
            label: item.prodName,
            prodNr: item.prodNr || '',
            custProdNr: item.custProdNr || ''
          })
        }
      })
      
      allProdNameOptions.value = Array.from(prodNameMap.values())
      
      // 提取唯一的 soNr 並去重
      const soNrMap = new Map()
      data.forEach(item => {
        if (item.soNr && !soNrMap.has(item.soNr)) {
          soNrMap.set(item.soNr, {
            value: item.soNr,
            label: item.soNr,
            prodNr: item.prodNr || '',
            prodName: item.prodName || ''
          })
        }
      })
      
      allSoNrOptions.value = Array.from(soNrMap.values())
    }
  } catch (error) {
    console.error('Load options error:', error)
  }
}

// 查詢 Final Product 選項（前端過濾）
const queryProdNrOptions = (queryString, cb) => {
  const results = queryString
    ? allProdNrOptions.value.filter(item => {
        // 支持按 prodNr、prodName、custProdNr 搜索
        const searchText = queryString.toLowerCase()
        return (
          item.value.toLowerCase().includes(searchText) ||
          item.prodName.toLowerCase().includes(searchText) ||
          item.custProdNr.toLowerCase().includes(searchText)
        )
      })
    : allProdNrOptions.value
  
  // 轉換為 el-autocomplete 需要的格式
  const options = results.map(item => ({
    value: item.value,
    label: item.prodName 
      ? `${item.value} - ${item.prodName}` 
      : item.value
  }))
  
  cb(options)
}

// 處理 Final Product 選擇
const handleProdNrSelect = (item) => {
  searchForm.prodNr = item.value
}

// 查詢 Product Name 選項（前端過濾）
const queryProdNameOptions = (queryString, cb) => {
  const results = queryString
    ? allProdNameOptions.value.filter(item => {
        // 支持按 prodName、prodNr、custProdNr 搜索
        const searchText = queryString.toLowerCase()
        return (
          item.value.toLowerCase().includes(searchText) ||
          item.prodNr.toLowerCase().includes(searchText) ||
          item.custProdNr.toLowerCase().includes(searchText)
        )
      })
    : allProdNameOptions.value
  
  // 轉換為 el-autocomplete 需要的格式
  const options = results.map(item => ({
    value: item.value,
    label: item.prodNr 
      ? `${item.value} (${item.prodNr})` 
      : item.value
  }))
  
  cb(options)
}

// 處理 Product Name 選擇
const handleProdNameSelect = (item) => {
  searchForm.prodName = item.value
}

// 查詢 A&J Order No 選項（前端過濾）
const querySoNrOptions = (queryString, cb) => {
  const results = queryString
    ? allSoNrOptions.value.filter(item => {
        // 支持按 soNr、prodNr、prodName 搜索
        const searchText = queryString.toLowerCase()
        return (
          (item.value && item.value.toLowerCase().includes(searchText)) ||
          (item.prodNr && item.prodNr.toLowerCase().includes(searchText)) ||
          (item.prodName && item.prodName.toLowerCase().includes(searchText))
        )
      })
    : allSoNrOptions.value
  
  // 轉換為 el-autocomplete 需要的格式
  const options = results.map(item => ({
    value: item.value,
    label: item.prodName 
      ? `${item.value} - ${item.prodName}` 
      : item.value
  }))
  
  cb(options)
}

// 處理 A&J Order No 選擇
const handleSoNrSelect = (item) => {
  searchForm.soNr = item.value
}

const handleQuery = async () => {
  loading.value = true
  try {
    // 構建查詢參數
    const filters = {}
    if (searchForm.prodNr) filters.prodNr = searchForm.prodNr
    if (searchForm.prodName) filters.prodName = searchForm.prodName
    if (searchForm.matnr) filters.matnr = searchForm.matnr
    if (searchForm.custProdNr) filters.custProdNr = searchForm.custProdNr
    if (searchForm.soNr) filters.soNr = searchForm.soNr
    
    const response = await queryBOM(filters)
    if (response.success) {
      flatTableData.value = response.data || []
      groupedTableData.value = convertToGroupedData(flatTableData.value)
      ElMessage.success('查詢成功')
    } else {
      ElMessage.error(response.message || '查詢失敗')
    }
  } catch (error) {
    console.error('Query error:', error)
    ElMessage.error(error.message || '查詢失敗')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.prodNr = ''
  searchForm.prodName = ''
  searchForm.matnr = ''
  searchForm.custProdNr = ''
  searchForm.soNr = ''
  searchForm.referenctNo = ''
}

const handleCellEditClick = (rowKey, field, row) => {
  editingRow.value = rowKey
  editingField.value = field
  nextTick(() => {
    const input = document.querySelector('.cell-input input')
    if (input) {
      input.focus()
      input.select()
    }
  })
}

const handleCellBlur = (rowKey, field, row) => {
  editingRow.value = null
  editingField.value = null
  // 僅同步到扁平資料，不在此呼叫 API，由 Save 統一批次送出
  const flatItem = flatTableData.value.find(
    (item) => item.prodNr === row.prodNr && item.matnr === row.matnr && item.id === row.id
  )
  if (flatItem) {
    if (field === 'originLocal') {
      flatItem.originLocal = row.originLocal
    } else {
      flatItem[field] = row[field]
    }
  }
}

const handleCancelExpand = (row) => {
  tableRef.value?.toggleRowExpansion(row, false)
}

const handleSaveForParent = async (parentRow) => {
  const updates = []
  ;(parentRow.children || []).forEach((child) => {
    if (child.id && child.soNr && child.soItNr) {
      updates.push({
        id: child.id,
        soNr: child.soNr,
        soItNr: child.soItNr,
        matnr: child.matnr || '',
        custMatnr: child.custMatnr || ''
      })
    }
  })
  if (updates.length === 0) {
    ElMessage.warning('沒有需要儲存的資料')
    return
  }
  try {
    loading.value = true
    await Promise.all(updates.map((u) => updateBOM(u.id, { soNr: u.soNr, soItNr: u.soItNr, matnr: u.matnr, custMatnr: u.custMatnr })))
    ElMessage.success(`成功儲存 ${updates.length} 筆`)
  } catch (error) {
    console.error('Save error:', error)
    ElMessage.error(error.message || '儲存失敗')
  } finally {
    loading.value = false
  }
}

const handleExportBOMForParent = (parentRow) => {
  const children = parentRow.children || []
  if (children.length === 0) {
    ElMessage.warning('無資料可匯出')
    return
  }
  const headers = ['Internal Part No', 'Component', 'Spec', 'Qty', 'Customer Part No', 'Origin']
  const data = children.map((item) => [
    item.matnr || '',
    item.vendorName || '',
    item.matnrSpec || '',
    item.usageQnty ?? '',
    item.custMatnr || '',
    item.originLocal || ''
  ])
  const worksheetData = [headers, ...data]
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  const sheetName = (parentRow.prodNr || 'BOM').length > 31 ? (parentRow.prodNr || 'BOM').substring(0, 31) : (parentRow.prodNr || 'BOM')
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `BOM_${parentRow.prodNr || 'Export'}_${new Date().toISOString().slice(0, 10)}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
  ElMessage.success('匯出完成')
}

const handleImportBOMForParent = (parentRow) => {
  importTargetParent.value = parentRow
  fileInputRef.value?.click()
}

const handleSubmit = async () => {
  // 收集所有 Customer Item No 資料（只收集子項目）
  const updates = []
  groupedTableData.value.forEach((parent) => {
    parent.children.forEach((child) => {
      if (child.id) {
        // 確保包含必要的欄位
        if (!child.soNr || !child.soItNr) {
          console.warn(`跳過更新：缺少必要欄位 soNr 或 soItNr (id: ${child.id})`)
          return
        }
        updates.push({
          id: child.id,
          soNr: child.soNr,
          soItNr: child.soItNr,
          custMatnr: child.custMatnr || ''
        })
      }
    })
  })

  if (updates.length === 0) {
    ElMessage.warning('沒有需要更新的資料')
    return
  }

  try {
    loading.value = true
    // 批量更新
    await Promise.all(updates.map(update => 
      updateBOM(update.id, {
        soNr: update.soNr,
        soItNr: update.soItNr,
        custMatnr: update.custMatnr
      })
    ))
    ElMessage.success(`成功更新 ${updates.length} 筆資料`)
  } catch (error) {
    console.error('Batch update error:', error)
    ElMessage.error('批量更新失敗')
  } finally {
    loading.value = false
  }
}

// Excel 匯出處理
const handleExcelExport = () => {
  if (groupedTableData.value.length === 0) {
    ElMessage.warning(t('bom.noDataToExport'))
    return
  }

  try {
    loading.value = true
    
    // 創建新的工作簿
    const workbook = XLSX.utils.book_new()

    // 為每個 Final Product 創建一個工作表
    groupedTableData.value.forEach((parentRow) => {
      // 準備工作表資料
      const worksheetData = []
      
      // 第一行：Final Product 資訊標題
      worksheetData.push(['Final Product Information', '', '', '', '', '', '', ''])
      
      // 第二行：Final Product No
      worksheetData.push(['Final Product No:', parentRow.prodNr || '', '', '', '', '', '', ''])
      
      // 第三行：Final Cust Product No
      worksheetData.push(['Final Cust Product No:', parentRow.custProdNr || '', '', '', '', '', '', ''])
      
      // 第四行：Final Product Name
      worksheetData.push(['Final Product Name:', parentRow.prodName || '', '', '', '', '', '', ''])
      
      // 第五行：Final Product Spec
      worksheetData.push(['Final Product Spec:', parentRow.prodSpec || '', '', '', '', '', '', ''])
      
      // 第六行：空行
      worksheetData.push(['', '', '', '', '', '', '', ''])
      
      // 第七行：Item 表頭
      const headers = [
        'Item No',
        'Customer Item No',
        'Item Spec',
        'Usage Qty',
        'Unit',
        'Vendor',
        'Vendor Code'
      ]
      worksheetData.push(headers)

      // 準備資料（轉換 children 為二維數組）
      const data = parentRow.children.map((item) => [
        item.matnr || '',
        item.custMatnr || '',
        item.matnrSpec || '',
        item.usageQnty || '',
        item.unit || '',
        item.vendorName || '',
        item.vendor || ''
      ])

      // 將資料添加到工作表資料
      worksheetData.push(...data)

      // 創建工作表
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

      // 設置欄位寬度
      const colWidths = [
        { wch: 20 }, // Item No
        { wch: 18 }, // Customer Item No
        { wch: 30 }, // Item Spec
        { wch: 12 }, // Usage Qty
        { wch: 10 }, // Unit
        { wch: 20 }, // Vendor
        { wch: 15 }  // Vendor Code
      ]
      worksheet['!cols'] = colWidths

      // 設置 Final Product 資訊標題的合併單元格範圍（如果需要可以通過 xlsx-style 實現）
      // 注意：標準 XLSX.js 不支援樣式，如果需要樣式需要使用 xlsx-style 套件

      // 工作表名稱（使用 Final Product No，限制長度）
      const sheetName = parentRow.prodNr || `Sheet${groupedTableData.value.indexOf(parentRow) + 1}`
      // Excel 工作表名稱限制為 31 個字符
      const finalSheetName = sheetName.length > 31 ? sheetName.substring(0, 31) : sheetName

      // 將工作表添加到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, finalSheetName)
    })

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    })

    // 創建 Blob 並下載
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 生成檔名（使用當前日期時間）
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '')
    link.download = `BOM_Export_${dateStr}_${timeStr}.xlsx`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success(t('bom.exportSuccess', { count: groupedTableData.value.length }))
  } catch (error) {
    console.error('Excel export error:', error)
    ElMessage.error(t('bom.exportFailed'))
  } finally {
    loading.value = false
  }
}

// BOM Demo 範本下載（與子表匯入格式一致）
const handleDownloadDemo = () => {
  try {
    const demoData = [
      ['Internal Part No', 'Customer Part No', 'Origin'],
      ['5AC00A000013', 'DEMO001', 'Taiwan'],
      ['SOT00A000002', 'DEMO002', 'Korean'],
      ['INC00A000001', 'DEMO003', '']
    ]
    const worksheet = XLSX.utils.aoa_to_sheet(demoData)
    worksheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 12 }]

    // 創建工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Template')

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    })

    // 創建 Blob 並下載
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'BOM_Import_Template.xlsx'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success(t('bom.templateDownloadSuccess'))
  } catch (error) {
    console.error('Download demo error:', error)
    ElMessage.error(t('bom.templateDownloadFailed'))
  }
}

// Excel 匯入處理
const handleExcelImport = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    loading.value = true
    
    // 讀取 Excel 文件
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(firstSheet)

    if (jsonData.length === 0) {
      ElMessage.warning(t('bom.fileEmpty'))
      return
    }

    // 解析 Excel 資料
    // 預期格式：Item No (matnr)、Customer Item No (custMatnr)
    // 只比對 Item No，自動更新 Customer Item No
    const importMap = new Map()
    
    const originMap = new Map()
    jsonData.forEach((row) => {
      const itemNo = row['Item No'] || row['itemNo'] || row['Internal Part No'] || row['ItemNo'] || row['matnr'] || ''
      const customerItemNo = row['Customer Item No'] || row['Customer Part No'] || row['customerItemNo'] || row['custMatnr'] || ''
      const origin = row['Origin'] || row['originLocal'] || ''
      if (itemNo && itemNo.toString().trim() !== '') {
        const itemNoKey = itemNo.toString().trim()
        importMap.set(itemNoKey, customerItemNo ? customerItemNo.toString().trim() : '')
        if (origin != null && origin !== '') originMap.set(itemNoKey, origin.toString().trim())
      }
    })

    // 更新表格資料（只比對 Item No / matnr）；若為子表匯入則僅更新該 parent 的 children
    let updateCount = 0
    let notFoundItems = []
    const targetParent = importTargetParent.value
    const parentsToUpdate = targetParent ? [targetParent] : groupedTableData.value

    parentsToUpdate.forEach((parent) => {
      ;(parent.children || []).forEach((child) => {
        const itemNo = child.matnr ? child.matnr.toString().trim() : ''
        if (itemNo && importMap.has(itemNo)) {
          const newCustomerItemNo = importMap.get(itemNo)
          const newOrigin = originMap.get(itemNo)
          child.custMatnr = newCustomerItemNo
          if (newOrigin !== undefined) child.originLocal = newOrigin
          const flatItem = flatTableData.value.find(
            (item) => item.prodNr === child.prodNr && item.matnr === child.matnr && item.id === child.id
          )
          if (flatItem) {
            flatItem.custMatnr = newCustomerItemNo
            if (newOrigin !== undefined) flatItem.originLocal = newOrigin
          }
          updateCount++
        }
      })
    })
    importTargetParent.value = null

    // 檢查是否有 Excel 中但表格中找不到的 Item No
    importMap.forEach((customerItemNo, itemNo) => {
      const found = flatTableData.value.some(item => item.matnr?.toString().trim() === itemNo)
      if (!found) {
        notFoundItems.push(itemNo)
      }
    })

    // 顯示結果訊息
    let message = t('bom.importSuccess', { count: updateCount })
    if (notFoundItems.length > 0) {
      message += t('bom.importNotFoundSuffix', {
        n: notFoundItems.length,
        list: notFoundItems.slice(0, 5).join(', ') + (notFoundItems.length > 5 ? '...' : '')
      })
    }
    ElMessage.success(message)
    
    // 清空文件選擇
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } catch (error) {
    console.error('Excel import error:', error)
    ElMessage.error(t('bom.importFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 載入查詢欄位的選項（下拉建議用）；表格預設為空，需按下查詢才顯示資料
  await loadAllOptions()
})
</script>

<style scoped>
/* 可編輯單元格懸停效果 */
:deep(.el-table__body tr td div[style*="cursor: pointer"]:hover) {
  background-color: #f5f7fa;
}

.cell-with-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  min-height: 24px;
}
.edit-icon {
  cursor: pointer;
  color: #909399;
  font-size: 14px;
}
.edit-icon:hover {
  color: #409eff;
}
</style>

