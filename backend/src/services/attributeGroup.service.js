import { getConnection } from '../db/connection.js'
import sql from 'mssql'

const ATTR_CODES = [
  { code: 'IDENT', definition: '識別碼' },
  { code: 'PART',  definition: '品類碼' },
  { code: 'CUST',  definition: '客戶碼' },
  { code: 'BRAND', definition: '品牌碼' },
  { code: 'STYLE', definition: '型式碼' },
  { code: 'GRADE', definition: '等級碼' },
]

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

const HARDCODED_GROUPS = {
  'GRP-A': {
    label: 'GRP-A（1-2-2-1-5）',
    serialLen: 5,
    segments: [
      { seq: 1, segmentAttrCode: 'IDENT',  length: 1, type: 'select' },
      { seq: 2, segmentAttrCode: 'PART',   length: 2, type: 'select' },
      { seq: 3, segmentAttrCode: 'CUST',   length: 2, type: 'select' },
      { seq: 4, segmentAttrCode: 'RSV',    length: 1, type: 'input'  },
      { seq: 5, segmentAttrCode: 'SERIAL', length: 5, type: 'system' },
    ]
  },
  'GRP-B': {
    label: 'GRP-B（2-2-1-1-4）',
    serialLen: 4,
    segments: [
      { seq: 1, segmentAttrCode: 'BRAND',  length: 2, type: 'select' },
      { seq: 2, segmentAttrCode: 'STYLE',  length: 2, type: 'select' },
      { seq: 3, segmentAttrCode: 'GRADE',  length: 1, type: 'select' },
      { seq: 4, segmentAttrCode: 'RSV',    length: 1, type: 'input'  },
      { seq: 5, segmentAttrCode: 'SERIAL', length: 4, type: 'system' },
    ]
  }
}

/**
 * 屬性組規則列表：僅使用 dbo.INVMI（DB 現有表為 INVMI, INVMJ, INVMK, INVML）。
 * 回傳欄位：code(MI001), definition(MI002), style(MI003), serialNumber(MI004), sapModel, status。
 */
export const getRulesList = async (keyword = '') => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    const keywordParam = typeof keyword === 'string' ? keyword.trim() : ''
    const hasKeyword = keywordParam.length > 0
    if (hasKeyword) {
      request.input('keyword', sql.NVarChar(100), `%${keywordParam}%`)
    }

    let query = `
      SELECT
        i.MI001 AS code,
        i.MI002 AS definition,
        i.MI003 AS style,
        i.MI004 AS serialNumber,
        N'ALL' AS sapModel,
        N'啟用' AS status
      FROM dbo.INVMI i
      WHERE EXISTS (SELECT 1 FROM dbo.INVMK WHERE MK001 = i.MI001)
    `
    if (hasKeyword) {
      query += ' AND (i.MI001 LIKE @keyword OR i.MI002 LIKE @keyword)'
    }
    query += ' ORDER BY i.MI001'

    const result = await request.query(query)
    const rows = result.recordset || []

    // INVMK 為空（初始狀態）→ fallback 到 HARDCODED_GROUPS，與 getAttrGroups 一致
    if (rows.length === 0 && !hasKeyword) {
      return Object.entries(HARDCODED_GROUPS).map(([code, g]) => ({
        code,
        definition: g.label,
        style: g.segments.map(s => s.length).join('-'),
        serialNumber: g.serialLen,
        sapModel: 'ALL',
        status: '啟用'
      }))
    }

    return rows.map((r) => ({
      code: r.code,
      definition: r.definition,
      style: r.style,
      serialNumber: r.serialNumber,
      sapModel: r.sapModel ?? 'ALL',
      status: r.status ?? '啟用'
    }))
  } catch (error) {
    console.error('Error in attributeGroup.service.getRulesList:', error)
    throw error
  }
}

/**
 * 依 code（MI001 或 MI002）取得單筆規則。
 */
