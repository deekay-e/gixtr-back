import express, { Router } from 'express'

import { ReactionAdd } from '@reaction/controllers/reaction-add'
import { authMiddleware } from '@global/helpers/auth-middleware'

class ReactionRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/reaction', authMiddleware.checkAuth, ReactionAdd.prototype.init)

    return this.router
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes()
