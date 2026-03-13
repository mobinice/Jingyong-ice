<template>
  <div>
    <!-- 頁面標題 + SAP 模板（右上角） -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600">{{ t('partNumber.title') }}</h1>
      <div style="display: flex; align-items: center; gap: 8px">
        <span style="font-size: 14px; color: #606266; white-space: nowrap">{{ t('partNumber.sapTemplate') }}</span>
        <el-select v-model="form.sapTemplate" :placeholder="t('partNumber.sapTemplatePlaceholder')" style="width: 220px">
          <el-option v-for="item in SAP_TEMPLATE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
    </div>

    <!-- 建立細節區塊 -->
    <el-card shadow="never" style="margin-bottom: 20px">
      <el-form :model="form" label-width="180px">

        <!-- Row 1: 建立方式 / 既有BOM或直接輸入（切換）/ 屬性群組 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="t('partNumber.creationMethod')">
              <el-select v-model="form.creationMethod" style="width: 100%">
                <el-option v-for="item in creationMethodOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- copy 模式：既有 BOM -->
            <el-form-item v-if="form.creationMethod === 'copy'" :label="t('partNumber.existingBOM')">
              <el-select
                v-model="form.existingBOM"
                filterable
                remote
                :remote-method="loadBOMList"
                :loading="bomListLoading"
                :placeholder="t('partNumber.placeholderSelectBOM')"
                style="width: 100%"
              >
                <el-option v-for="item in existingBOMOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-alert
                v-if="bomLoadError"
                type="error"
                :title="t('partNumber.bomLoadError')"
                :closable="false"
                show-icon
                style="margin-top: 4px"
              />
            </el-form-item>
            <!-- direct 模式：直接輸入品號 -->
            <el-form-item v-else-if="form.creationMethod === 'direct'" :label="t('partNumber.directPartNoLabel')">
              <el-input
                v-model="form.directPartNo"
                :placeholder="t('partNumber.directPartNoPH')"
                style="width: 100%"
              />
              <el-alert
                v-if="parseResult !== null"
                :type="parseResult.ok ? 'success' : 'error'"
                :title="parseResult.ok ? t('partNumber.parsedTitle') : t('partNumber.parseFailTitle')"
                :description="parseResult.ok ? `${t('partNumber.parsedMsg')}: ${form.directPartNo}` : t('partNumber.parseFailMsg')"
                show-icon
                :closable="false"
                style="margin-top: 4px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="t('partNumber.attributeGroup')">
              <el-select
                v-model="form.attributeGroup"
                :placeholder="t('partNumber.placeholderSelect')"
                :disabled="attrGroupsLoading || form.creationMethod === 'direct'"
                style="width: 100%"
              >
                <el-option v-for="item in attributeGroupOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 2: 料件名稱 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="t('partNumber.partName')">
              <el-input v-model="form.partName" :placeholder="t('partNumber.partNamePlaceholder')" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 3: 規格說明（span 16）/ 新料號預覽（span 8） -->
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item :label="t('partNumber.specDescription')">
              <el-input v-model="form.specDescription" type="textarea" :rows="3" :maxlength="2000" show-word-limit :placeholder="t('partNumber.specPlaceholder')" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="t('partNumber.previewPartNo')">
              <el-input v-model="form.previewPartNo" :placeholder="t('partNumber.previewPlaceholder')" readonly style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 額外特性（全寬，grid 下方） -->
        <template v-if="form.attributeGroup">
          <!-- GRP-A：廠商（全寬） -->
          <el-row v-if="form.attributeGroup === 'GRP-A'" :gutter="20">
            <el-col :span="24">
              <el-form-item :label="t('partNumber.fldVendor')">
                <el-input v-model="form.extra.vendor" :placeholder="t('partNumber.fldVendorPH')" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- GRP-B：車種 / 架高 / 烤漆色（各自獨立全寬列） -->
          <template v-if="form.attributeGroup === 'GRP-B'">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item :label="t('partNumber.fldVehicleType')">
                  <el-input v-model="form.extra.vehicleType" :placeholder="t('partNumber.fldVehicleTypePH')" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item :label="t('partNumber.fldHeight')">
                  <el-input v-model="form.extra.height" :placeholder="t('partNumber.fldHeightPH')" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item :label="t('partNumber.fldColor')">
                  <el-input v-model="form.extra.color" :placeholder="t('partNumber.fldColorPH')" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </template>

        <!-- 工廠別 -->
        <el-row v-if="form.attributeGroup" :gutter="20">
          <el-col :span="8">
            <el-form-item :label="t('partNumber.factoryLabel')">
              <el-select
                v-model="form.factories"
                multiple
                :placeholder="t('partNumber.factoryPlaceholder')"
                style="width: 100%"
              >
                <el-option v-for="item in FACTORY_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- SAP 失敗模擬 -->
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item :label="t('partNumber.sapFailTitle')">
              <el-switch v-model="form.simulateSAPFailure" />
              <span style="margin-left: 10px; color: #909399; font-size: 12px">{{ t('partNumber.sapFailHint') }}</span>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
    </el-card>

    <!-- 屬性表格區塊 -->
    <el-card shadow="never" style="margin-bottom: 20px">
      <template #header>
        <div style="display: flex; justify-content: flex-end; align-items: center">
          <div>
            <el-button plain @click="handleResetAttributes">{{ t('partNumber.reset') }}</el-button>
            <el-button type="primary" :loading="confirmLoading" @click="handleConfirm">{{ t('partNumber.confirm') }}</el-button>
          </div>
        </div>
      </template>

      <!-- 7-Phase 進度 -->
      <div v-if="phaseLog.length > 0" style="margin-bottom: 16px; padding: 12px; background: #f5f7fa; border-radius: 4px">
        <div
          v-for="p in phaseLog"
          :key="p.phase"
          style="display: flex; align-items: center; margin-bottom: 4px; font-size: 13px"
        >
          <el-tag
            :type="p.status === 'success' ? 'success' : p.status === 'error' ? 'danger' : 'info'"
            size="small"
            style="margin-right: 8px; min-width: 80px; text-align: center"
          >
            Phase {{ p.phase }} {{ p.status === 'success' ? '✓' : p.status === 'error' ? '✗' : '…' }}
          </el-tag>
          <span :style="{ color: p.status === 'error' ? '#f56c6c' : '#606266' }">{{ p.detail }}</span>
        </div>
      </div>

      <el-table :data="attributesData" border style="width: 100%">
        <el-table-column prop="seq" :label="t('partNumber.seq')" width="70" align="center" />
        <el-table-column prop="attributeCode" :label="t('partNumber.attributeCode')" width="130" />
        <el-table-column prop="meaning" :label="t('partNumber.meaning')" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.meaning }}</span>
            <span v-if="scope.row.status === 'system'" style="color: #909399; font-size: 12px">
              （{{ t('partNumber.serialLabel') }}）
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="length" :label="t('partNumber.length')" width="80" align="center" />
        <el-table-column :label="t('partNumber.valueEditable')" min-width="220">
          <template #default="scope">
            <el-select
              v-if="scope.row.valueType === 'select'"
              v-model="scope.row.value"
              :placeholder="t('partNumber.placeholderSelect')"
              :disabled="scope.row.status === 'system'"
              style="width: 100%"
            >
              <el-option
                v-for="option in scope.row.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
                :disabled="option.active === false"
              />
            </el-select>
            <el-input
              v-else
              v-model="scope.row.value"
              :placeholder="scope.row.status === 'system' ? t('partNumber.notGenerated') : scope.row.placeholder"
              :disabled="scope.row.status === 'system'"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('partNumber.status')" width="110" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getAttrGroups, getNextSerial, createPartNumber, getBOMList } from '../api/partNumber.js'

