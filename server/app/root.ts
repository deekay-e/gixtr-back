import express, { Express } from 'express'

import { GeneSysServer } from './setupServer'

class Application {
  public init(): void {
    const app: Express = express()
    const server: GeneSysServer = new GeneSysServer(app)
    server.start()
  }
}

const app: Application = new Application()
app.init()
