import express, { Router } from 'express'

import { Signup } from '@auth/controllers/signup'
import { Signin } from '@auth/controllers/signin'
import { Signout } from '@auth/controllers/signout'
import { Password } from '@auth/controllers/password'

class AuthRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/signin', Signin.prototype.read)
    this.router.post('/signup', Signup.prototype.create)
    this.router.post('/forgot-password', Password.prototype.forgot)
    this.router.post('/reset-password/:token', Password.prototype.reset)

    return this.router
  }

  public signoutRoutes(): Router {
    this.router.get('/signout', Signout.prototype.init)

    return this.router
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes()
