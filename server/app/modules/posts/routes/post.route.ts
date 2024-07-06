import express, { Router } from 'express'

import { PostCreate } from '@post/controllers/create-post'
import { authMiddleware } from '@global/helpers/auth-middleware'

class PostRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/post', authMiddleware.checkAuth, PostCreate.prototype.minusImage)
    this.router.post('/post-image', authMiddleware.checkAuth, PostCreate.prototype.plusImage)

    return this.router
  }
}

export const postRoutes: PostRoutes = new PostRoutes()
