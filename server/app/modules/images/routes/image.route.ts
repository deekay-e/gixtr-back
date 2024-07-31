import express, { Router } from 'express'

import { authMiddleware } from '@global/helpers/auth-middleware'
import { ImageAdd } from '@image/controllers/image-add'
import { ImageGet } from '@image/controllers/image-get'
import { ImageRemove } from '@image/controllers/image-remove'

class ImageRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.get('/images/:userId', authMiddleware.checkAuth, ImageGet.prototype.many)
    this.router.get(
      '/image/:imageId',
      authMiddleware.checkAuth,
      ImageGet.prototype.backgroundPicture
    )

    this.router.post('/image', authMiddleware.checkAuth, ImageAdd.prototype.init)
    this.router.post('/image/profile', authMiddleware.checkAuth, ImageAdd.prototype.profilePicture)
    this.router.post(
      '/image/background',
      authMiddleware.checkAuth,
      ImageAdd.prototype.backgroundPicture
    )

    this.router.delete('/image/:imageId', authMiddleware.checkAuth, ImageRemove.prototype.init)

    return this.router
  }
}

export const imageRoutes: ImageRoutes = new ImageRoutes()