export const getRuleByCode = async (code) => {
  try {
    const pool = await getConnection()

    // Load header from INVMI
    const headerResult = await pool.request()
      .input('code', sql.NVarChar(50), code)
      .query(`
        SELECT i.MI001 AS code, i.MI002 AS definition, i.MI003 AS style,
               i.MI004 AS serialNumber, N'ALL' AS sapModel, N'啟用' AS status
        FROM dbo.INVMI i
        WHERE i.MI001 = @code OR i.MI002 = @code
      `)
    const row = headerResult.recordset?.[0] || null

    // Load segments from INVMK
    const segsResult = await pool.request()
      .input('code', sql.NVarChar(50), code)
      .query(`
        SELECT MK002 AS seq, MK003 AS segCode, MK004 AS length, MK005 AS type
        FROM dbo.INVMK WHERE MK001 = @code ORDER BY MK002
      `)
    let segments = (segsResult.recordset || []).map(s => ({
      seq: s.seq,
      segmentAttrCode: s.segCode || '',
      length: s.length || 1,
      type: s.type || 'input'
    }))

    // Fallback to hardcoded segments if INVMK is empty
    if (!segments.length && HARDCODED_GROUPS[code]) {
      segments = HARDCODED_GROUPS[code].segments
    }

    // If no header in INVMI, build from hardcoded
    if (!row) {
      const hg = HARDCODED_GROUPS[code]
      if (!hg) return null
      return { code, definition: hg.label, style: hg.segments.map(s => s.length).join('-'), serialNumber: hg.serialLen, sapModel: 'ALL', status: '啟用', segments }
    }

    return {
      code: row.code,
      definition: row.definition,
      style: row.style,
      serialNumber: row.serialNumber,
      sapModel: row.sapModel ?? 'ALL',
      status: row.status ?? '啟用',
      segments
    }
  } catch (error) {
    console.error('Error in attributeGroup.service.getRuleByCode:', error)
    throw error
  }
}

/**
 * 屬性代碼清單：純 DB 驅動，直接查 INVMI，回傳現有資料。
 */
export const getDictionaryList = async (lang = 'zh-TW') => {
  try {
    const pool = await getConnection()
    const result = await pool.request().query(`
      SELECT
        i.MI001 AS code,
        i.MI002 AS definition,
        ISNULL(TRY_CAST(i.MI004 AS INT), 0) AS refs
      FROM dbo.INVMI i
      WHERE NOT EXISTS (SELECT 1 FROM dbo.INVMK WHERE MK001 = i.MI001)
      ORDER BY i.MI001
    `)
    const rows = result.recordset || []
    console.log('[getDictionaryList] rows from DB:', rows.length, rows.map(r => r.code))
    return rows.map(r => ({ code: r.code.trim(), definition: r.definition, refs: r.refs ?? 0 }))
  } catch (error) {
    console.error('getDictionaryList failed:', error.message)
    return []
  }
}

/**
 * 依 code（MI001 或 MI002）取得詳情；屬性值由 dbo.INVMJ 依 MJ001 = MI001 查詢（value=MJ003, label=MJ004）。
 */
export const getDictionaryByCode = async (code) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('code', sql.NVarChar(50), code)
    const headerResult = await request.query(`
      SELECT
        i.MI001 AS code,
        i.MI002 AS definition,
        ISNULL(CAST(i.MI004 AS INT), 0) AS refs
      FROM dbo.INVMI i
      WHERE i.MI001 = @code OR i.MI002 = @code
    `)
    const header = headerResult.recordset?.[0] || null
    if (!header) return null

    const mi001Val = header.code
    let values = []
    try {
      const req2 = pool.request()
      req2.input('mi001', sql.NVarChar(20), mi001Val)
      const mjResult = await req2.query(`
        SELECT MJ003 AS value, MJ004 AS label
        FROM dbo.INVMJ
        WHERE MJ001 = @mi001
        ORDER BY MJ002
      `)
      if (mjResult.recordset && mjResult.recordset.length > 0) {
        values = mjResult.recordset.map((r) => ({
          value: String(r.value ?? ''),
          label: String(r.label ?? '')
        }))
      } else {
        // Fallback to hardcoded options (same as NewPartNumber uses)
        values = (HARDCODED_OPTIONS[mi001Val] || []).map(o => ({ ...o }))
      }
    } catch (_) {
      // INVMJ 可能不存在或結構不同，使用預設值
      values = (HARDCODED_OPTIONS[mi001Val] || []).map(o => ({ ...o }))
    }

    return {
      code: header.code,
      definition: header.definition,
      refs: header.refs ?? 0,
      values
    }
  } catch (error) {
    console.error('Error in attributeGroup.service.getDictionaryByCode:', error)
    throw error
  }
}

