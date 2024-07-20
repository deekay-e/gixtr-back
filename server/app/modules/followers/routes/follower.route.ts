import express, { Router } from 'express'

import { FollowUser } from '@follower/controllers/follow-user'
import { authMiddleware } from '@global/helpers/auth-middleware'

class FollowerRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.put('/follow/:followeeId', authMiddleware.checkAuth, FollowUser.prototype.add)

    return this.router
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes()
