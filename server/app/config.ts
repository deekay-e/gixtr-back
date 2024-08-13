import dotenv from 'dotenv'
import bunyan from 'bunyan'
import cloudinary from 'cloudinary'

dotenv.config({})

class Config {
  public CLOUD_API_SECRET: string | undefined
  public SECRET_KEY_ONE: string | undefined
  public SECRET_KEY_TWO: string | undefined
  public CLOUD_API_KEY: string | undefined
  public DATABASE_URL: string | undefined
  public JWT_TOKEN: string | undefined
  public NODE_ENV: string | undefined
  public EC2_URL: string | undefined
  public CLIENT_URL: string | undefined
  public REDIS_HOST: string | undefined
  public CLOUD_NAME: string | undefined
  public SENDER_EMAIL: string | undefined
  public SENDER_PASSWORD: string | undefined
  public SENDGRID_SENDER: string | undefined
  public SENDGRID_API_KEY: string | undefined

  private readonly DEFAULT_DB_URL = 'mongodb://127.0.0.1:27017/gen_e-sys'

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DB_URL
    this.JWT_TOKEN = process.env.JWT_TOKEN || '123qwe'
    this.NODE_ENV = process.env.NODE_ENV || 'development'
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || ''
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || ''
    this.CLIENT_URL = process.env.CLIENT_URL || ''
    this.REDIS_HOST = process.env.REDIS_HOST || ''
    this.CLOUD_NAME = process.env.CLOUD_NAME || ''
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || ''
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || ''
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || ''
    this.SENDER_PASSWORD = process.env.SENDER_PASSWORD || ''
    this.SENDGRID_SENDER = process.env.SENDGRID_SENDER || ''
    this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ''
    this.EC2_URL = process.env.EC2_URL || ''
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' })
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) throw new Error(`Configuration ${key} is undefined.`)
    }
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET
    })
  }
}

export const config: Config = new Config()
