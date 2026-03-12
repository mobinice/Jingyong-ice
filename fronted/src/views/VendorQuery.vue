<template>
  <div class="vendor-query-page">
    <div class="page-header">
      <h2>供應商採單查詢平台</h2>
      <div class="action-buttons">
        <el-button :icon="Select" @click="handleSelectAll">全選</el-button>
        <el-button :icon="Close" @click="handleDeselectAll">取消全選</el-button>
        <el-button :icon="Printer" @click="handlePrintBarcode">直接列印包裝條碼</el-button>
        <el-button :icon="Download" @click="handleExcelDownload">包裝檔下載</el-button>
        <el-button :icon="Upload" @click="handleExcelUpload">列印上傳的包裝箱</el-button>
        <el-button :icon="DocumentCopy" @click="handleDownloadDemo">下載Demo</el-button>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept=".xlsx,.xls"
      style="display: none"
      @change="handleFileChange"
    />

    <div class="search-section">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="BSART">
          <el-input v-model="searchForm.BSART" placeholder="選填" clearable style="width: 100px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="EBELN">
          <el-input v-model="searchForm.EBELN" placeholder="採購單號" clearable style="width: 130px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="EINDT_from">
          <el-date-picker
            v-model="searchForm.EINDT_from"
            type="date"
            placeholder="YYYYMMDD"
            format="YYYYMMDD"
            value-format="YYYYMMDD"
            style="width: 130px"
          />
        </el-form-item>
        <el-form-item label="~">
          <el-date-picker
            v-model="searchForm.EINDT_to"
            type="date"
            placeholder="YYYYMMDD"
            format="YYYYMMDD"
            value-format="YYYYMMDD"
            style="width: 130px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="upload-section">
      <div class="upload-label">Packaging File Upload</div>
      <div class="upload-area" @click="handleExcelUpload">
        <div class="excel-logo">
          <el-icon class="excel-icon"><Upload /></el-icon>
          <span class="excel-text">EXCEL</span>
        </div>
      </div>
    </div>

    <div class="table-section">
      <el-table
        ref="tableRef"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        :max-height="600"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          v-for="col in PURCMENT_FIELDS"
          :key="col"
          :prop="col"
          :label="col"
          min-width="100"
          align="left"
        >
          <template v-if="isEditable(col)" #default="scope">
            <div
              v-if="editingRow !== scope.$index || editingField !== col"
              @dblclick="handleCellDoubleClick(scope.$index, col, scope.row)"
              class="editable-cell"
            >
              {{ formatCell(scope.row[col]) }}
            </div>
            <el-input
              v-else
              :model-value="scope.row[col]"
              @update:model-value="(v) => (scope.row[col] = v)"
              @blur="handleCellBlur(scope.$index, col, scope.row)"
              @keyup.enter="handleCellBlur(scope.$index, col, scope.row)"
              class="cell-input"
              size="small"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Select, Close, Printer, Download, Upload, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { queryPurcment, updatePurcment } from '@/api/purcment'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'

const PURCMENT_FIELDS = [
  'BSART',
  'EBELN',
  'EBELP',
  'EBELN_COMP',
  'MATNR',
  'TXZ01',
  'PO_F03',
  'EINDT',
  'HANDOVERDATE',
  'MENGE',
  'MEINS',
  'DELIVERED',
  'UNDELIVERED',
  'LIFNR',
  'SORTL',
  'WERKS',
  'WERKS_REF',
  'BEDNR',
  'FRGKE',
  'CreateDate',
  'CreateTime',
  'Creator',
  'ModifyDate',
  'ModifyTime',
  'Modifier'
]

const EDITABLE_FIELDS = [
  'EBELN_COMP',
  'MATNR',
  'TXZ01',
  'PO_F03',
  'EINDT',
  'HANDOVERDATE',
  'MENGE',
  'MEINS',
  'DELIVERED',
  'UNDELIVERED',
  'LIFNR',
  'SORTL',
  'WERKS',
  'WERKS_REF',
  'BEDNR',
  'FRGKE'
]

const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const tableRef = ref(null)
const fileInputRef = ref(null)
const editingRow = ref(null)
const editingField = ref(null)

const searchForm = reactive({
  BSART: '',
  EBELN: '',
  EINDT_from: '',
  EINDT_to: ''
})

function isEditable(field) {
  return EDITABLE_FIELDS.includes(field)
}

function formatCell(val) {
  if (val == null || val === '') return ''
  if (typeof val === 'number') return val
  return String(val)
}

