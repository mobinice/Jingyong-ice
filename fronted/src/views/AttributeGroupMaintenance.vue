<template>
  <div class="attribute-group-maintenance">
    <!-- 頁面標題與頂部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('attributeGroupMaintenance.title') }}</h1>
        <p class="page-subtitle">{{ t('attributeGroupMaintenance.subtitle') }}</p>
      </div>
      <div class="header-right">
        <el-select v-model="selectedLanguage" :placeholder="t('attributeGroupMaintenance.language')" style="width: 140px; margin-right: 12px" @change="onLanguageChange">
          <el-option label="中文" value="zh-TW" />
          <el-option label="English" value="en" />
        </el-select>
        <el-select v-model="selectedSapTemplate" :placeholder="t('attributeGroupMaintenance.sapTemplate')" style="width: 140px">
          <el-option :label="t('attributeGroupMaintenance.allTemplates')" value="all" />
        </el-select>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- Tab 1: 屬性組規則 -->
      <el-tab-pane :label="t('attributeGroupMaintenance.tabRules')" name="rules">
        <div class="toolbar-card">
          <el-input
            v-model="rulesSearchKeyword"
            :placeholder="t('attributeGroupMaintenance.searchPlaceholder')"
            clearable
            style="width: 280px"
          />
          <el-button class="btn-primary-custom" :loading="rulesLoading" @click="onRulesSearch">{{ t('attributeGroupMaintenance.search') }}</el-button>
          <el-button class="btn-primary-custom" @click="onAddAttributeGroup">+ {{ t('attributeGroupMaintenance.addAttributeGroup') }}</el-button>
          <el-button class="btn-outline-custom" @click="onRulesReset">{{ t('attributeGroupMaintenance.reset') }}</el-button>
        </div>
        <div class="content-card">
          <el-table v-loading="rulesLoading" :data="rulesList" border style="width: 100%">
            <el-table-column prop="code" :label="t('attributeGroupMaintenance.code')" />
            <el-table-column prop="definition" :label="t('attributeGroupMaintenance.definition')" />
            <el-table-column prop="style" :label="t('attributeGroupMaintenance.style')" />
            <el-table-column prop="serialNumber" :label="t('attributeGroupMaintenance.serialNumber')" align="center" />
            <el-table-column prop="sapModel" :label="t('attributeGroupMaintenance.sapModel')">
              <template #default="{ row }">
                <span class="badge badge-info">{{ row.sapModel }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="t('attributeGroupMaintenance.status')" align="center">
              <template #default="{ row }">
                <span v-if="row.active !== false" class="badge badge-success">{{ t('attributeGroupMaintenance.statusEnabled') }}</span>
                <span v-else class="badge badge-inactive">{{ t('attributeGroupMaintenance.statusDisabled') }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="t('attributeGroupMaintenance.operation')" align="center" width="160">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="onEditRule(row)">{{ t('attributeGroupMaintenance.edit') }}</el-button>
                <el-button type="danger" link size="small" @click="onDeleteRule(row)">{{ t('attributeGroupMaintenance.delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- Tab 2: 全域字典主檔 -->
      <el-tab-pane :label="t('attributeGroupMaintenance.tabDictionary')" name="dictionary">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="content-card">
              <div class="card-header">
                <span style="font-weight:700">{{ t('attributeGroupMaintenance.attributeCodeList') }}</span>
                <el-button class="btn-primary-custom" size="small" @click="onAddCode">+ {{ t('attributeGroupMaintenance.addCode') }}</el-button>
              </div>
              <el-table
                v-loading="dictionaryLoading"
                :data="dictionaryCodeList"
                border
                highlight-current-row
                style="width: 100%; margin-top: 12px"
                @current-change="onDictionaryRowSelect"
              >
                <el-table-column prop="code" :label="t('attributeGroupMaintenance.code')" />
                <el-table-column prop="definition" :label="t('attributeGroupMaintenance.definition')" />
                <el-table-column prop="refs" :label="t('attributeGroupMaintenance.refs')" align="center" width="70">
                  <template #default="{ row }">
                    <span class="badge badge-info">{{ row.refs }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="t('attributeGroupMaintenance.operation')" align="center" width="60">
                  <template #default="{ row }">
                    <el-button type="danger" link size="small" @click.stop="onDeleteCode(row)">✕</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="content-card">
              <div class="card-header" style="margin-bottom: 12px">
                <span style="font-weight:700">{{ t('attributeGroupMaintenance.attributeValueMaintenance') }}</span>
              </div>
              <div v-if="!selectedCode" class="empty-hint">
                {{ t('attributeGroupMaintenance.selectCodeToEdit') }}
              </div>
              <div v-else class="value-maintenance-content">
                <!-- 代碼定義編輯（中英文）-->
                <el-form size="small" style="margin-bottom: 4px">
                  <el-row :gutter="12">
                    <el-col :span="12">
                      <el-form-item :label="t('attributeGroupMaintenance.definitionZh')" label-width="90px">
                        <el-input v-model="editingDefinitionZh" style="width: 100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item :label="t('attributeGroupMaintenance.definitionEn')" label-width="90px">
                        <el-input v-model="editingDefinitionEn" style="width: 100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label-width="0">
                    <el-button class="btn-primary-custom" size="small" :loading="savingDefinition" @click="saveDefinition">
                      {{ t('attributeGroupMaintenance.save') }}
                    </el-button>
                  </el-form-item>
                </el-form>
                <hr class="dict-separator">
                <!-- 選項清單標題列 -->
                <div class="options-header">
                  <strong>{{ t('attributeGroupMaintenance.optionValue') }}</strong>
                  <el-button class="btn-outline-custom" size="small" @click="promptAddOption">+ {{ t('attributeGroupMaintenance.addOption') }}</el-button>
                </div>
                <!-- 選項值表格 -->
                <el-table :data="selectedCodeValues" border size="small" style="width: 100%; margin-top: 8px">
                  <el-table-column prop="value" :label="t('attributeGroupMaintenance.optionValue')" width="90" />
                  <el-table-column :label="t('attributeGroupMaintenance.optionStatus')" width="60" align="center">
                    <template #default="scope">
                      <el-checkbox
                        v-model="scope.row.active"
                        @change="onUpdateOption(scope.row)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column :label="t('attributeGroupMaintenance.optionDescription')" min-width="110">
                    <template #default="scope">
                      <el-input v-model="scope.row.label" size="small" @blur="onUpdateOption(scope.row)" />
                    </template>
                  </el-table-column>
                  <el-table-column :label="t('attributeGroupMaintenance.operation')" align="center" width="55">
                    <template #default="scope">
                      <el-button type="danger" link size="small" @click="onDeleteOption(scope.row)">✕</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <!-- 新增選項 -->
                <div class="add-option-row">
                  <el-input v-model="newOptionValue" size="small" :placeholder="t('attributeGroupMaintenance.optionValue')" style="width: 90px; margin-right: 8px" />
                  <el-input v-model="newOptionLabel" size="small" :placeholder="t('attributeGroupMaintenance.optionDescription')" style="width: 130px; margin-right: 8px" />
                  <el-button class="btn-primary-custom" size="small" :loading="addingOption" @click="onAddOption">+ {{ t('attributeGroupMaintenance.addOption') }}</el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <!-- ── Dialog: 新增/編輯屬性組 ── -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="ruleDialogMode === 'add' ? t('attributeGroupMaintenance.addGroupTitle') : t('attributeGroupMaintenance.editGroupTitle')"
      width="900px"
      :close-on-click-modal="false"
      class="rule-dialog"
    >
      <el-form :model="ruleForm" label-width="110px" size="small">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="t('attributeGroupMaintenance.code')">
              <el-input v-model="ruleForm.code" :disabled="ruleDialogMode === 'edit'" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('attributeGroupMaintenance.definition')">
              <el-input v-model="ruleForm.definition" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="t('attributeGroupMaintenance.serialLen')">
              <el-input-number v-model="ruleForm.serialLen" :min="1" :max="10" controls-position="right" style="width: 120px" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('attributeGroupMaintenance.activeStatus')">
              <el-select v-model="ruleForm.active" style="width: 180px">
                <el-option :value="true" :label="t('attributeGroupMaintenance.optActive')" />
                <el-option :value="false" :label="t('attributeGroupMaintenance.optInactive')" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 段落表格 -->
        <div class="segment-toolbar">
          <span style="font-weight: 600; font-size: 14px">{{ t('attributeGroupMaintenance.segmentSeq') }}</span>
          <el-button class="btn-outline-custom" size="small" style="margin-left: 12px" @click="addSegment">+ {{ t('attributeGroupMaintenance.addSegment') }}</el-button>
        </div>
        <el-table
          :data="ruleForm.segments"
          border
          size="small"
          style="width: 100%; margin-bottom: 16px"
          :row-class-name="segmentRowClassName"
        >
          <el-table-column :label="t('attributeGroupMaintenance.segmentSeq')" width="45" align="center">
            <template #default="scope">{{ scope.$index + 1 }}</template>
          </el-table-column>
          <el-table-column :label="t('attributeGroupMaintenance.segmentCode')" width="150">
            <template #default="scope">
              <el-select
                v-if="scope.row.type === 'select'"
                v-model="scope.row.segmentAttrCode"
                size="small"
                style="width: 100%"
                filterable
                allow-create
              >
                <el-option
                  v-for="d in dictCodes"
                  :key="d.code"
                  :label="`${d.code}（${d.definition}）`"
                  :value="d.code"
                />
              </el-select>
              <el-input
                v-else-if="scope.row.type === 'input'"
                v-model="scope.row.segmentAttrCode"
                size="small"
              />
              <span v-else style="color: var(--el-text-color-secondary); font-size: 12px; padding: 0 4px">—</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('attributeGroupMaintenance.segmentDefinitionContent')" min-width="120">
            <template #default="scope">
              <template v-if="scope.row.type === 'select'">
                <span v-if="getDictMeta(scope.row.segmentAttrCode)" style="font-weight:600; font-size:13px">
                  {{ getDictMeta(scope.row.segmentAttrCode) }}
                </span>
                <span v-else style="color:#ef4444; font-size:12px">—</span>
              </template>
              <span v-else-if="scope.row.type === 'system'" style="color:#f59e0b; font-size:12px">
                ⚙️ {{ t('attributeGroupMaintenance.hintSystem') }}
              </span>
              <span v-else style="color:var(--el-text-color-secondary); font-size:12px">—</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('attributeGroupMaintenance.segmentLength')" width="80">
            <template #default="scope">
              <el-input-number v-model="scope.row.length" :min="1" :max="20" size="small" controls-position="right" style="width: 70px" />
            </template>
          </el-table-column>
          <el-table-column :label="t('attributeGroupMaintenance.segmentType')" width="120">
            <template #default="scope">
              <el-select v-model="scope.row.type" size="small" style="width: 110px" @change="scope.row.segmentAttrCode = ''">
                <el-option value="select" :label="t('attributeGroupMaintenance.typeSelect')" />
                <el-option value="input" label="input" />
                <el-option value="system" :label="t('attributeGroupMaintenance.typeSystem')" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="t('attributeGroupMaintenance.segmentLinkStatus')" width="130" align="center">
            <template #default="scope">
              <template v-if="scope.row.type === 'select'">
                <span v-if="getDictByCode(scope.row.segmentAttrCode)" class="badge badge-success">
                  {{ t('attributeGroupMaintenance.badgeLinked') }}
                </span>
                <span v-else class="badge badge-danger">{{ t('attributeGroupMaintenance.badgeUnbound') }}</span>
              </template>
              <span v-else style="color:var(--el-text-color-secondary)">—</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('attributeGroupMaintenance.operation')" align="center" width="100">
            <template #default="scope">
              <el-button link size="small" :disabled="scope.$index === 0" @click="moveSegmentUp(scope.$index)">↑</el-button>
              <el-button link size="small" :disabled="scope.$index === ruleForm.segments.length - 1" @click="moveSegmentDown(scope.$index)">↓</el-button>
              <el-button link size="small" type="danger" @click="removeSegment(scope.$index)">✕</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pattern 預覽（虛線卡片，單行排版）-->
        <div class="preview-card">
          <strong>{{ t('attributeGroupMaintenance.patternPreview') }}</strong>
          <span class="mono preview-value">{{ computedPattern || '-' }}</span>
          <span class="preview-sep">|</span>
          <strong>{{ t('attributeGroupMaintenance.partSample') }}</strong>
          <span class="mono preview-value">{{ computedPartSample || '-' }}</span>
        </div>
      </el-form>
      <template #footer>
        <el-button class="btn-outline-custom" @click="ruleDialogVisible = false">{{ t('attributeGroupMaintenance.cancel') }}</el-button>
        <el-button class="btn-primary-custom" :loading="ruleSaving" @click="saveRule">{{ ruleSaving ? t('attributeGroupMaintenance.saving') : t('attributeGroupMaintenance.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- ── Dialog: 新增屬性代碼 ── -->
    <el-dialog
      v-model="addCodeDialogVisible"
      :title="t('attributeGroupMaintenance.addCodeTitle')"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form :model="addCodeForm" label-width="130px" size="small">
        <el-form-item :label="t('attributeGroupMaintenance.code')">
          <el-input v-model="addCodeForm.code" style="width: 200px" />
        </el-form-item>
        <el-form-item :label="t('attributeGroupMaintenance.definitionZh')">
          <el-input v-model="addCodeForm.definitionZh" style="width: 200px" />
        </el-form-item>
        <el-form-item :label="t('attributeGroupMaintenance.definitionEn')">
          <el-input v-model="addCodeForm.definitionEn" style="width: 200px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="btn-outline-custom" @click="addCodeDialogVisible = false">{{ t('attributeGroupMaintenance.cancel') }}</el-button>
        <el-button class="btn-primary-custom" :loading="addCodeSaving" @click="saveNewCode">{{ addCodeSaving ? t('attributeGroupMaintenance.saving') : t('attributeGroupMaintenance.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRulesList as fetchRulesList,
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
} from '@/api/attributeGroup'

const { t } = useI18n()

const selectedLanguage = ref('zh-TW')
const selectedSapTemplate = ref('all')
const activeTab = ref('rules')

// ── Tab 1: 屬性組規則 ─────────────────────────────────────────────────────────

const rulesSearchKeyword = ref('')
const rulesLoading = ref(false)
const rulesList = ref([])

async function loadRulesList() {
  rulesLoading.value = true
  try {
    const res = await fetchRulesList(rulesSearchKeyword.value?.trim() || '')
    rulesList.value = (res.success && Array.isArray(res.data)) ? res.data : []
  } catch (err) {
    console.error(err)
    ElMessage.error(err.message || '取得屬性組規則失敗')
    rulesList.value = []
  } finally {
    rulesLoading.value = false
  }
}

function onRulesSearch() { loadRulesList() }
function onRulesReset() { rulesSearchKeyword.value = ''; loadRulesList() }

// ── Rule Dialog ───────────────────────────────────────────────────────────────

const ruleDialogVisible = ref(false)
const ruleDialogMode = ref('add')   // 'add' | 'edit'
const ruleSaving = ref(false)
const ruleForm = ref({ code: '', definition: '', serialLen: 5, active: true, segments: [] })

const computedPattern = computed(() =>
  (ruleForm.value.segments || []).map(s => s.length || 0).join('-')
)

const computedPartSample = computed(() => {
  return (ruleForm.value.segments || []).map(seg => {
    const len = seg.length || 1
    if (seg.type === 'system') return 'N'.repeat(len)
    if (seg.type === 'select') return 'S'.repeat(len)
    return 'X'.repeat(len)
  }).join('')
})

// 查找 dictCodes 中的 meta 定義
function getDictMeta(code) {
  if (!code) return ''
  const d = dictCodes.value.find(item => item.code === code)
  return d ? d.definition : ''
}

function getDictByCode(code) {
  if (!code) return null
  return dictCodes.value.find(item => item.code === code) || null
}

// Segment 行背景色
function segmentRowClassName({ row }) {
  if (row.type === 'select') return 'seg-row-select'
  if (row.type === 'system') return 'seg-row-system'
  return ''
}

function onAddAttributeGroup() {
  ruleDialogMode.value = 'add'
  ruleForm.value = { code: '', definition: '', serialLen: 5, active: true, segments: [] }
  ruleDialogVisible.value = true
}

async function onEditRule(row) {
  ruleDialogMode.value = 'edit'
  ruleDialogVisible.value = true
  try {
    const res = await getRuleByCode(row.code)
    if (res.success && res.data && Array.isArray(res.data.segments) && res.data.segments.length > 0) {
      ruleForm.value = {
        code: res.data.code,
        definition: res.data.definition || '',
        serialLen: res.data.serialLen ?? 5,
        active: res.data.active !== false,
        segments: res.data.segments.map((s, i) => ({
          seq: i + 1,
          segmentAttrCode: s.segmentAttrCode || '',
          length: s.length || 1,
          type: s.type || 'input'
        }))
      }
      return
    }
  } catch (err) {
    console.warn('getRuleByCode failed, falling back to style decompose', err)
  }
  // Fallback: decompose style pattern into segments
  const styleStr = row.style || ''
  const lengths = styleStr.split('-').map(Number).filter(n => n > 0)
  ruleForm.value = {
    code: row.code,
    definition: row.definition || '',
    serialLen: row.serialLen ?? 5,
    active: row.active !== false,
    segments: lengths.map((len, i) => ({ seq: i + 1, segmentAttrCode: '', length: len, type: 'input' }))
  }
}

function addSegment() {
  const segs = ruleForm.value.segments
  segs.push({ seq: segs.length + 1, segmentAttrCode: '', length: 1, type: 'select' })
}

function removeSegment(idx) {
  ruleForm.value.segments.splice(idx, 1)
}

function moveSegmentUp(idx) {
  if (idx === 0) return
  const segs = ruleForm.value.segments
  ;[segs[idx - 1], segs[idx]] = [segs[idx], segs[idx - 1]]
}

function moveSegmentDown(idx) {
  const segs = ruleForm.value.segments
  if (idx >= segs.length - 1) return
  ;[segs[idx], segs[idx + 1]] = [segs[idx + 1], segs[idx]]
}

async function saveRule() {
  if (!ruleForm.value.code) {
    ElMessage.warning('代碼為必填')
    return
  }
  ruleSaving.value = true
  try {
    const payload = {
      code: ruleForm.value.code,
      definition: ruleForm.value.definition,
      serialLen: ruleForm.value.serialLen,
      active: ruleForm.value.active,
      segments: ruleForm.value.segments.map((s, i) => ({ ...s, seq: i + 1 }))
    }
    if (ruleDialogMode.value === 'add') {
      await createRule(payload)
    } else {
      await updateRule(ruleForm.value.code, payload)
    }
    ElMessage.success(t('attributeGroupMaintenance.saveSuccess'))
    ruleDialogVisible.value = false
    loadRulesList()
  } catch (err) {
    ElMessage.error(err.message || '儲存失敗')
  } finally {
    ruleSaving.value = false
  }
}

async function onDeleteRule(row) {
  try {
    await ElMessageBox.confirm(t('attributeGroupMaintenance.confirmDeleteGroup'), t('attributeGroupMaintenance.delete'), {
      type: 'warning',
      confirmButtonText: t('attributeGroupMaintenance.delete'),
      cancelButtonText: t('attributeGroupMaintenance.cancel')
    })
    await deleteRule(row.code)
    ElMessage.success(t('attributeGroupMaintenance.deleteSuccess'))
    loadRulesList()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error(err.message || '刪除失敗')
  }
}

// ── Tab 2: 全域字典主檔 ───────────────────────────────────────────────────────

const dictionaryLoading = ref(false)
const dictionaryCodeList = ref([])
const selectedCode = ref(null)
const selectedCodeValues = ref([])
const editingDefinitionZh = ref('')
const editingDefinitionEn = ref('')
const savingDefinition = ref(false)
const newOptionValue = ref('')
const newOptionLabel = ref('')
const addingOption = ref(false)

async function loadDictionaryList() {
  dictionaryLoading.value = true
  try {
    const res = await getDictionaryList(selectedLanguage.value)
    dictionaryCodeList.value = (res.success && Array.isArray(res.data)) ? res.data : []
  } catch (err) {
    console.error(err)
    ElMessage.error(err.message || '取得屬性代碼清單失敗')
    dictionaryCodeList.value = []
  } finally {
    dictionaryLoading.value = false
  }
}

function onLanguageChange() {
  loadDictionaryList()
  selectedCode.value = null
  selectedCodeValues.value = []
}

async function onDictionaryRowSelect(row) {
  if (!row) {
    selectedCode.value = null
    selectedCodeValues.value = []
    editingDefinitionZh.value = ''
    editingDefinitionEn.value = ''
    return
  }
  selectedCode.value = row.code
  editingDefinitionZh.value = row.definition || ''
  editingDefinitionEn.value = ''
  try {
    const res = await getDictionaryByCode(row.code)
    if (res.success && res.data) {
      editingDefinitionEn.value = res.data.definitionEn || ''
      selectedCodeValues.value = Array.isArray(res.data.values)
        ? res.data.values.map(v => ({ active: true, ...v }))
        : []
    } else {
      selectedCodeValues.value = []
    }
  } catch (err) {
    ElMessage.error(err.message || '取得屬性值失敗')
    selectedCodeValues.value = []
  }
  newOptionValue.value = ''
  newOptionLabel.value = ''
}

async function saveDefinition() {
  if (!selectedCode.value) return
  savingDefinition.value = true
  try {
    await updateDictionaryCode(selectedCode.value, {
      definitionZh: editingDefinitionZh.value,
      definitionEn: editingDefinitionEn.value
    })
    ElMessage.success(t('attributeGroupMaintenance.saveSuccess'))
    loadDictionaryList()
  } catch (err) {
    ElMessage.error(err.message || '儲存失敗')
  } finally {
    savingDefinition.value = false
  }
}

async function onUpdateOption(optRow) {
  if (!selectedCode.value) return
  try {
    await updateOptionValue(selectedCode.value, optRow.value, { label: optRow.label, active: optRow.active })
  } catch (err) {
    ElMessage.error(err.message || '更新失敗')
  }
}

function promptAddOption() {
  // 讓使用者在 add-option-row 填寫後按新增
}

async function onAddOption() {
  if (!selectedCode.value || !newOptionValue.value) {
    ElMessage.warning('選項值為必填')
    return
  }
  addingOption.value = true
  try {
    await createOptionValue(selectedCode.value, { value: newOptionValue.value, label: newOptionLabel.value })
    ElMessage.success(t('attributeGroupMaintenance.saveSuccess'))
    newOptionValue.value = ''
    newOptionLabel.value = ''
    const res = await getDictionaryByCode(selectedCode.value)
    if (res.success && res.data) {
      selectedCodeValues.value = Array.isArray(res.data.values)
        ? res.data.values.map(v => ({ active: true, ...v }))
        : []
    }
  } catch (err) {
    ElMessage.error(err.message || '新增失敗')
  } finally {
    addingOption.value = false
  }
}

async function onDeleteOption(optRow) {
  try {
    await ElMessageBox.confirm(t('attributeGroupMaintenance.confirmDeleteOption'), t('attributeGroupMaintenance.delete'), {
      type: 'warning',
      confirmButtonText: t('attributeGroupMaintenance.delete'),
      cancelButtonText: t('attributeGroupMaintenance.cancel')
    })
    await deleteOptionValue(selectedCode.value, optRow.value)
    ElMessage.success(t('attributeGroupMaintenance.deleteSuccess'))
    selectedCodeValues.value = selectedCodeValues.value.filter(v => v.value !== optRow.value)
  } catch (err) {
    if (err !== 'cancel') ElMessage.error(err.message || '刪除失敗')
  }
}

// ── Add Code Dialog ───────────────────────────────────────────────────────────

const addCodeDialogVisible = ref(false)
const addCodeSaving = ref(false)
const addCodeForm = ref({ code: '', definitionZh: '', definitionEn: '' })

function onAddCode() {
  addCodeForm.value = { code: '', definitionZh: '', definitionEn: '' }
  addCodeDialogVisible.value = true
}

async function saveNewCode() {
  if (!addCodeForm.value.code) {
    ElMessage.warning('代碼為必填')
    return
  }
  addCodeSaving.value = true
  try {
    await createDictionaryCode(addCodeForm.value)
    ElMessage.success(t('attributeGroupMaintenance.saveSuccess'))
    addCodeDialogVisible.value = false
    loadDictionaryList()
  } catch (err) {
    ElMessage.error(err.message || '新增失敗')
  } finally {
    addCodeSaving.value = false
  }
}

async function onDeleteCode(row) {
  if ((row.refs || 0) > 0) {
    ElMessage.error(t('attributeGroupMaintenance.cannotDeleteCodeInUse'))
    return
  }
  try {
    await ElMessageBox.confirm(t('attributeGroupMaintenance.confirmDeleteCode'), t('attributeGroupMaintenance.delete'), {
      type: 'warning',
      confirmButtonText: t('attributeGroupMaintenance.delete'),
      cancelButtonText: t('attributeGroupMaintenance.cancel')
    })
    await deleteDictionaryCode(row.code)
    ElMessage.success(t('attributeGroupMaintenance.deleteSuccess'))
    if (selectedCode.value === row.code) {
      selectedCode.value = null
      selectedCodeValues.value = []
      editingDefinitionZh.value = ''
      editingDefinitionEn.value = ''
    }
    loadDictionaryList()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error(err.message || '刪除失敗')
  }
}

// ── Dict Codes for segment select ─────────────────────────────────────────────

const dictCodes = ref([])

async function loadDictCodes() {
  try {
    const res = await getDictionaryList('zh-TW')
    dictCodes.value = (res.success && Array.isArray(res.data)) ? res.data : []
  } catch (_) {
    dictCodes.value = []
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  loadRulesList()
  loadDictionaryList()
  loadDictCodes()
})
</script>

<style scoped>
/* ── CSS 變數 ── */
.attribute-group-maintenance {
  --primary: #0b6f8a;
  --primary-dark: #075a70;
  --bg: #f8fafc;
  --border: #e2e8f0;
  --text-muted: #64748b;
  --danger: #ef4444;
  --success: #10b981;

  padding: 0 4px;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0;
  border-bottom: 2px solid var(--border);
  padding-bottom: 16px;
  margin-bottom: 24px;
}
.header-left { flex: 1; }
.page-title {
  margin: 0 0 6px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}
.page-subtitle { margin: 0; font-size: 14px; color: var(--text-muted); }
.header-right { flex-shrink: 0; }

/* ── Tabs ── */
.main-tabs {
  margin-top: 8px;
}
:deep(.main-tabs .el-tabs__nav-wrap::after) {
  background-color: var(--border);
}
:deep(.main-tabs .el-tabs__item) {
  font-weight: 700;
  color: var(--text-muted);
  border-radius: 8px 8px 0 0;
}
:deep(.main-tabs .el-tabs__item.is-active) {
  color: var(--primary);
}
:deep(.main-tabs .el-tabs__active-bar) {
  background-color: var(--primary);
}

/* ── Toolbar Card ── */
.toolbar-card {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

/* ── Content Card ── */
.content-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* ── Table overrides ── */
:deep(.el-table th.el-table__cell) {
  background-color: var(--bg) !important;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 2px solid var(--border) !important;
}
:deep(.el-table tr:hover > td.el-table__cell) {
  background-color: #f1f5f9 !important;
}

/* Segment row colors */
:deep(.seg-row-select td.el-table__cell) {
  background-color: #f0fdfa !important;
}
:deep(.seg-row-system td.el-table__cell) {
  background-color: #fffbeb !important;
}

/* ── Buttons ── */
.btn-primary-custom {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  color: #fff !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
}
.btn-primary-custom:hover {
  background-color: var(--primary-dark) !important;
  border-color: var(--primary-dark) !important;
}
.btn-primary-custom:disabled,
.btn-primary-custom.is-loading {
  opacity: 0.7;
}

.btn-outline-custom {
  background-color: #fff !important;
  border-color: var(--border) !important;
  color: #1e293b !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
}
.btn-outline-custom:hover {
  background-color: #f1f5f9 !important;
}

/* ── Badges ── */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}
.badge-info    { background: #e0f2fe; color: #0369a1; }
.badge-success { background: #dcfce7; color: #15803d; }
.badge-danger  { background: #fee2e2; color: #ef4444; }
.badge-inactive { background: #f1f5f9; color: #64748b; }

/* ── Card header ── */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ── Empty hint ── */
.empty-hint {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

/* ── Dictionary editor ── */
.value-maintenance-content { padding: 4px 0; }
.dict-separator {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 12px 0;
}
.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.add-option-row {
  display: flex;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 6px;
}

/* ── Segment dialog ── */
.segment-toolbar { display: flex; align-items: center; margin-bottom: 8px; }

/* ── Preview card ── */
.preview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 14px 20px;
  margin-top: 4px;
  font-size: 14px;
  flex-wrap: wrap;
}
.preview-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--primary);
  font-weight: 600;
}
.preview-sep {
  color: var(--text-muted);
  margin: 0 12px;
}

/* ── Rule dialog override ── */
:deep(.rule-dialog .el-dialog) {
  border-radius: 16px;
}
</style>
