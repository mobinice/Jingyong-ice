import { getConnection } from '../db/connection.js'
import sql from 'mssql'

export const getAll = async () => {
  try {
    const pool = await getConnection()
    const result = await pool.request().query('SELECT * FROM dbo.salesOrder ORDER BY soNr, soItNr')
    return result.recordset
  } catch (error) {
    console.error('Error in salesOrder.service.getAll:', error)
    throw error
  }
}

export const getByKey = async (soNr, soItNr) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('soNr', sql.VarChar(10), soNr)
    request.input('soItNr', sql.VarChar(6), soItNr)
    const result = await request.query('SELECT * FROM dbo.salesOrder WHERE soNr = @soNr AND soItNr = @soItNr')
    return result.recordset[0] || null
  } catch (error) {
    console.error('Error in salesOrder.service.getByKey:', error)
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
    request.input('prodName', sql.NVarChar(40), data.prodName || null)
    request.input('prodSpec', sql.NVarChar(255), data.prodSpec || null)
    request.input('prodType', sql.VarChar(50), data.prodType || null)
    request.input('prodTyName', sql.NVarChar(100), data.prodTyName || null)
    request.input('custInit', sql.Char(2), data.custInit || null)
    request.input('custNr', sql.VarChar(10), data.custNr || null)
    request.input('custProdNr', sql.VarChar(100), data.custProdNr || null)
    request.input('custPoNr', sql.VarChar(50), data.custPoNr || null)

    const result = await request.query(`
      INSERT INTO dbo.salesOrder (soNr, soItNr, prodNr, prodName, prodSpec, prodType, prodTyName, custInit, custNr, custProdNr, custPoNr)
      OUTPUT INSERTED.*
      VALUES (@soNr, @soItNr, @prodNr, @prodName, @prodSpec, @prodType, @prodTyName, @custInit, @custNr, @custProdNr, @custPoNr)
    `)
    return result.recordset[0]
  } catch (error) {
    console.error('Error in salesOrder.service.create:', error)
    throw error
  }
}

export const update = async (soNr, soItNr, data) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('soNr', sql.VarChar(10), soNr)
    request.input('soItNr', sql.VarChar(6), soItNr)
    request.input('prodNr', sql.VarChar(40), data.prodNr || null)
    request.input('prodName', sql.NVarChar(40), data.prodName || null)
    request.input('prodSpec', sql.NVarChar(255), data.prodSpec || null)
    request.input('prodType', sql.VarChar(50), data.prodType || null)
    request.input('prodTyName', sql.NVarChar(100), data.prodTyName || null)
    request.input('custInit', sql.Char(2), data.custInit || null)
    request.input('custNr', sql.VarChar(10), data.custNr || null)
    request.input('custProdNr', sql.VarChar(100), data.custProdNr || null)
    request.input('custPoNr', sql.VarChar(50), data.custPoNr || null)

    const result = await request.query(`
      UPDATE dbo.salesOrder
      SET prodNr = @prodNr,
          prodName = @prodName,
          prodSpec = @prodSpec,
          prodType = @prodType,
          prodTyName = @prodTyName,
          custInit = @custInit,
          custNr = @custNr,
          custProdNr = @custProdNr,
          custPoNr = @custPoNr
      OUTPUT INSERTED.*
      WHERE soNr = @soNr AND soItNr = @soItNr
    `)
    return result.recordset[0] || null
  } catch (error) {
    console.error('Error in salesOrder.service.update:', error)
    throw error
  }
}

export const remove = async (soNr, soItNr) => {
  try {
    const pool = await getConnection()
    const request = pool.request()
    request.input('soNr', sql.VarChar(10), soNr)
    request.input('soItNr', sql.VarChar(6), soItNr)
    const result = await request.query('DELETE FROM dbo.salesOrder WHERE soNr = @soNr AND soItNr = @soItNr')
    return result.rowsAffected[0] > 0
  } catch (error) {
    console.error('Error in salesOrder.service.remove:', error)
    throw error
  }
}

export default {
  getAll,
  getByKey,
  create,
  update,
  remove
}
