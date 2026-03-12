import { getConnection } from '../db/connection.js'
import sql from 'mssql'

/**
 * Default dropdown options for each select-type attribute code.
 * Used as fallback when INVMJ has no entries for that code.
 * Users can override these via 屬性組維護 → 字典頁籤.
 */
const HARDCODED_OPTIONS = {
  IDENT: [
    { value: 'Z', label: 'Z－整品' },
    { value: 'P', label: 'P－採購件' },
    { value: 'M', label: 'M－自製件' },
  ],
  PART: [
    { value: '01', label: '01－電子類' },
    { value: '02', label: '02－機械類' },
    { value: '03', label: '03－其他類' },
  ],
  CUST: [
    { value: 'AA', label: 'AA－客戶A' },
    { value: 'BB', label: 'BB－客戶B' },
  ],
  BRAND: [
    { value: 'A1', label: 'A1－品牌A' },
    { value: 'B1', label: 'B1－品牌B' },
  ],
  STYLE: [
    { value: 'S1', label: 'S1－型式1' },
    { value: 'S2', label: 'S2－型式2' },
  ],
  GRADE: [
    { value: 'A', label: 'A－A級' },
    { value: 'B', label: 'B－B級' },
    { value: 'C', label: 'C－C級' },
  ],
}

/**
 * Attribute codes that must exist in INVMI for the dictionary tab to work.
 */
const ATTR_CODES = [
  { code: 'IDENT', definition: '識別碼' },
  { code: 'PART',  definition: '品類碼' },
  { code: 'CUST',  definition: '客戶碼' },
  { code: 'BRAND', definition: '品牌碼' },
  { code: 'STYLE', definition: '型式碼' },
  { code: 'GRADE', definition: '等級碼' },
]

/**
 * Hardcoded attribute group definitions.
 * Used as the source of truth (INVMK/INVML currently empty).
 * Each select-type segment will have its options loaded from INVMJ at runtime.
 */
const HARDCODED_GROUPS = {
  'GRP-A': {
    label: 'GRP-A（1-2-2-1-5）',
    serialLen: 5,
    segments: [
      { seq: 1, code: 'IDENT', meaning: '識別碼', length: 1, type: 'select' },
      { seq: 2, code: 'PART',  meaning: '品類碼', length: 2, type: 'select' },
      { seq: 3, code: 'CUST',  meaning: '客戶碼', length: 2, type: 'select' },
      { seq: 4, code: 'RSV',   meaning: '保留碼', length: 1, type: 'input'  },
      { seq: 5, code: 'SERIAL',meaning: '流水碼（系統產生）', length: 5, type: 'system' },
    ]
  },
  'GRP-B': {
    label: 'GRP-B（2-2-1-1-4）',
    serialLen: 4,
    segments: [
      { seq: 1, code: 'BRAND', meaning: '品牌碼', length: 2, type: 'select' },
      { seq: 2, code: 'STYLE', meaning: '型式碼', length: 2, type: 'select' },
      { seq: 3, code: 'GRADE', meaning: '等級碼', length: 1, type: 'select' },
      { seq: 4, code: 'RSV',   meaning: '保留碼', length: 1, type: 'input'  },
      { seq: 5, code: 'SERIAL',meaning: '流水碼（系統產生）', length: 4, type: 'system' },
    ]
  }
}

/**
 * GET /api/part-numbers/attr-groups
 * Dynamically loads attribute groups from INVMI+INVMK+INVMJ.
 * Falls back to GROUPS_FALLBACK (with options from INVMJ) if INVMK is empty.
 */
