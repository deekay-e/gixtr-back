import express, { Router } from 'express'

import { ChatAdd } from '@chat/controllers/chat-add'
import { ChatGet } from '@chat/controllers/chat-get'
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

    this.router.get(
      '/chat/conversations',
      authMiddleware.checkAuth,
      ChatGet.prototype.conversations
    )
    this.router.get(
      '/chat/conversations/:userId',
      authMiddleware.checkAuth,
      ChatGet.prototype.conversations
    )
    this.router.get(
      '/chat/messages/:receiverId/:conversationId',
      authMiddleware.checkAuth,
      ChatGet.prototype.messages
    )

    return this.router
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes()