const { t } = useI18n()

// ─── Constants ───────────────────────────────────────────────────────────────

const FACTORY_OPTIONS = [
  { value: 'TA11', label: 'TA11 - 台灣廠' },
  { value: 'KA11', label: 'KA11 - 韓國廠' },
  { value: 'TV11', label: 'TV11 - 台越廠' },
  { value: 'VA11', label: 'VA11 - 越南廠' },
  { value: 'KV21', label: 'KV21 - 韓越廠' },
  { value: 'TV21', label: 'TV21 - 台越二廠' },
  { value: 'VV21', label: 'VV21 - 越越廠' },
]

const SAP_TEMPLATE_OPTIONS = [
  { value: 'ZMAT', label: 'ZMAT - 一般物料' },
  { value: 'ZTRD', label: 'ZTRD - 貿易物料' },
  { value: 'ZPKG', label: 'ZPKG - 包材' },
]

/** Hardcoded fallback used if backend call fails */
const GROUPS_FALLBACK = {
  'GRP-A': {
    label: 'GRP-A（1-2-2-1-5）',
    serialLen: 5,
    segments: [
      { seq: 1, code: 'IDENT', meaning: '識別碼',       length: 1, type: 'select', options: [] },
      { seq: 2, code: 'PART',  meaning: '品類碼',       length: 2, type: 'select', options: [] },
      { seq: 3, code: 'CUST',  meaning: '客戶碼',       length: 2, type: 'select', options: [] },
      { seq: 4, code: 'RSV',   meaning: '保留碼',       length: 1, type: 'input',  options: [] },
      { seq: 5, code: 'SERIAL',meaning: '流水碼（系統產生）', length: 5, type: 'system', options: [] },
    ]
  },
  'GRP-B': {
    label: 'GRP-B（2-2-1-1-4）',
    serialLen: 4,
    segments: [
      { seq: 1, code: 'BRAND', meaning: '品牌碼',       length: 2, type: 'select', options: [] },
      { seq: 2, code: 'STYLE', meaning: '型式碼',       length: 2, type: 'select', options: [] },
      { seq: 3, code: 'GRADE', meaning: '等級碼',       length: 1, type: 'select', options: [] },
      { seq: 4, code: 'RSV',   meaning: '保留碼',       length: 1, type: 'input',  options: [] },
      { seq: 5, code: 'SERIAL',meaning: '流水碼（系統產生）', length: 4, type: 'system', options: [] },
    ]
  }
}

