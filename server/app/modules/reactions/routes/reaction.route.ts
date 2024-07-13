import express, { Router } from 'express'

import { ReactionAdd } from '@reaction/controllers/reaction-add'
import { authMiddleware } from '@global/helpers/auth-middleware'
import { ReactionRemove } from '@reaction/controllers/reaction-remove'
import { ReactionGet } from '@reaction/controllers/reaction-get'

class ReactionRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/reaction', authMiddleware.checkAuth, ReactionAdd.prototype.init)

    this.router.get(
      '/reaction/:postId/:username',
      authMiddleware.checkAuth,
      ReactionGet.prototype.one
    )
    this.router.get('/reactions/:postId', authMiddleware.checkAuth, ReactionGet.prototype.many)
    this.router.get(
      '/reactions/:username',
      authMiddleware.checkAuth,
      ReactionGet.prototype.manyByUsername
    )

    this.router.delete(
      '/reaction/:postId/:prevReaction',
      authMiddleware.checkAuth,
      ReactionRemove.prototype.init
    )

    return this.router
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes()
