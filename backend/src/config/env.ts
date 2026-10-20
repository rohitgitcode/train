import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

interface Config {
  PORT: number
  NODE_ENV: string
  DB_HOST: string
  DB_PORT: number
  DB_USER: string
  DB_PASSWORD: string
  DB_NAME: string
  JWT_SECRET: string
 JWT_EXPIRES_IN: string
}

function getEnvVariable(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue
  if (!value) {
    throw new Error(`[FATAL] Missing required environment variable: ${key}`)
  }
  return value
}

export const env: Config = {
  PORT: Number(getEnvVariable('PORT', '5000')),
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  DB_HOST: getEnvVariable('DB_HOST', '127.0.0.1'),
  DB_PORT: Number(getEnvVariable('DB_PORT', '3306')),
  DB_USER: getEnvVariable('DB_USER', 'root'),
  DB_PASSWORD: getEnvVariable('DB_PASSWORD', ''),
  DB_NAME: getEnvVariable('DB_NAME', 'tatkal_engine'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN')
}



