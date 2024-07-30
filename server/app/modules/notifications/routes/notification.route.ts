import express, { Router } from 'express'

import { authMiddleware } from '@global/helpers/auth-middleware'
import { NotificationGet } from '@notification/controllers/notification-get'
import { NotificationUpdate } from '@notification/controllers/notification-update'
import { NotificationDelete } from '@notification/controllers/notification-delete'

class NotificationRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.get(
      '/notifications/:userId',
      authMiddleware.checkAuth,
      NotificationGet.prototype.many
    )

    this.router.put(
      '/notification/:notificationId',
      authMiddleware.checkAuth,
      NotificationUpdate.prototype.init
    )

    this.router.delete(
      '/notification/:notificationId/',
      authMiddleware.checkAuth,
      NotificationDelete.prototype.init
    )

    return this.router
  }
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes()