export const getAttrGroups = async () => {
  try {
    const pool = await getConnection()

    // Ensure INVMI has rows for all attribute codes (字典頁籤才能顯示並管理)
    try {
      for (const { code, definition } of ATTR_CODES) {
        const check = await pool.request()
          .input('code', sql.NVarChar(50), code)
          .query(`SELECT 1 FROM dbo.INVMI WHERE MI001 = @code`)
        if (!check.recordset?.length) {
          await pool.request()
            .input('code', sql.NVarChar(50), code)
            .input('def',  sql.NVarChar(200), definition)
            .input('cnt',  sql.Int, 0)
            .query(`INSERT INTO dbo.INVMI (MI001, MI002, MI004) VALUES (@code, @def, @cnt)`)
        }
      }
    } catch (initErr) {
      console.warn('INVMI init skipped (non-critical):', initErr.message)
    }

    // Try to load groups from INVMK
    const mkResult = await pool.request().query(`
      SELECT mk.MK001, mk.MK002, mk.MK003, mk.MK004, mk.MK005,
             mi_grp.MI002 AS groupDef, mi_grp.MI003 AS pattern,
             mi_seg.MI002 AS segMeaning
      FROM dbo.INVMK mk
      INNER JOIN dbo.INVMI mi_grp ON mi_grp.MI001 = mk.MK001
      LEFT JOIN dbo.INVMI mi_seg ON mi_seg.MI001 = mk.MK003
      ORDER BY mk.MK001, mk.MK002
    `)

    const useDB = mkResult.recordset && mkResult.recordset.length > 0

    let rawGroups = {}
    if (useDB) {
      for (const row of mkResult.recordset) {
        if (!rawGroups[row.MK001]) {
          rawGroups[row.MK001] = {
            label: `${row.MK001}（${row.pattern || row.MK001}）`,
            segments: []
          }
        }
        rawGroups[row.MK001].segments.push({
          seq: row.MK002,
          code: row.MK003,
          meaning: row.segMeaning || row.MK003,
          length: row.MK004 || 1,
          type: row.MK005 || 'input'
        })
      }
      // Compute serialLen from the system segment
      for (const grpCode of Object.keys(rawGroups)) {
        const sysSeg = rawGroups[grpCode].segments.find(s => s.type === 'system')
        rawGroups[grpCode].serialLen = sysSeg ? sysSeg.length : 5
      }
    } else {
      // Use fallback structure
      for (const [key, grp] of Object.entries(HARDCODED_GROUPS)) {
        rawGroups[key] = { ...grp }
      }
    }

    // Load options from INVMJ for all select segments
    const result = {}
    for (const [groupCode, groupDef] of Object.entries(rawGroups)) {
      const segments = []
      for (const seg of groupDef.segments) {
        if (seg.type === 'select') {
          let options = []
          try {
            const req = pool.request()
            req.input('mi001', sql.NVarChar(50), seg.code)
            const mjResult = await req.query(`
              SELECT MJ003 AS value, MJ004 AS label
              FROM dbo.INVMJ
              WHERE MJ001 = @mi001
              ORDER BY MJ002
            `)
            if (mjResult.recordset && mjResult.recordset.length > 0) {
              options = mjResult.recordset.map(r => ({
                value: String(r.value ?? ''),
                label: String(r.label ?? ''),
                active: true
              }))
            } else {
              options = (HARDCODED_OPTIONS[seg.code] || []).map(o => ({ ...o, active: true }))
            }
          } catch (_) {
            // INVMJ might be empty — fall back to hardcoded options
            options = (HARDCODED_OPTIONS[seg.code] || []).map(o => ({ ...o, active: true }))
          }
          segments.push({ ...seg, options })
        } else {
          segments.push({ ...seg, options: [] })
        }
      }
      result[groupCode] = { ...groupDef, segments }
    }

    return result
  } catch (error) {
    console.error('Error in partNumber.service.getAttrGroups:', error)
    throw error
  }
}

/**
 * POST /api/part-numbers/serial/next
 * Atomically increments INVMI.MI004 for the given group and returns the new serial string.
 * Uses ROWLOCK + UPDLOCK to prevent duplicate serials across concurrent requests.
 *
 * serialLen resolution order:
 *   1. INVMK system segment (DB-driven groups from AttributeGroupMaintenance)
 *   2. HARDCODED_GROUPS fallback
 * Counter row in INVMI is auto-created if missing (first-time use).
 */
