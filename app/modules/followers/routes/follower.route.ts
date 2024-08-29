import express, { Router } from 'express'

import { FollowGet } from '@follower/controllers/follow-get'
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
    this.router.put(
      '/unfollow/:followeeId',
      authMiddleware.checkAuth,
      UnfollowUser.prototype.remove
    )

    this.router.get('/followers', authMiddleware.checkAuth, FollowGet.prototype.followers)
    this.router.get('/following', authMiddleware.checkAuth, FollowGet.prototype.followees)
    this.router.get('/followers/:userId', authMiddleware.checkAuth, FollowGet.prototype.followers)
    this.router.get('/following/:userId', authMiddleware.checkAuth, FollowGet.prototype.followees)

    return this.router
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes()
