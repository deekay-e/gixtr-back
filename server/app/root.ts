import express, { Express } from 'express'

import { GeneSysServer } from './setupServer'
import getDbConn from './setupDb'
import { config } from './config'

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
