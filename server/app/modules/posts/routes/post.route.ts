import express, { Router } from 'express'

import { PostGet } from '@post/controllers/post-get'
import { PostCreate } from '@post/controllers/post-create'
import { authMiddleware } from '@global/helpers/auth-middleware'

class PostRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.get('/post/:page', authMiddleware.checkAuth, PostGet.prototype.many)
    this.router.get('/post-image/:page', authMiddleware.checkAuth, PostGet.prototype.manywithImages)

    this.router.post('/post', authMiddleware.checkAuth, PostCreate.prototype.minusImage)
    this.router.post('/post-image', authMiddleware.checkAuth, PostCreate.prototype.plusImage)

    return this.router
  }
}

export const postRoutes: PostRoutes = new PostRoutes()
