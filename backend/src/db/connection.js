import sql from 'mssql'
import dbConfig from '../config/database.js'

let pool = null

export const getConnection = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig)
      console.log('✅ Database connected successfully')
    }
    return pool
  } catch (error) {
    console.error('❌ Database connection error:', error)
    throw error
  }
}

export const closeConnection = async () => {
  try {
    if (pool) {
      await pool.close()
      pool = null
      console.log('Database connection closed')
    }
  } catch (error) {
    console.error('Error closing database connection:', error)
    throw error
  }
}

export default { getConnection, closeConnection }
