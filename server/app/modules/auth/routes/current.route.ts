import express, { Router } from 'express'

import { CurrentUser } from '@auth/controllers/current-user'

class CurrentUserRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.get('/currentuser', CurrentUser.prototype.read)

    return this.router
  }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes()
