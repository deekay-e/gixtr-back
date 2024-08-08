import express, { Router } from 'express'

import { UserGet } from '@user/controllers/user-get'
import { UserBlock } from '@user/controllers/user-block'
import { authMiddleware } from '@global/helpers/auth-middleware'

class UserRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.get('/user/profiles/:page', authMiddleware.checkAuth, UserGet.prototype.profiles)

    this.router.put('/user/block/:followeeId', authMiddleware.checkAuth, UserBlock.prototype.block)
    this.router.put(
      '/user/unblock/:followeeId',
      authMiddleware.checkAuth,
      UserBlock.prototype.unblock
    )

    return this.router
  }
}

export const userRoutes: UserRoutes = new UserRoutes()
