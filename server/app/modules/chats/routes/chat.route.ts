import express, { Router } from 'express'

import { ChatAdd } from '@chat/controllers/chat-add'
import { authMiddleware } from '@global/helpers/auth-middleware'

class ChatRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/chat', authMiddleware.checkAuth, ChatAdd.prototype.message)

    return this.router
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes()
