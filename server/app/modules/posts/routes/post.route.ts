import express, { Router } from 'express'

import { PostGet } from '@post/controllers/post-get'
import { PostCreate } from '@post/controllers/post-create'
import { PostUpdate } from '@post/controllers/post-update'
import { PostDelete } from '@post/controllers/post-delete'
import { authMiddleware } from '@global/helpers/auth-middleware'

class PostRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.get('/post/:page', authMiddleware.checkAuth, PostGet.prototype.solo)
    this.router.get('/post-image/:page', authMiddleware.checkAuth, PostGet.prototype.plusImage)
    this.router.get('/post-video/:page', authMiddleware.checkAuth, PostGet.prototype.plusVideo)

    this.router.post('/post', authMiddleware.checkAuth, PostCreate.prototype.solo)
    this.router.post('/post-image', authMiddleware.checkAuth, PostCreate.prototype.plusImage)
    this.router.post('/post-video', authMiddleware.checkAuth, PostCreate.prototype.plusVideo)

    this.router.put('/post/:postId', authMiddleware.checkAuth, PostUpdate.prototype.solo)
    this.router.put('/post-image/:postId', authMiddleware.checkAuth, PostUpdate.prototype.plusImage)
    this.router.put('/post-video/:postId', authMiddleware.checkAuth, PostUpdate.prototype.plusVideo)

    this.router.delete('/post/:postId', authMiddleware.checkAuth, PostDelete.prototype.remove)

    return this.router
  }
}

export const postRoutes: PostRoutes = new PostRoutes()
