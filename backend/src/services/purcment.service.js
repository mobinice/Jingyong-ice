import { getConnection } from '../db/connection.js'
import sql from 'mssql'

export const getAll = async () => {
  try {
    const pool = await getConnection()
    const result = await pool.request().query('SELECT * FROM dbo.Purcment ORDER BY BSART, EBELN, EBELP')
    return result.recordset
  } catch (error) {
    console.error('Error in purcment.service.getAll:', error)
    throw error
  }
}

export const getByKey = async (BSART, EBELN, EBELP) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('BSART', sql.NVarChar(4), BSART)
    request.input('EBELN', sql.NVarChar(10), EBELN)
    request.input('EBELP', sql.NVarChar(9), EBELP)
    const result = await request.query(
      'SELECT * FROM dbo.Purcment WHERE BSART = @BSART AND EBELN = @EBELN AND EBELP = @EBELP'
    )
    return result.recordset[0] || null
  } catch (error) {
    console.error('Error in purcment.service.getByKey:', error)
    throw error
  }
}

export const query = async (filters = {}) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    const conditions = []
    if (filters.BSART != null && filters.BSART !== '') {
      request.input('BSART', sql.NVarChar(4), filters.BSART)
      conditions.push('BSART = @BSART')
    }
    if (filters.EBELN != null && filters.EBELN !== '') {
      request.input('EBELN', sql.NVarChar(10), filters.EBELN)
      conditions.push('EBELN = @EBELN')
    }
    if (filters.EINDT_from != null && filters.EINDT_from !== '') {
      request.input('EINDT_from', sql.NVarChar(8), filters.EINDT_from)
      conditions.push('EINDT >= @EINDT_from')
    }
    if (filters.EINDT_to != null && filters.EINDT_to !== '') {
      request.input('EINDT_to', sql.NVarChar(8), filters.EINDT_to)
      conditions.push('EINDT <= @EINDT_to')
    }
    if (filters.LIFNR != null && filters.LIFNR !== '') {
      request.input('LIFNR', sql.NVarChar(10), filters.LIFNR)
      conditions.push('LIFNR = @LIFNR')
    }
    if (filters.MATNR != null && filters.MATNR !== '') {
      request.input('MATNR', sql.NVarChar(40), filters.MATNR)
      conditions.push('MATNR = @MATNR')
    }
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
    const sqlText = `SELECT * FROM dbo.Purcment ${whereClause} ORDER BY BSART, EBELN, EBELP`
    const result = await request.query(sqlText)
    return result.recordset
  } catch (error) {
    console.error('Error in purcment.service.query:', error)
    throw error
  }
}

export const create = async (data) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('BSART', sql.NVarChar(4), data.BSART)
    request.input('EBELN', sql.NVarChar(10), data.EBELN)
    request.input('EBELP', sql.NVarChar(9), data.EBELP)
    request.input('EBELN_COMP', sql.NVarChar(15), data.EBELN_COMP ?? null)
    request.input('MATNR', sql.NVarChar(40), data.MATNR ?? null)
    request.input('TXZ01', sql.NVarChar(40), data.TXZ01 ?? null)
    request.input('PO_F03', sql.NVarChar(400), data.PO_F03 ?? null)
    request.input('EINDT', sql.NVarChar(8), data.EINDT ?? null)
    request.input('HANDOVERDATE', sql.NVarChar(8), data.HANDOVERDATE ?? null)
    request.input('MENGE', sql.Decimal(13, 3), data.MENGE ?? null)
    request.input('MEINS', sql.NVarChar(3), data.MEINS ?? null)
    request.input('DELIVERED', sql.Decimal(13, 3), data.DELIVERED ?? null)
    request.input('UNDELIVERED', sql.Decimal(13, 3), data.UNDELIVERED ?? null)
    request.input('LIFNR', sql.NVarChar(10), data.LIFNR ?? null)
    request.input('SORTL', sql.NVarChar(10), data.SORTL ?? null)
    request.input('WERKS', sql.NVarChar(4), data.WERKS ?? null)
    request.input('WERKS_REF', sql.NVarChar(4), data.WERKS_REF ?? null)
    request.input('BEDNR', sql.NVarChar(10), data.BEDNR ?? null)
    request.input('FRGKE', sql.NVarChar(1), data.FRGKE ?? null)
    request.input('CreateDate', sql.NVarChar(8), data.CreateDate ?? null)
    request.input('CreateTime', sql.NVarChar(8), data.CreateTime ?? null)
    request.input('Creator', sql.NVarChar(10), data.Creator ?? null)
    request.input('ModifyDate', sql.NVarChar(8), data.ModifyDate ?? null)
    request.input('ModifyTime', sql.NVarChar(8), data.ModifyTime ?? null)
    request.input('Modifier', sql.NVarChar(10), data.Modifier ?? null)

    const result = await request.query(`
      INSERT INTO dbo.Purcment (
        BSART, EBELN, EBELP, EBELN_COMP, MATNR, TXZ01, PO_F03, EINDT, HANDOVERDATE,
        MENGE, MEINS, DELIVERED, UNDELIVERED, LIFNR, SORTL, WERKS, WERKS_REF, BEDNR, FRGKE,
        CreateDate, CreateTime, Creator, ModifyDate, ModifyTime, Modifier
      )
      OUTPUT INSERTED.*
      VALUES (
        @BSART, @EBELN, @EBELP, @EBELN_COMP, @MATNR, @TXZ01, @PO_F03, @EINDT, @HANDOVERDATE,
        @MENGE, @MEINS, @DELIVERED, @UNDELIVERED, @LIFNR, @SORTL, @WERKS, @WERKS_REF, @BEDNR, @FRGKE,
        @CreateDate, @CreateTime, @Creator, @ModifyDate, @ModifyTime, @Modifier
      )
    `)
    return result.recordset[0]
  } catch (error) {
    console.error('Error in purcment.service.create:', error)
    throw error
  }
}

