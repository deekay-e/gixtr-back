import express, { Router } from 'express'

import { Post } from '@post/controllers/create-post'
import { authMiddleware } from '@global/helpers/auth-middleware'

class PostRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/post', authMiddleware.checkAuth, Post.prototype.create)

    return this.router
  }
}

export const postRoutes: PostRoutes = new PostRoutes()
