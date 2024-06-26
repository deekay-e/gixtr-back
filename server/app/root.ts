import express, { Express } from 'express'

import { config } from '@/config'
import getDbConn from '@/setupDb'
import { GeneSysServer } from '@/setupServer'

class Application {
  public init(): void {
    this.loadConfig()
    getDbConn()
    const app: Express = express()
    const server: GeneSysServer = new GeneSysServer(app)
    server.start()
  }

  private loadConfig(): void {
    config.validateConfig()
  }
}

const app: Application = new Application()
app.init()
