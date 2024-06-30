import express, { Router } from 'express'

import { Signup } from '@auth/controllers/signup'
import { Signin } from '@auth/controllers/signin'
import { Signout } from '@auth/controllers/signout'

class AuthRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/signup', Signup.prototype.create)
    this.router.post('/signin', Signin.prototype.read)

    return this.router
  }

  public signoutRoutes(): Router {
    this.router.get('/signout', Signout.prototype.init)

    return this.router
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes()