export const update = async (BSART, EBELN, EBELP, data) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('BSART', sql.NVarChar(4), BSART)
    request.input('EBELN', sql.NVarChar(10), EBELN)
    request.input('EBELP', sql.NVarChar(9), EBELP)
    request.input('EBELN_COMP', sql.NVarChar(15), data.EBELN_COMP ?? null)
    request.input('MATNR', sql.NVarChar(40), data.MATNR ?? null)
    request.input('TXZ01', sql.NVarChar(40), data.TXZ01 ?? null)
    request.input('PO_F03', sql.NVarChar(400), data.PO_F03 ?? null)
    request.input('EINDT', sql.NVarChar(8), data.EINDT ?? null)
    request.input('HANDOVERDATE', sql.NVarChar(8), data.HANDOVERDATE ?? null)
    request.input('MENGE', sql.Decimal(13, 3), data.MENGE ?? null)
    request.input('MEINS', sql.NVarChar(3), data.MEINS ?? null)
    request.input('DELIVERED', sql.Decimal(13, 3), data.DELIVERED ?? null)
    request.input('UNDELIVERED', sql.Decimal(13, 3), data.UNDELIVERED ?? null)
    request.input('LIFNR', sql.NVarChar(10), data.LIFNR ?? null)
    request.input('SORTL', sql.NVarChar(10), data.SORTL ?? null)
    request.input('WERKS', sql.NVarChar(4), data.WERKS ?? null)
    request.input('WERKS_REF', sql.NVarChar(4), data.WERKS_REF ?? null)
    request.input('BEDNR', sql.NVarChar(10), data.BEDNR ?? null)
    request.input('FRGKE', sql.NVarChar(1), data.FRGKE ?? null)
    request.input('ModifyDate', sql.NVarChar(8), data.ModifyDate ?? null)
    request.input('ModifyTime', sql.NVarChar(8), data.ModifyTime ?? null)
    request.input('Modifier', sql.NVarChar(10), data.Modifier ?? null)

    const result = await request.query(`
      UPDATE dbo.Purcment
      SET EBELN_COMP = @EBELN_COMP, MATNR = @MATNR, TXZ01 = @TXZ01, PO_F03 = @PO_F03,
          EINDT = @EINDT, HANDOVERDATE = @HANDOVERDATE, MENGE = @MENGE, MEINS = @MEINS,
          DELIVERED = @DELIVERED, UNDELIVERED = @UNDELIVERED, LIFNR = @LIFNR, SORTL = @SORTL,
          WERKS = @WERKS, WERKS_REF = @WERKS_REF, BEDNR = @BEDNR, FRGKE = @FRGKE,
          ModifyDate = @ModifyDate, ModifyTime = @ModifyTime, Modifier = @Modifier
      OUTPUT INSERTED.*
      WHERE BSART = @BSART AND EBELN = @EBELN AND EBELP = @EBELP
    `)
    return result.recordset[0] || null
  } catch (error) {
    console.error('Error in purcment.service.update:', error)
    throw error
  }
}

export const remove = async (BSART, EBELN, EBELP) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('BSART', sql.NVarChar(4), BSART)
    request.input('EBELN', sql.NVarChar(10), EBELN)
    request.input('EBELP', sql.NVarChar(9), EBELP)
    const result = await request.query(
      'DELETE FROM dbo.Purcment WHERE BSART = @BSART AND EBELN = @EBELN AND EBELP = @EBELP'
    )
    return result.rowsAffected[0] > 0
  } catch (error) {
    console.error('Error in purcment.service.remove:', error)
    throw error
  }
}

export default {
  getAll,
  getByKey,
  query,
  create,
  update,
  remove
}
