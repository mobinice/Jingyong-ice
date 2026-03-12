const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  database: {
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true
    }
  }
}

export default config
