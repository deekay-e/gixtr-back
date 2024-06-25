import express, { Express } from 'express'

import { GeneSysServer } from './setupServer'
import getDbConn from './setupDb'

class Application {
  public init(): void {
    getDbConn()
    const app: Express = express()
    const server: GeneSysServer = new GeneSysServer(app)
    server.start()
  }
}

const app: Application = new Application()
app.init()