// ─── State ───────────────────────────────────────────────────────────────────

const GROUPS = ref({})
const attrGroupsLoading = ref(false)
const confirmLoading = ref(false)

const attributeGroupOptions = ref([])
const attributesData = ref([])
const phaseLog = ref([])
const parseResult = ref(null)   // null | { ok: boolean }

const existingBOMOptions = ref([])
const bomListLoading = ref(false)
const bomLoadError = ref(false)

async function loadBOMList(keyword = '') {
  bomListLoading.value = true
  bomLoadError.value = false
  try {
    const res = await getBOMList(keyword)
    if (res.success && Array.isArray(res.data)) {
      existingBOMOptions.value = res.data
      if (res.data.length === 0 && !keyword) {
        ElMessage.warning(t('partNumber.bomEmptyHint'))
      }
    }
  } catch (e) {
    console.warn('Failed to load BOM list:', e)
    bomLoadError.value = true
    ElMessage.error(t('partNumber.bomLoadError'))
  } finally {
    bomListLoading.value = false
  }
}

const form = reactive({
  creationMethod: 'blank',
  sapTemplate: 'ZMAT',
  existingBOM: '',
  attributeGroup: '',
  partName: '',
  specDescription: '',
  previewPartNo: '',
  simulateSAPFailure: false,
  factories: [],
  extra: {},
  directPartNo: '',
})

const creationMethodOptions = computed(() => [
  { value: 'blank',  label: t('partNumber.optBlank')  },
  { value: 'copy',   label: t('partNumber.optCopy')   },
  { value: 'direct', label: t('partNumber.optDirect') },
])

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  loadAttrGroups()
})

// ─── Watchers ─────────────────────────────────────────────────────────────────

watch(() => form.creationMethod, (newMethod) => {
  form.existingBOM = ''
  form.directPartNo = ''
  form.attributeGroup = ''
  form.previewPartNo = ''
  form.extra = {}
  form.factories = []
  attributesData.value = []
  phaseLog.value = []
  parseResult.value = null
  if (newMethod === 'copy') {
    loadBOMList('')
  }
})

watch(() => form.attributeGroup, (newGroup) => {
  form.previewPartNo = ''
  phaseLog.value = []
  parseResult.value = null

  if (!newGroup) {
    attributesData.value = []
    form.extra = {}
    return
  }

  rebuildAttributeTable(newGroup)
  resetExtraFields(newGroup)
})

watch(() => form.directPartNo, (val) => {
  if (form.creationMethod !== 'direct') return
  if (!val) { parseResult.value = null; return }

  const result = parsePartNo(val)
  if (result) {
    parseResult.value = { ok: true }
    form.attributeGroup = result.group
    // Defer value sync until the watcher rebuilds the table
    setTimeout(() => {
      attributesData.value.forEach(row => {
        if (row.status !== 'system' && result.values[row.attributeCode] !== undefined) {
          row.value = result.values[row.attributeCode]
        }
      })
    }, 50)
  } else if (val.length >= 8) {
    parseResult.value = { ok: false }
  } else {
    parseResult.value = null
  }
})

// ─── Backend load ─────────────────────────────────────────────────────────────