const handleSearch = async () => {
  try {
    loading.value = true
    const filters = {}
    if (searchForm.BSART != null && String(searchForm.BSART).trim() !== '') filters.BSART = searchForm.BSART.trim()
    if (searchForm.EBELN != null && String(searchForm.EBELN).trim() !== '') filters.EBELN = searchForm.EBELN.trim()
    if (searchForm.EINDT_from != null && String(searchForm.EINDT_from).trim() !== '') filters.EINDT_from = searchForm.EINDT_from.trim()
    if (searchForm.EINDT_to != null && String(searchForm.EINDT_to).trim() !== '') filters.EINDT_to = searchForm.EINDT_to.trim()
    const res = await queryPurcment(filters)
    const list = Array.isArray(res?.data) ? res.data : []
    tableData.value = list
    await nextTick()
    if (tableRef.value) tableRef.value.doLayout?.()
  } catch (error) {
    console.error('數據加載錯誤:', error)
    ElMessage.error(error?.message || '數據加載失敗')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleSelectAll = () => {
  tableData.value.forEach((row) => {
    tableRef.value.toggleRowSelection(row, true)
  })
}

const handleDeselectAll = () => {
  tableRef.value.clearSelection()
}

const handlePrintBarcode = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('請先選擇要列印的資料')
    return
  }
  try {
    const qrCodePromises = selectedRows.value.map(async (row) => {
      const qrData = `${row.EBELN || ''}|${row.EBELP || ''}|${row.MATNR || ''}|${row.MENGE ?? ''}`
      try {
        return await QRCode.toDataURL(qrData, { width: 100, margin: 1 })
      } catch (err) {
        console.error('QR Code generation error:', err)
        return ''
      }
    })
    const qrCodeImages = await Promise.all(qrCodePromises)
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>包裝條碼列印</title>
        <style>
          @media print { body { margin: 0; padding: 0; } .print-label { page-break-after: always; } .print-label:last-child { page-break-after: auto; } }
          .print-label { width: 210mm; height: 297mm; border: 1px solid #000; padding: 20px; margin-bottom: 20px; font-family: Arial, sans-serif; }
          .label-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .label-left { font-size: 24px; font-weight: bold; }
          .label-right { text-align: right; }
          .label-right > div:first-child { font-size: 18px; margin-bottom: 10px; }
          .qr-code { width: 100px; height: 100px; }
          .qr-code img { width: 100%; height: 100%; }
          .label-content { display: flex; flex-direction: column; gap: 8px; }
          .label-row { display: flex; font-size: 16px; line-height: 1.8; }
          .label-key { font-weight: bold; min-width: 80px; }
          .label-value { flex: 1; }
        </style>
      </head>
      <body>
    `
    selectedRows.value.forEach((row, index) => {
      htmlContent += `
        <div class="print-label">
          <div class="label-header">
            <div class="label-left">側嘜</div>
            <div class="label-right">
              <div>箱次:${index + 1}/${selectedRows.value.length}</div>
              <div class="qr-code"><img src="${qrCodeImages[index]}" alt="QR Code" /></div>
            </div>
          </div>
          <div class="label-content">
            <div class="label-row"><span class="label-key">BSART:</span><span class="label-value">${row.BSART || ''}</span></div>
            <div class="label-row"><span class="label-key">EBELN:</span><span class="label-value">${row.EBELN || ''}</span></div>
            <div class="label-row"><span class="label-key">EBELP:</span><span class="label-value">${row.EBELP || ''}</span></div>
            <div class="label-row"><span class="label-key">MATNR:</span><span class="label-value">${row.MATNR || ''}</span></div>
            <div class="label-row"><span class="label-key">TXZ01:</span><span class="label-value">${row.TXZ01 || ''}</span></div>
            <div class="label-row"><span class="label-key">MENGE:</span><span class="label-value">${row.MENGE ?? ''}</span></div>
            <div class="label-row"><span class="label-key">DELIVERED/UNDELIVERED:</span><span class="label-value">${row.DELIVERED ?? ''}/${row.UNDELIVERED ?? ''}</span></div>
            <div class="label-row"><span class="label-key">EINDT:</span><span class="label-value">${row.EINDT || ''}</span></div>
            <div class="label-row"><span class="label-key">LIFNR:</span><span class="label-value">${row.LIFNR || ''}</span></div>
          </div>
        </div>
      `
    })
    htmlContent += '</body></html>'
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      ElMessage.error('無法打開新視窗，請檢查瀏覽器的彈窗設定')
      return
    }
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.onload = () => setTimeout(() => printWindow.print(), 500)
  } catch (error) {
    console.error('Print error:', error)
    ElMessage.error('列印失敗')
  }
}

const handleExcelDownload = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('沒有資料可下載')
    return
  }
  try {
    loading.value = true
    const headers = [...PURCMENT_FIELDS]
    const data = tableData.value.map((row) => PURCMENT_FIELDS.map((f) => (row[f] != null ? row[f] : '')))
    const worksheetData = [headers, ...data]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    worksheet['!cols'] = PURCMENT_FIELDS.map(() => ({ wch: 14 }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purcment')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const now = new Date()
    link.download = `Purcment_${now.toISOString().split('T')[0].replace(/-/g, '')}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('Excel 下載完成')
  } catch (error) {
    console.error('Excel download error:', error)
    ElMessage.error('下載 Excel 檔案失敗')
  } finally {
    loading.value = false
  }
}

const handleExcelUpload = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    loading.value = true
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    if (jsonData.length < 2) {
      ElMessage.warning('Excel 檔案格式錯誤或資料為空')
      return
    }
    const headers = jsonData[0]
    const rows = jsonData.slice(1)
    const importedData = rows.map((row) => {
      const rowData = {}
      PURCMENT_FIELDS.forEach((field) => {
        const colIndex = headers.indexOf(field)
        if (colIndex >= 0) rowData[field] = row[colIndex] != null ? row[colIndex] : null
        else rowData[field] = null
      })
      return rowData
    })
    tableData.value = importedData
    ElMessage.success(`成功匯入 ${importedData.length} 筆資料（僅顯示，未寫入資料庫）`)
  } catch (error) {
    console.error('Excel import error:', error)
    ElMessage.error('匯入 Excel 檔案失敗，請檢查檔案格式')
  } finally {
    loading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const handleDownloadDemo = () => {
  try {
    const headers = [...PURCMENT_FIELDS]
    const demoRow = PURCMENT_FIELDS.map((f, i) => (i < 3 ? (f === 'EBELP' ? '000000001' : f === 'EBELN' ? '4500000001' : 'NB') : ''))
    const worksheetData = [headers, demoRow]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    worksheet['!cols'] = PURCMENT_FIELDS.map(() => ({ wch: 14 }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purcment範例')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Purcment範例.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('範例檔案下載成功')
  } catch (error) {
    console.error('Download demo error:', error)
    ElMessage.error('下載範例檔案失敗')
  }
}

const handleCellDoubleClick = (rowIndex, field, row) => {
  if (!isEditable(field)) return
  editingRow.value = rowIndex
  editingField.value = field
  nextTick(() => {
    const input = document.querySelector('.cell-input input, .cell-input .el-input__inner')
    if (input) {
      input.focus()
      input.select?.()
    }
  })
}

const handleCellBlur = async (rowIndex, field, row) => {
  editingRow.value = null
  editingField.value = null
  const bsart = row.BSART != null && String(row.BSART).trim() !== ''
  const ebeln = row.EBELN != null && String(row.EBELN).trim() !== ''
  const ebelp = row.EBELP != null && String(row.EBELP).trim() !== ''
  if (!bsart || !ebeln || !ebelp) return
  const payload = { [field]: row[field] }
  try {
    const res = await updatePurcment(row.BSART, row.EBELN, row.EBELP, payload)
    if (res?.data && Array.isArray(tableData.value) && tableData.value[rowIndex]) {
      Object.assign(tableData.value[rowIndex], res.data)
    }
    ElMessage.success('更新成功')
  } catch (error) {
    ElMessage.error(error?.message || '更新失敗')
  }
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.vendor-query-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-section {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

.upload-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 2px dashed #f56c6c;
  border-radius: 4px;
  background: #fff;
}

.upload-label {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
  font-size: 14px;
}

.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-area:hover {
  background-color: #f5f7fa;
}

.excel-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.excel-icon {
  font-size: 24px;
  color: #217346;
}

.excel-text {
  font-size: 18px;
  font-weight: bold;
  color: #217346;
  letter-spacing: 2px;
}

.table-section {
  background: #fff;
}

:deep(.el-table th) {
  background-color: #409eff;
  color: #fff;
}

:deep(.el-table th .cell) {
  text-align: center;
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
}

.editable-cell {
  cursor: pointer;
  min-height: 20px;
  padding: 4px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.editable-cell:hover {
  background-color: #f0f0f0;
}

.cell-input {
  width: 100%;
}

:deep(.cell-input .el-input__wrapper) {
  padding: 2px 8px;
}
</style>
