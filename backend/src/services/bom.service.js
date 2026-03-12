import { getConnection } from '../db/connection.js'
import sql from 'mssql'

export const getAll = async () => {
  try {
    const pool = await getConnection()
    const result = await pool.request().query('SELECT * FROM dbo.bom ORDER BY id')
    return result.recordset
  } catch (error) {
    console.error('Error in bom.service.getAll:', error)
    throw error
  }
}

export const getById = async (id) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('id', sql.Int, id)
    const result = await request.query('SELECT * FROM dbo.bom WHERE id = @id')
    return result.recordset[0] || null
  } catch (error) {
    console.error('Error in bom.service.getById:', error)
    throw error
  }
}

export const create = async (data) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('soNr', sql.VarChar(10), data.soNr)
    request.input('soItNr', sql.VarChar(6), data.soItNr)
    request.input('prodNr', sql.VarChar(40), data.prodNr || null)
    request.input('matnr', sql.VarChar(40), data.matnr || null)
    request.input('matnrSpec', sql.NVarChar(255), data.matnrSpec || null)
    request.input('usageQnty', sql.Decimal(13, 3), data.usageQnty || null)
    request.input('unit', sql.VarChar(6), data.unit || null)
    request.input('custMatnr', sql.VarChar(100), data.custMatnr || null)
    request.input('vendor', sql.VarChar(10), data.vendor || null)
    request.input('vendorName', sql.NVarChar(40), data.vendorName || null)

    const result = await request.query(`
      INSERT INTO dbo.bom (soNr, soItNr, prodNr, matnr, matnrSpec, usageQnty, unit, custMatnr, vendor, vendorName)
      OUTPUT INSERTED.*
      VALUES (@soNr, @soItNr, @prodNr, @matnr, @matnrSpec, @usageQnty, @unit, @custMatnr, @vendor, @vendorName)
    `)
    return result.recordset[0]
  } catch (error) {
    console.error('Error in bom.service.create:', error)
    throw error
  }
}

export const update = async (id, data) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('id', sql.Int, id)
    request.input('soNr', sql.VarChar(10), data.soNr)
    request.input('soItNr', sql.VarChar(6), data.soItNr)
    request.input('prodNr', sql.VarChar(40), data.prodNr || null)
    request.input('matnr', sql.VarChar(40), data.matnr || null)
    request.input('matnrSpec', sql.NVarChar(255), data.matnrSpec || null)
    request.input('usageQnty', sql.Decimal(13, 3), data.usageQnty || null)
    request.input('unit', sql.VarChar(6), data.unit || null)
    request.input('custMatnr', sql.VarChar(100), data.custMatnr || null)
    request.input('vendor', sql.VarChar(10), data.vendor || null)
    request.input('vendorName', sql.NVarChar(40), data.vendorName || null)

    const result = await request.query(`
      UPDATE dbo.bom
      SET soNr = @soNr,
          soItNr = @soItNr,
          prodNr = @prodNr,
          matnr = @matnr,
          matnrSpec = @matnrSpec,
          usageQnty = @usageQnty,
          unit = @unit,
          custMatnr = @custMatnr,
          vendor = @vendor,
          vendorName = @vendorName
      OUTPUT INSERTED.*
      WHERE id = @id
    `)
    return result.recordset[0] || null
  } catch (error) {
    console.error('Error in bom.service.update:', error)
    throw error
  }
}

export const remove = async (id) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('id', sql.Int, id)
    const result = await request.query('DELETE FROM dbo.bom WHERE id = @id')
    return result.rowsAffected[0] > 0
  } catch (error) {
    console.error('Error in bom.service.remove:', error)
    throw error
  }
}

export const query = async (filters) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    
    // 構建動態 SQL 查詢，JOIN salesOrder 表以取得產品資訊
    let query = `
      SELECT 
        b.id,
        b.soNr,
        b.soItNr,
        b.prodNr,
        b.matnr,
        b.matnrSpec,
        b.usageQnty,
        b.unit,
        b.custMatnr,
        b.vendor,
        b.vendorName,
        so.prodName,
        so.prodSpec,
        so.custProdNr
      FROM dbo.bom b
      LEFT JOIN dbo.salesOrder so ON b.soNr = so.soNr AND b.soItNr = so.soItNr
      WHERE 1=1
    `
    
    // 動態添加查詢條件
    if (filters.prodNr) {
      request.input('prodNr', sql.VarChar(40), `%${filters.prodNr}%`)
      query += ' AND b.prodNr LIKE @prodNr'
    }
    
    if (filters.soNr) {
      request.input('soNr', sql.VarChar(50), `%${filters.soNr}%`)
      query += ' AND b.soNr LIKE @soNr'
    }
    
    if (filters.custProdNr) {
      request.input('custProdNr', sql.VarChar(100), `%${filters.custProdNr}%`)
      query += ' AND so.custProdNr LIKE @custProdNr'
    }
    
    if (filters.matnr) {
      request.input('matnr', sql.VarChar(40), `%${filters.matnr}%`)
      query += ' AND b.matnr LIKE @matnr'
    }
    
    if (filters.custMatnr) {
      request.input('custMatnr', sql.VarChar(100), `%${filters.custMatnr}%`)
      query += ' AND b.custMatnr LIKE @custMatnr'
    }
    
    if (filters.prodName) {
      request.input('prodName', sql.NVarChar(40), `%${filters.prodName}%`)
      query += ' AND so.prodName LIKE @prodName'
    }
    
    query += ' ORDER BY b.prodNr, b.id'
    
    const result = await request.query(query)
    return result.recordset
  } catch (error) {
    console.error('Error in bom.service.query:', error)
    throw error
  }
}

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  query
}
