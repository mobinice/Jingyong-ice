import config from './index.js'

const dbConfig = {
  server: config.database.server,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  options: {
    encrypt: config.database.options.encrypt,
    trustServerCertificate: config.database.options.trustServerCertificate
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

export default dbConfig