export const createRule = async (data) => {
  const pool = await getConnection()
  const transaction = new sql.Transaction(pool)
  try {
    await transaction.begin()
    const pattern = (data.segments || []).map(s => s.length).join('-')
    const req1 = new sql.Request(transaction)
    req1.input('code', sql.NVarChar(50), data.code)
    req1.input('definition', sql.NVarChar(200), data.definition || '')
    req1.input('pattern', sql.NVarChar(100), pattern)
    await req1.query(`INSERT INTO dbo.INVMI (MI001, MI002, MI003, MI004) VALUES (@code, @definition, @pattern, 0)`)
    for (const seg of (data.segments || [])) {
      const req2 = new sql.Request(transaction)
      req2.input('groupCode', sql.NVarChar(50), data.code)
      req2.input('seq', sql.Int, seg.seq)
      req2.input('segCode', sql.NVarChar(50), seg.segmentAttrCode || '')
      req2.input('len', sql.Int, seg.length || 1)
      req2.input('stype', sql.NVarChar(20), seg.type || 'input')
      await req2.query(`INSERT INTO dbo.INVMK (MK001, MK002, MK003, MK004, MK005) VALUES (@groupCode, @seq, @segCode, @len, @stype)`)
    }
    await transaction.commit()
    return { code: data.code }
  } catch (err) {
    await transaction.rollback()
    console.error('Error in attributeGroup.service.createRule:', err)
    throw err
  }
}

export const updateRule = async (code, data) => {
  const pool = await getConnection()
  const transaction = new sql.Transaction(pool)
  try {
    await transaction.begin()
    const pattern = (data.segments || []).map(s => s.length).join('-')
    const req1 = new sql.Request(transaction)
    req1.input('code', sql.NVarChar(50), code)
    req1.input('definition', sql.NVarChar(200), data.definition || '')
    req1.input('pattern', sql.NVarChar(100), pattern)
    await req1.query(`UPDATE dbo.INVMI SET MI002=@definition, MI003=@pattern WHERE MI001=@code`)
    const req2 = new sql.Request(transaction)
    req2.input('code', sql.NVarChar(50), code)
    await req2.query(`DELETE FROM dbo.INVMK WHERE MK001=@code`)
    for (const seg of (data.segments || [])) {
      const req3 = new sql.Request(transaction)
      req3.input('groupCode', sql.NVarChar(50), code)
      req3.input('seq', sql.Int, seg.seq)
      req3.input('segCode', sql.NVarChar(50), seg.segmentAttrCode || '')
      req3.input('len', sql.Int, seg.length || 1)
      req3.input('stype', sql.NVarChar(20), seg.type || 'input')
      await req3.query(`INSERT INTO dbo.INVMK (MK001, MK002, MK003, MK004, MK005) VALUES (@groupCode, @seq, @segCode, @len, @stype)`)
    }
    await transaction.commit()
    return { code }
  } catch (err) {
    await transaction.rollback()
    console.error('Error in attributeGroup.service.updateRule:', err)
    throw err
  }
}

export const deleteRule = async (code) => {
  const pool = await getConnection()
  const checkReq = pool.request()
  checkReq.input('code', sql.NVarChar(50), code)
  const check = await checkReq.query(`SELECT CAST(MI004 AS INT) AS counter FROM dbo.INVMI WHERE MI001=@code`)
  const row = check.recordset?.[0]
  if (!row) throw new Error(`Rule ${code} not found`)
  if ((row.counter || 0) > 0) throw new Error(`Cannot delete: serial counter is ${row.counter} (rule has been used)`)
  const transaction = new sql.Transaction(pool)
  try {
    await transaction.begin()
    const req2 = new sql.Request(transaction)
    req2.input('code', sql.NVarChar(50), code)
    await req2.query(`DELETE FROM dbo.INVMK WHERE MK001=@code`)
    const req3 = new sql.Request(transaction)
    req3.input('code', sql.NVarChar(50), code)
    await req3.query(`DELETE FROM dbo.INVMI WHERE MI001=@code`)
    await transaction.commit()
    return { code }
  } catch (err) {
    await transaction.rollback()
    console.error('Error in attributeGroup.service.deleteRule:', err)
    throw err
  }
}

