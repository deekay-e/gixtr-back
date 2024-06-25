import { Application, json, urlencoded, Response, Request, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import http from 'http'
import compression from 'compression'
import cookieSession from 'cookie-session'
import HTTP_STATUS from 'http-status-codes'
import 'express-async-errors'

import { config } from './config'

const SERVER_PORT = 8008

export class GeneSysServer {
  private app: Application

  constructor(app: Application) {
    this.app = app
  }

  public start(): void {
    this.securityMiddleware(this.app)
    this.standardMiddleware(this.app)
    this.routesMiddleware(this.app)
    this.globalErrorHandler(this.app)
    this.startServer(this.app)
  }

  private securityMiddleware(app: Application): void {
    app.use(cookieSession({
      name: 'session',
      keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
      maxAge: 24 * 7 * 3600000,
      secure: config.NODE_ENV !== 'development'
    }))
    app.use(hpp())
    app.use(helmet())
    app.use(cors({
      origin: config.CLIENT_URL,
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }))
  }

  private standardMiddleware(app: Application): void {
    app.use(compression())
    app.use(json({ limit: '50mb' }))
    app.use(urlencoded({ extended: true, limit: '50mb' }))
  }

  private routesMiddleware(app: Application): void {}

  private globalErrorHandler(app: Application): void {}

  private startServer(app: Application): void {
    try {
      const server: http.Server = new http.Server(app)
      this.startHttpServer(server)
    } catch (error) {
      console.log(error)
    }
  }

  private createSocketIO(server: http.Server): void {}

  private startHttpServer(server: http.Server): void {
    server.listen(SERVER_PORT, () => {
      console.log(`Server running on port ${SERVER_PORT}`)
    })
  }
}