async function loadAttrGroups() {
  attrGroupsLoading.value = true
  try {
    const res = await getAttrGroups()
    if (res.success && res.data && Object.keys(res.data).length > 0) {
      GROUPS.value = res.data
    } else {
      GROUPS.value = GROUPS_FALLBACK
    }
  } catch (e) {
    console.warn('Failed to load attr groups from backend, using fallback', e)
    GROUPS.value = GROUPS_FALLBACK
  } finally {
    attributeGroupOptions.value = Object.keys(GROUPS.value).map(key => ({
      value: key,
      label: GROUPS.value[key].label,
    }))
    attrGroupsLoading.value = false
  }
}

// ─── Table helpers ────────────────────────────────────────────────────────────

function rebuildAttributeTable(group) {
  const grpDef = GROUPS.value[group]
  if (!grpDef) { attributesData.value = []; return }

  attributesData.value = grpDef.segments.map(seg => ({
    seq: seg.seq,
    attributeCode: seg.code,
    meaning: seg.meaning,
    length: seg.length,
    valueType: seg.type === 'select' ? 'select' : 'input',
    options: seg.options || [],
    placeholder: '',
    status: seg.type === 'system' ? 'system' : seg.type === 'input' ? 'editable' : 'enabled',
    value: seg.type === 'system' ? '' : (seg.code === 'RSV' ? '0' : ''),
  }))
}

function resetExtraFields(group) {
  if (group === 'GRP-A') {
    form.extra = { vendor: '' }
  } else if (group === 'GRP-B') {
    form.extra = { vehicleType: '', height: '', color: '' }
  } else {
    form.extra = {}
  }
}

// ─── Part number logic ────────────────────────────────────────────────────────

function buildPreview(group, values, serial) {
  const grpDef = GROUPS.value[group]
  if (!grpDef) return ''
  return grpDef.segments.map(seg => {
    if (seg.type === 'system') return serial || ''
    return String(values[seg.code] || '')
  }).join('')
}

function parsePartNo(str) {
  for (const [key, grpDef] of Object.entries(GROUPS.value)) {
    const totalLen = grpDef.segments.reduce((s, seg) => s + seg.length, 0)
    if (str.length !== totalLen) continue
    const values = {}
    let pos = 0
    let valid = true
    for (const seg of grpDef.segments) {
      const chunk = str.slice(pos, pos + seg.length)
      if (chunk.length !== seg.length) { valid = false; break }
      values[seg.code] = chunk
      pos += seg.length
    }
    if (valid) return { group: key, values }
  }
  return null
}

function validateModel(group, values) {
  const grpDef = GROUPS.value[group]
  if (!grpDef) return [t('partNumber.errMissingAttr')]
  const errors = []
  for (const seg of grpDef.segments) {
    if (seg.type === 'system') continue
    const val = String(values[seg.code] ?? '')
    if (!val) {
      errors.push(`${seg.code}: ${t('partNumber.errMissingAttr')}`)
      continue
    }
    if (val.length !== seg.length) {
      errors.push(`${seg.code}: ${t('partNumber.errWrongLen')} (${t('partNumber.length')}: ${seg.length})`)
    }
    if (seg.type === 'select' && seg.options && seg.options.length > 0) {
      const found = seg.options.find(o => o.value === val)
      if (found && found.active === false) {
        errors.push(`${seg.code}: ${t('partNumber.errDisabledOpt')}`)
      }
    }
  }
  return errors
}

function validateExtra(group) {
  const errors = []
  if (group === 'GRP-A' && !form.extra.vendor) {
    errors.push(t('partNumber.fldVendor'))
  } else if (group === 'GRP-B' && !form.extra.vehicleType) {
    errors.push(t('partNumber.fldVehicleType'))
  }
  return errors
}

// ─── Phase log ────────────────────────────────────────────────────────────────

function setPhase(phase, status, detail = '') {
  const idx = phaseLog.value.findIndex(p => p.phase === phase)
  if (idx >= 0) {
    phaseLog.value[idx] = { phase, status, detail }
  } else {
    phaseLog.value.push({ phase, status, detail })
  }
}

// ─── 7-Phase Confirm ─────────────────────────────────────────────────────────