export const createDictionaryCode = async (data) => {
  try {
    const pool = await getConnection()
    const req = pool.request()
    req.input('code', sql.NVarChar(50), data.code)
    req.input('definition', sql.NVarChar(200), data.definitionZh || data.definition || '')
    await req.query(`INSERT INTO dbo.INVMI (MI001, MI002, MI003, MI004) VALUES (@code, @definition, N'', 0)`)
    return { code: data.code }
  } catch (err) {
    console.error('Error in attributeGroup.service.createDictionaryCode:', err)
    throw err
  }
}

export const updateDictionaryCode = async (code, data) => {
  try {
    const pool = await getConnection()
    const req = pool.request()
    req.input('code', sql.NVarChar(50), code)
    req.input('definition', sql.NVarChar(200), data.definitionZh || data.definition || '')
    await req.query(`UPDATE dbo.INVMI SET MI002=@definition WHERE MI001=@code`)
    return { code }
  } catch (err) {
    console.error('Error in attributeGroup.service.updateDictionaryCode:', err)
    throw err
  }
}

export const deleteDictionaryCode = async (code) => {
  const pool = await getConnection()
  const checkReq = pool.request()
  checkReq.input('code', sql.NVarChar(50), code)
  const checkResult = await checkReq.query(`SELECT COUNT(*) AS cnt FROM dbo.INVMK WHERE MK003=@code`)
  const cnt = checkResult.recordset?.[0]?.cnt || 0
  if (cnt > 0) throw new Error(`Cannot delete: code ${code} is referenced by ${cnt} attribute group segment(s)`)
  const transaction = new sql.Transaction(pool)
  try {
    await transaction.begin()
    const req2 = new sql.Request(transaction)
    req2.input('code', sql.NVarChar(50), code)
    await req2.query(`DELETE FROM dbo.INVMJ WHERE MJ001=@code`)
    const req3 = new sql.Request(transaction)
    req3.input('code', sql.NVarChar(50), code)
    await req3.query(`DELETE FROM dbo.INVMI WHERE MI001=@code`)
    await transaction.commit()
    return { code }
  } catch (err) {
    await transaction.rollback()
    console.error('Error in attributeGroup.service.deleteDictionaryCode:', err)
    throw err
  }
}

export const createOptionValue = async (code, data) => {
  try {
    const pool = await getConnection()
    const seqReq = pool.request()
    seqReq.input('code', sql.NVarChar(50), code)
    const seqResult = await seqReq.query(`SELECT ISNULL(MAX(MJ002), 0) + 1 AS nextSeq FROM dbo.INVMJ WHERE MJ001=@code`)
    const nextSeq = seqResult.recordset?.[0]?.nextSeq || 1
    const req = pool.request()
    req.input('code', sql.NVarChar(50), code)
    req.input('seq', sql.Int, nextSeq)
    req.input('value', sql.NVarChar(50), data.value)
    req.input('label', sql.NVarChar(200), data.label || '')
    await req.query(`INSERT INTO dbo.INVMJ (MJ001, MJ002, MJ003, MJ004) VALUES (@code, @seq, @value, @label)`)
    return { code, value: data.value }
  } catch (err) {
    console.error('Error in attributeGroup.service.createOptionValue:', err)
    throw err
  }
}

export const updateOptionValue = async (code, value, data) => {
  try {
    const pool = await getConnection()
    const req = pool.request()
    req.input('code', sql.NVarChar(50), code)
    req.input('value', sql.NVarChar(50), value)
    req.input('label', sql.NVarChar(200), data.label || '')
    await req.query(`UPDATE dbo.INVMJ SET MJ004=@label WHERE MJ001=@code AND MJ003=@value`)
    return { code, value }
  } catch (err) {
    console.error('Error in attributeGroup.service.updateOptionValue:', err)
    throw err
  }
}

export const deleteOptionValue = async (code, value) => {
  try {
    const pool = await getConnection()
    const req = pool.request()
    req.input('code', sql.NVarChar(50), code)
    req.input('value', sql.NVarChar(50), value)
    await req.query(`DELETE FROM dbo.INVMJ WHERE MJ001=@code AND MJ003=@value`)
    return { code, value }
  } catch (err) {
    console.error('Error in attributeGroup.service.deleteOptionValue:', err)
    throw err
  }
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
