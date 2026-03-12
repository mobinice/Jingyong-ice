<template>
  <div class="user-management">
    <div class="page-header">
      <h2 class="page-title">{{ t('userManagement.title') }}</h2>
      <div class="header-row">
        <p class="page-description">{{ t('userManagement.description') }}</p>
        <el-space class="header-buttons" :size="12">
          <el-button @click="handleExportCsv">{{ t('userManagement.exportCsv') }}</el-button>
          <el-button type="primary" :icon="Plus" @click="handleAddAccount">{{ t('userManagement.addAccount') }}</el-button>
        </el-space>
      </div>
    </div>

    <el-card shadow="never" class="search-table-card">
      <el-row :gutter="16" align="middle" style="margin-bottom: 16px">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            :placeholder="t('userManagement.searchPlaceholder')"
            clearable
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterStatus" :placeholder="t('userManagement.allStatus')" clearable style="width: 100%">
            <el-option :label="t('userManagement.allStatus')" value="" />
            <el-option :label="t('userManagement.statusActive')" value="active" />
            <el-option :label="t('userManagement.statusInactive')" value="inactive" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterType" :placeholder="t('userManagement.allType')" clearable style="width: 100%">
            <el-option :label="t('userManagement.allType')" value="" />
            <el-option :label="t('userManagement.typeCustomer')" value="customer" />
            <el-option :label="t('userManagement.typeVendor')" value="vendor" />
          </el-select>
        </el-col>
        <el-col :span="4" style="text-align: right">
          <span class="show-count">{{ t('userManagement.showCount', { current: filteredList.length, total: mockAccounts.length }) }}</span>
        </el-col>
        <el-col :span="4" style="text-align: right">
          <el-button @click="clearFilters">{{ t('userManagement.clearFilters') }}</el-button>
        </el-col>
      </el-row>
      <el-table :data="filteredList" border stripe style="width: 100%">
        <el-table-column :label="t('userManagement.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? t('userManagement.statusActive') : t('userManagement.statusInactive') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('userManagement.accountEmail')" prop="email" min-width="160" />
        <el-table-column :label="t('userManagement.company')" prop="company" min-width="120" />
        <el-table-column :label="t('userManagement.type')" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ row.type === 'customer' ? t('userManagement.typeCustomer') : t('userManagement.typeVendor') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('userManagement.contact')" prop="contact" min-width="180" />
        <el-table-column :label="t('userManagement.bomScope')" prop="bomScope" min-width="280" show-overflow-tooltip />
        <el-table-column :label="t('userManagement.lastLogin')" prop="lastLogin" width="140" />
        <el-table-column :label="t('userManagement.createdAt')" prop="createdAt" width="140" />
        <el-table-column :label="t('userManagement.createdBy')" prop="createdBy" width="100" />
        <el-table-column :label="t('userManagement.actions')" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-space direction="vertical" :size="8" alignment="center">
              <el-space :size="8" wrap>
                <el-button round plain size="small" @click="onEdit(row)">{{ t('userManagement.edit') }}</el-button>
                <el-button
                  round
                  plain
                  size="small"
                  @click="row.status === 'active' ? onDisable(row) : onEnable(row)"
                >
                  {{ row.status === 'active' ? t('userManagement.disable') : t('userManagement.enable') }}
                </el-button>
              </el-space>
              <el-button round plain size="small" @click="onResetPassword(row)">{{ t('userManagement.resetPassword') }}</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/編輯帳號 Dialog -->
    <el-dialog
      v-model="addAccountDialogVisible"
      :title="editingAccountId ? t('userManagement.dialogTitleEdit') : t('userManagement.dialogTitle')"
      width="760px"
      top="5vh"
      class="add-account-dialog"
      destroy-on-close
      @close="resetAddAccountForm"
    >
      <p class="dialog-subtitle">{{ t('userManagement.dialogSubtitle') }}</p>

      <el-form ref="addAccountFormRef" :model="addAccountForm" label-position="top">
        <div class="form-section-box">
          <div class="form-section-title">{{ t('userManagement.sectionBasic') }}</div>
          <el-form-item :label="t('userManagement.labelEmail')" required>
            <el-input v-model="addAccountForm.email" :placeholder="t('userManagement.placeholderEmail')" :disabled="!!editingAccountId" />
            <div class="form-hint">{{ t('userManagement.hintEmailUnique') }}</div>
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item :label="t('userManagement.labelOrganization')" required>
                <el-input v-model="addAccountForm.organization" :placeholder="t('userManagement.placeholderOrganization')" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('userManagement.labelType')" required>
                <el-select v-model="addAccountForm.type" :placeholder="t('userManagement.placeholderType')" style="width: 100%">
                  <el-option :label="t('userManagement.typeCustomer')" value="customer" />
                  <el-option :label="t('userManagement.typeVendor')" value="vendor" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item :label="t('userManagement.labelContactName')">
                <el-input v-model="addAccountForm.contactName" :placeholder="t('userManagement.placeholderContactName')" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('userManagement.labelPhone')">
                <el-input v-model="addAccountForm.phone" :placeholder="t('userManagement.placeholderPhone')" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item :label="t('userManagement.labelNotes')">
            <el-input v-model="addAccountForm.notes" type="textarea" :placeholder="t('userManagement.placeholderNotes')" :rows="2" />
          </el-form-item>

          <div class="form-section-title">{{ t('userManagement.sectionInitialStatus') }}</div>
          <el-form-item :label="t('userManagement.labelInitialStatus')">
            <el-select v-model="addAccountForm.initialStatus" style="width: 100%">
              <el-option :label="t('userManagement.statusActive')" value="active" />
              <el-option :label="t('userManagement.statusInactive')" value="inactive" />
            </el-select>
            <div class="form-hint">{{ t('userManagement.hintDisabledCannotSignIn') }}</div>
          </el-form-item>
        </div>

        <div class="form-section-box">
          <div class="form-section-title">{{ t('userManagement.bomScopeTitle') }}</div>
          <el-tabs v-model="bomScopeActiveTab" class="bom-scope-tabs">
          <el-tab-pane :label="t('userManagement.tabBindOrg')" name="bindOrg">
            <p class="bom-scope-hint">{{ t('userManagement.bomScopeInstruction') }}</p>
            <div class="org-chips">
              <el-tag
                v-for="org in demoOrganizations"
                :key="org.id"
                :type="addAccountForm.selectedScopeIds.includes(org.id) ? 'primary' : 'info'"
                class="org-chip"
                @click="toggleScopeOrg(org.id)"
              >
                {{ t('userManagement.' + org.labelKey) }}
              </el-tag>
            </div>
            <div class="scope-display">
              <template v-if="addAccountForm.selectedScopeIds.length === 0">
                <span class="scope-placeholder">{{ t('userManagement.scopeEmptyPlaceholder') }}</span>
              </template>
              <template v-else>
                <el-tag
                  v-for="id in addAccountForm.selectedScopeIds"
                  :key="id"
                  size="small"
                  closable
                  class="scope-tag"
                  @close="removeScopeOrg(id)"
                >
                  {{ t('userManagement.' + demoOrganizations.find(o => o.id === id)?.labelKey) }}
                </el-tag>
              </template>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="t('userManagement.tabSelectBomList')" name="bomList">
            <p class="bom-scope-hint">{{ t('userManagement.bomListInstruction') }}</p>
            <div class="org-chips">
              <el-tag
                v-for="bom in demoBomList"
                :key="bom.id"
                :type="addAccountForm.selectedBomIds.includes(bom.id) ? 'primary' : ''"
                class="org-chip bom-chip"
                @click="toggleBom(bom.id)"
              >
                {{ t('userManagement.' + bom.labelKey) }}
              </el-tag>
            </div>
            <div class="scope-display">
              <template v-if="addAccountForm.selectedBomIds.length === 0">
                <span class="scope-placeholder">{{ t('userManagement.scopeEmptyPlaceholder') }}</span>
              </template>
              <template v-else>
                <el-tag
                  v-for="id in addAccountForm.selectedBomIds"
                  :key="id"
                  size="small"
                  closable
                  class="scope-tag"
                  @close="removeBom(id)"
                >
                  {{ t('userManagement.' + demoBomList.find(b => b.id === id)?.labelKey) }}
                </el-tag>
              </template>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="t('userManagement.tabPartRules')" name="partRules">
            <el-row :gutter="16" class="part-rules-row">
              <el-col :span="12">
                <el-form-item :label="t('userManagement.partRulesPrefixLabel')">
                  <el-input v-model="addAccountForm.partPrefix" :placeholder="t('userManagement.partRulesPrefixPlaceholder')" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="t('userManagement.partRulesRangeLabel')">
                  <el-input v-model="addAccountForm.partRange" :placeholder="t('userManagement.partRulesRangePlaceholder')" clearable />
                </el-form-item>
              </el-col>
            </el-row>
            <p class="bom-scope-hint part-rules-hint">{{ t('userManagement.partRulesHint') }}</p>
            <div class="part-rules-add-row">
              <el-button size="small" @click="addPartRule">{{ t('userManagement.partRulesAdd') }}</el-button>
            </div>
            <div class="scope-display">
              <template v-if="addAccountForm.partRulesList.length === 0">
                <span class="scope-placeholder">{{ t('userManagement.scopeEmptyPlaceholder') }}</span>
              </template>
              <template v-else>
                <el-tag
                  v-for="(rule, index) in addAccountForm.partRulesList"
                  :key="index"
                  size="small"
                  closable
                  class="scope-tag"
                  @close="removePartRule(index)"
                >
                  {{ rule.prefix || '–' }} : {{ rule.range || '–' }}
                </el-tag>
              </template>
            </div>
          </el-tab-pane>
        </el-tabs>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="addAccountDialogVisible = false">{{ t('userManagement.cancel') }}</el-button>
        <el-button @click="handleSaveAndSendInvite">{{ t('userManagement.saveAndSendInvite') }}</el-button>
        <el-button type="primary" @click="handleSaveAccount">{{ t('userManagement.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const { t } = useI18n()

const mockAccounts = [
  {
    id: '1',
    status: 'active',
    email: 'buyer-a@huadong.com',
    company: '華東電子',
    type: 'customer',
    contact: '王小明 / +886 912-000-111',
    bomScope: '客戶A (華東電子) | BOM-10012 | 主板組件 / 1 個單位 · 2 筆 BOM',
    lastLogin: '2026-02-10 09:21',
    createdAt: '2026-02-01 14:05',
    createdBy: 'Admin'
  },
  {
    id: '2',
    status: 'inactive',
    email: 'vendor-x@jinggong.com',
    company: '精工零件',
    type: 'vendor',
    contact: 'Alex Chen / +886 2-2345-6789',
    bomScope: '廠商X (精工零件) | Prefix ABC / 1 個單位, 前綴: ABC',
    lastLogin: '-',
    createdAt: '2026-01-28 11:40',
    createdBy: 'Admin'
  },
  {
    id: '3',
    status: 'active',
    email: 'pm@beihai.co',
    company: '北海貿易',
    type: 'customer',
    contact: 'Lina',
    bomScope: '客戶B (北海貿易) | BOM-33001 | 外殼件 | Range ABC0001~ABC0999 / 1 個單位 · 1 筆 BOM · 區間: ABC0001~ABC0999',
    lastLogin: '2026-02-09 17:03',
    createdAt: '2026-01-30 09:12',
    createdBy: 'Admin'
  }
]

const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')

const filteredList = computed(() => {
  let list = mockAccounts
  const kw = (searchKeyword.value || '').trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (r) =>
        (r.email && r.email.toLowerCase().includes(kw)) ||
        (r.company && r.company.toLowerCase().includes(kw)) ||
        (r.contact && r.contact.toLowerCase().includes(kw))
    )
  }
  if (filterStatus.value) {
    list = list.filter((r) => r.status === filterStatus.value)
  }
  if (filterType.value) {
    list = list.filter((r) => r.type === filterType.value)
  }
  return list
})

function clearFilters() {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterType.value = ''
}

function handleExportCsv() {
  // Placeholder: no real implementation
}

const addAccountDialogVisible = ref(false)
const addAccountFormRef = ref(null)
const bomScopeActiveTab = ref('bindOrg')
const editingAccountId = ref(null)

const demoOrganizations = [
  { id: 'customer-a', labelKey: 'orgCustomerA' },
  { id: 'customer-b', labelKey: 'orgCustomerB' },
  { id: 'vendor-x', labelKey: 'orgVendorX' },
  { id: 'vendor-y', labelKey: 'orgVendorY' }
]

const demoBomList = [
  { id: 'bom-10012', labelKey: 'bom10012' },
  { id: 'bom-20388', labelKey: 'bom20388' },
  { id: 'bom-33001', labelKey: 'bom33001' },
  { id: 'bom-44007', labelKey: 'bom44007' }
]

const addAccountForm = reactive({
  email: '',
  organization: '',
  type: '',
  contactName: '',
  phone: '',
  notes: '',
  initialStatus: 'active',
  selectedScopeIds: [],
  selectedBomIds: [],
  partPrefix: '',
  partRange: '',
  partRulesList: []
})

function handleAddAccount() {
  editingAccountId.value = null
  addAccountDialogVisible.value = true
}

function openDialogForEdit(row) {
  editingAccountId.value = row.id
  addAccountForm.email = row.email || ''
  addAccountForm.organization = row.company || ''
  addAccountForm.type = row.type || ''
  addAccountForm.initialStatus = row.status || 'active'
  const contactStr = (row.contact || '').trim()
  const sep = ' / '
  const idx = contactStr.indexOf(sep)
  if (idx !== -1) {
    addAccountForm.contactName = contactStr.slice(0, idx).trim()
    addAccountForm.phone = contactStr.slice(idx + sep.length).trim()
  } else {
    addAccountForm.contactName = contactStr
    addAccountForm.phone = ''
  }
  addAccountForm.notes = ''
  addAccountForm.selectedScopeIds = []
  addAccountForm.selectedBomIds = []
  addAccountForm.partPrefix = ''
  addAccountForm.partRange = ''
  addAccountForm.partRulesList = []
  bomScopeActiveTab.value = 'bindOrg'
  addAccountDialogVisible.value = true
}

function resetAddAccountForm() {
  editingAccountId.value = null
  addAccountForm.email = ''
  addAccountForm.organization = ''
  addAccountForm.type = ''
  addAccountForm.contactName = ''
  addAccountForm.phone = ''
  addAccountForm.notes = ''
  addAccountForm.initialStatus = 'active'
  addAccountForm.selectedScopeIds = []
  addAccountForm.selectedBomIds = []
  addAccountForm.partPrefix = ''
  addAccountForm.partRange = ''
  addAccountForm.partRulesList = []
  bomScopeActiveTab.value = 'bindOrg'
}

function toggleScopeOrg(id) {
  const idx = addAccountForm.selectedScopeIds.indexOf(id)
  if (idx === -1) {
    addAccountForm.selectedScopeIds.push(id)
  } else {
    addAccountForm.selectedScopeIds.splice(idx, 1)
  }
}

function removeScopeOrg(id) {
  const idx = addAccountForm.selectedScopeIds.indexOf(id)
  if (idx !== -1) addAccountForm.selectedScopeIds.splice(idx, 1)
}

function toggleBom(id) {
  const idx = addAccountForm.selectedBomIds.indexOf(id)
  if (idx === -1) {
    addAccountForm.selectedBomIds.push(id)
  } else {
    addAccountForm.selectedBomIds.splice(idx, 1)
  }
}

function removeBom(id) {
  const idx = addAccountForm.selectedBomIds.indexOf(id)
  if (idx !== -1) addAccountForm.selectedBomIds.splice(idx, 1)
}

function addPartRule() {
  const prefix = (addAccountForm.partPrefix || '').trim()
  const range = (addAccountForm.partRange || '').trim()
  if (prefix || range) {
    addAccountForm.partRulesList.push({ prefix, range })
    addAccountForm.partPrefix = ''
    addAccountForm.partRange = ''
  }
}

function removePartRule(index) {
  addAccountForm.partRulesList.splice(index, 1)
}

function buildContactString() {
  const name = (addAccountForm.contactName || '').trim()
  const phone = (addAccountForm.phone || '').trim()
  return phone ? `${name} / ${phone}` : name
}

function buildBomScopeMockString() {
  const parts = []
  if (addAccountForm.selectedScopeIds.length) {
    const labels = addAccountForm.selectedScopeIds.map((id) => {
      const org = demoOrganizations.find((o) => o.id === id)
      return org ? t('userManagement.' + org.labelKey) : id
    })
    parts.push(labels.join(' · '))
  }
  if (addAccountForm.selectedBomIds.length) {
    const labels = addAccountForm.selectedBomIds.map((id) => {
      const bom = demoBomList.find((b) => b.id === id)
      return bom ? t('userManagement.' + bom.labelKey) : id
    })
    parts.push(labels.join(' · '))
  }
  if (addAccountForm.partRulesList.length) {
    const rules = addAccountForm.partRulesList.map((r) => `${r.prefix || '–'} : ${r.range || '–'}`)
    parts.push(rules.join(' · '))
  }
  return parts.length ? parts.join(' | ') : '–'
}

function persistAccountForm() {
  const contact = buildContactString()
  const bomScope = buildBomScopeMockString()
  const payload = {
    status: addAccountForm.initialStatus,
    email: addAccountForm.email.trim(),
    company: addAccountForm.organization.trim(),
    type: addAccountForm.type || 'customer',
    contact,
    bomScope,
    lastLogin: '-',
    createdAt: '',
    createdBy: 'Admin'
  }
  if (editingAccountId.value) {
    const item = mockAccounts.find((a) => a.id === editingAccountId.value)
    if (item) {
      item.status = payload.status
      item.email = payload.email
      item.company = payload.company
      item.type = payload.type
      item.contact = payload.contact
      item.bomScope = payload.bomScope
    }
  } else {
    const nextId = String(Math.max(0, ...mockAccounts.map((a) => Number(a.id) || 0)) + 1)
    mockAccounts.push({
      id: nextId,
      ...payload,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lastLogin: '-'
    })
  }
}

function handleSaveAndSendInvite() {
  persistAccountForm()
  addAccountDialogVisible.value = false
}

function handleSaveAccount() {
  persistAccountForm()
  addAccountDialogVisible.value = false
}

function onEdit(row) {
  openDialogForEdit(row)
}

function onDisable(row) {
  ElMessageBox.confirm(t('userManagement.confirmDisableMessage'), '', {
    confirmButtonText: t('userManagement.confirm'),
    cancelButtonText: t('userManagement.cancel'),
    type: 'warning'
  }).then(() => {
    const item = mockAccounts.find((a) => a.id === row.id)
    if (item) item.status = 'inactive'
  }).catch(() => {})
}

function onEnable(row) {
  ElMessageBox.confirm(t('userManagement.confirmEnableMessage'), '', {
    confirmButtonText: t('userManagement.confirm'),
    cancelButtonText: t('userManagement.cancel'),
    type: 'info'
  }).then(() => {
    const item = mockAccounts.find((a) => a.id === row.id)
    if (item) item.status = 'active'
  }).catch(() => {})
}

function onResetPassword(row) {
  ElMessageBox.confirm(t('userManagement.confirmResetPasswordMessage', { email: row.email || '' }), '', {
    confirmButtonText: t('userManagement.confirm'),
    cancelButtonText: t('userManagement.cancel'),
    type: 'info'
  }).then(() => {
    // 發送重設信邏輯尚未接 API
  }).catch(() => {})
}
</script>

<style scoped>
.user-management {
  padding: 0;
}
.page-header {
  margin-bottom: 20px;
}
.page-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}
.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
  margin-top: 8px;
}
.page-description {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}
.header-buttons {
  flex-shrink: 0;
}
.search-table-card {
  margin-bottom: 20px;
}
.show-count {
  font-size: 14px;
  color: #606266;
}

/* 新增帳號 Dialog */
.dialog-subtitle {
  margin: -8px 0 0 0;
  padding-bottom: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  border-bottom: 1px solid #ebeef5;
}
.form-section-box {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.form-section-box:last-of-type {
  margin-bottom: 0;
}
.form-section-title {
  font-weight: 600;
  color: #303133;
  margin: 16px 0 12px 0;
  font-size: 14px;
}
.form-section-box .form-section-title:first-child {
  margin-top: 0;
}
.form-section-box .form-section-title {
  margin-top: 16px;
}
.form-section-box .form-section-title:first-child {
  margin-top: 0;
}
.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.bom-scope-tabs {
  margin-top: 8px;
}
.bom-scope-hint {
  font-size: 13px;
  color: #606266;
  margin: 0 0 12px 0;
}
.part-rules-row {
  margin-bottom: 0;
}
.part-rules-hint {
  margin-top: 0;
}
.part-rules-add-row {
  margin-bottom: 12px;
}
.org-chips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  margin-bottom: 12px;
}
.org-chip {
  cursor: pointer;
}
.scope-display {
  min-height: 56px;
  padding: 12px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.scope-placeholder {
  color: #909399;
  font-size: 13px;
}
.scope-tag {
  margin: 0;
}
</style>
