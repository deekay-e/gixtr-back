import express, { Router } from 'express'

import { ChatAdd } from '@chat/controllers/chat-add'
import { authMiddleware } from '@global/helpers/auth-middleware'

class ChatRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/chat/message', authMiddleware.checkAuth, ChatAdd.prototype.message)
    this.router.post('/chat/users/add', authMiddleware.checkAuth, ChatAdd.prototype.addChatUsers)
    this.router.post(
      '/chat/users/remove',
      authMiddleware.checkAuth,
      ChatAdd.prototype.removeChatUsers
    )

    return this.router
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes()
