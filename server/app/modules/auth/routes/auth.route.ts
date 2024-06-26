import express, { Router } from 'express'

import { Signup } from '@auth/controllers/signup.controller'

class AuthRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/signup', Signup.prototype.create)

    return this.router
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes()