export const getNextSerial = async (attrGroup) => {
  try {
    const pool = await getConnection()

    // ── Step 1: Resolve serialLen ──────────────────────────────────────────
    let serialLen = null

    // Try INVMK first (groups created via AttributeGroupMaintenance)
    try {
      const mkRes = await pool.request()
        .input('groupCode', sql.NVarChar(50), attrGroup)
        .query(`
          SELECT TOP 1 MK004 AS segLen
          FROM dbo.INVMK
          WHERE MK001 = @groupCode AND MK005 = 'system'
        `)
      if (mkRes.recordset && mkRes.recordset.length > 0) {
        serialLen = mkRes.recordset[0].segLen || 5
      }
    } catch (_) { /* INVMK may not exist yet, continue to fallback */ }

    // Fall back to hardcoded groups
    if (serialLen === null) {
      const groupDef = HARDCODED_GROUPS[attrGroup]
      if (!groupDef) throw new Error(`Unknown attribute group: ${attrGroup}`)
      serialLen = groupDef.serialLen
    }

    // ── Step 2: Ensure counter row exists in INVMI ─────────────────────────
    await pool.request()
      .input('groupCode', sql.NVarChar(50), attrGroup)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.INVMI WHERE MI001 = @groupCode)
          INSERT INTO dbo.INVMI (MI001, MI002, MI004)
          VALUES (@groupCode, @groupCode, 0)
      `)

    // ── Step 3: Atomic increment ───────────────────────────────────────────
    const updateResult = await pool.request()
      .input('groupCode', sql.NVarChar(50), attrGroup)
      .query(`
        UPDATE dbo.INVMI WITH (ROWLOCK, UPDLOCK)
        SET MI004 = ISNULL(TRY_CAST(MI004 AS INT), 0) + 1
        OUTPUT INSERTED.MI004 AS newCounter
        WHERE MI001 = @groupCode
      `)

    if (!updateResult.recordset || updateResult.recordset.length === 0) {
      throw new Error(`Failed to increment counter for attribute group: ${attrGroup}`)
    }

    const newCounter = updateResult.recordset[0].newCounter
    const serial = String(newCounter).padStart(serialLen, '0')
    return { serial, counter: newCounter }
  } catch (error) {
    console.error('Error in partNumber.service.getNextSerial:', error)
    throw error
  }
}

/**
 * POST /api/part-numbers
 * Records a newly created part number in INVML.
 */
export const createPartNumber = async (payload) => {
  try {
    const pool = await getConnection()
    const req = pool.request()
    req.input('partNo', sql.NVarChar(50), payload.partNo)
    req.input('attrGroup', sql.NVarChar(50), payload.attrGroup || '')
    req.input('factories', sql.NVarChar(200), Array.isArray(payload.factories) ? payload.factories.join(',') : (payload.factories || ''))
    req.input('partSpec', sql.NVarChar(2000), payload.partSpec || '')
    req.input('createdBy', sql.NVarChar(50), payload.createdBy || 'system')
    await req.query(`
      INSERT INTO dbo.CUST_PART_NO (PN001, PN002, PN003, PN004, PN005)
      VALUES (@partNo, @attrGroup, @factories, @partSpec, @createdBy)
    `)
    return { partNo: payload.partNo, createdAt: new Date().toISOString() }
  } catch (error) {
    console.error('Error in partNumber.service.createPartNumber:', error)
    throw error
  }
}

/**
 * GET /api/part-numbers/bom-list
 * Returns distinct BOM entries (soNr, prodNr, prodName) for the copy-mode dropdown.
 */
export const getBOMList = async (keyword = '') => {
  try {
    const pool = await getConnection()
    const req = pool.request()
    const kw = typeof keyword === 'string' ? keyword.trim() : ''
    let query = `
      SELECT DISTINCT TOP 50
        b.soNr, b.prodNr, so.prodName
      FROM dbo.bom b
      LEFT JOIN dbo.salesOrder so ON b.soNr = so.soNr AND b.soItNr = so.soItNr
      WHERE b.prodNr IS NOT NULL
    `
    if (kw) {
      req.input('kw', sql.NVarChar(100), `%${kw}%`)
      query += ` AND (b.prodNr LIKE @kw OR b.soNr LIKE @kw OR so.prodName LIKE @kw)`
    }
    query += ' ORDER BY b.prodNr'
    const result = await req.query(query)
    return (result.recordset || []).map(r => ({
      value: r.prodNr,
      label: `${r.soNr || ''} - ${r.prodNr} ${r.prodName ? '(' + r.prodName + ')' : ''}`.trim()
    }))
  } catch (error) {
    console.error('Error in partNumber.service.getBOMList:', error)
    throw error
  }
}

export default { getAttrGroups, getNextSerial, createPartNumber, getBOMList }
