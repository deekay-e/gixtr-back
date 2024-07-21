import express, { Router } from 'express'

import { FollowUser } from '@follower/controllers/follow-user'
import { authMiddleware } from '@global/helpers/auth-middleware'
import { UnfollowUser } from '@follower/controllers/unfollow-user'

class FollowerRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.put('/follow/:followeeId', authMiddleware.checkAuth, FollowUser.prototype.add)
    this.router.put('/unfollow/:followeeId', authMiddleware.checkAuth, UnfollowUser.prototype.remove)

    return this.router
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes()