async function handleConfirm() {
  if (confirmLoading.value) return
  const group = form.attributeGroup
  if (!group) {
    ElMessage.warning(t('partNumber.errMissingAttr'))
    return
  }

  confirmLoading.value = true
  phaseLog.value = []

  // Collect current values from the table
  const values = {}
  attributesData.value.forEach(row => {
    if (row.status !== 'system') values[row.attributeCode] = row.value
  })

  try {
    // ── Phase 0: 工廠驗證 ──
    setPhase('0', 'running', t('partNumber.phaseFactory'))
    if (!form.factories || form.factories.length === 0) {
      setPhase('0', 'error', t('partNumber.errFactory'))
      ElMessage.error(t('partNumber.errFactory'))
      return
    }
    setPhase('0', 'success', t('partNumber.phaseFactory'))

    // ── Phase 1: 額外特性驗證 ──
    setPhase('1', 'running', t('partNumber.phaseExtra'))
    const extraErrors = validateExtra(group)
    if (extraErrors.length > 0) {
      setPhase('1', 'error', extraErrors.join('; '))
      ElMessage.error(t('partNumber.extraRequired'))
      return
    }
    setPhase('1', 'success', t('partNumber.phaseExtra'))

    // ── Phase 2: 屬性驗證 ──
    setPhase('2', 'running', t('partNumber.phaseValidate'))
    const validationErrors = validateModel(group, values)
    if (validationErrors.length > 0) {
      const summary = validationErrors[0] +
        (validationErrors.length > 1 ? ` (+${validationErrors.length - 1} ${t('partNumber.moreErrors')})` : '')
      setPhase('2', 'error', summary)
      ElMessage.error(`${t('partNumber.validateFailTitle')}: ${summary}`)
      return
    }
    setPhase('2', 'success', t('partNumber.phaseValidate'))

    // ── Phase 3: 取流水號 ──
    setPhase('3', 'running', t('partNumber.phaseSerial'))
    let serial
    try {
      const serialRes = await getNextSerial(group)
      if (!serialRes.success) throw new Error(serialRes.message)
      serial = serialRes.data.serial
      const serialRow = attributesData.value.find(r => r.status === 'system')
      if (serialRow) serialRow.value = serial
      setPhase('3', 'success', `serial = ${serial}`)
    } catch (e) {
      setPhase('3', 'error', e.message)
      ElMessage.error(`${t('partNumber.preSapFailTitle')}: ${e.message}`)
      return
    }

    // ── Phase 4: 組合料號 ──
    setPhase('4', 'running', t('partNumber.phaseBuild'))
    values['SERIAL'] = serial
    const preview = buildPreview(group, values, serial)
    form.previewPartNo = preview
    setPhase('4', 'success', preview)

    // ── Phase 5: 最終驗證 ──
    setPhase('5', 'running', t('partNumber.phaseFinalCheck'))
    const finalErrors = validateModel(group, values)
    if (finalErrors.length > 0) {
      setPhase('5', 'error', finalErrors[0])
      ElMessage.error(t('partNumber.validateFailTitle'))
      return
    }
    setPhase('5', 'success', t('partNumber.phaseFinalCheck'))

    // ── Phase 6: SAP 寫入 ──
    setPhase('6', 'running', t('partNumber.phaseSap'))
    if (form.simulateSAPFailure) {
      setPhase('6', 'error', t('partNumber.sapWriteFailMsg'))
      ElMessage.error(`${t('partNumber.sapWriteFailTitle')} — ${t('partNumber.sapWriteFailHint')}`)
      return
    }
    try {
      await createPartNumber({
        partNo: preview,
        attrGroup: group,
        values: { ...values },
        factories: [...form.factories],
        extra: { ...form.extra },
        partSpec: form.specDescription,
        createdBy: 'system',
      })
      setPhase('6', 'success', t('partNumber.phaseSap'))
      ElMessage.success(`${t('partNumber.successTitle')}: ${preview}`)
    } catch (e) {
      setPhase('6', 'error', e.message)
      ElMessage.error(`${t('partNumber.sapWriteFailTitle')}: ${e.message}`)
    }
  } finally {
    confirmLoading.value = false
  }
}

// ─── Reset ────────────────────────────────────────────────────────────────────

function handleResetAttributes() {
  attributesData.value.forEach(row => {
    if (row.status !== 'system') {
      row.value = row.attributeCode === 'RSV' ? '0' : ''
    } else {
      row.value = ''
    }
  })
  form.previewPartNo = ''
  resetExtraFields(form.attributeGroup)
  phaseLog.value = []
  ElMessage.info(t('partNumber.resetMsg'))
}

// ─── Display helpers ──────────────────────────────────────────────────────────

const getStatusType = (status) => {
  return { enabled: 'primary', editable: 'success', system: 'info' }[status] || 'info'
}

const getStatusText = (status) => {
  const key = { enabled: 'partNumber.statusEnabled', editable: 'partNumber.statusEditable', system: 'partNumber.statusSystem' }[status]
  return key ? t(key) : status
}
</script>

<style scoped>
</style>
