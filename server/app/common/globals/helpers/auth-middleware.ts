import JWT from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

import { config } from '@/config'
import { UnauthorizedError } from '@global/helpers/error-handler'
import { AuthPayload } from '@auth/interfaces/auth.interface'

export class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) throw new UnauthorizedError('Token unavailable. Please login again')

    try {
      const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload
      req.currentUser = payload
    } catch (error) {
      throw new UnauthorizedError('Token is invalid. Please login again')
    }
    next()
  }

  public checkAuth(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) throw new UnauthorizedError('You have to login to access this route.')
    next()
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware()
