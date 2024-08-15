import Logger from 'bunyan'
import express, { Express } from 'express'

import { config } from '@/config'
import getDbConn from '@/setupDb'
import { GeneSysServer } from '@/setupServer'

const log: Logger = config.createLogger('app')

class Application {
  public init(): void {
    this.loadConfig()
    getDbConn()
    const app: Express = express()
    const server: GeneSysServer = new GeneSysServer(app)
    server.start()
    Application.handleExit()
  }

  private loadConfig(): void {
    config.validateConfig()
    config.cloudinaryConfig()
  }

  private static handleExit(): void {
    process.on('uncaughtException', (error: Error) => {
      log.error(`There was an uncaught exception: ${error}`)
      Application.shutdownGracefully(1)
    })

    process.on('unhandledRejection', (reason: Error) => {
      log.error(`There was an unhandled rejection: ${reason}`)
      Application.shutdownGracefully(2)
    })

    process.on('SIGTERM', () => {
      log.error('Caught SIGTERM')
      Application.shutdownGracefully(2)
    })

    process.on('SIGINT', () => {
      log.error('Caught SIGINT')
      Application.shutdownGracefully(2)
    })

    process.on('exit', () => {
      log.error('Exiting...')
    })
  }

  private static shutdownGracefully(exitCode: number): void {
    Promise.resolve()
      .then(() => {
        log.info('Shutdown complete')
        process.exit(exitCode)
      })
      .catch((error) => {
        log.error(`Error during shutdown: ${error}`)
        process.exit(1)
      })
  }
}

const app: Application = new Application()
app.init()
