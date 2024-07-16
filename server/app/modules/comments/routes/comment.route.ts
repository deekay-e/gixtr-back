import express, { Router } from 'express'

import { CommentAdd } from '@comment/controllers/comment-add'
import { CommentGet } from '@comment/controllers/comment-get'
import { authMiddleware } from '@global/helpers/auth-middleware'
import { CommentRemove } from '@comment/controllers/comment-remove'

class CommentRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/comment', authMiddleware.checkAuth, CommentAdd.prototype.init)

    this.router.get(
      '/comment/:postId/:username',
      authMiddleware.checkAuth,
      CommentGet.prototype.one
    )
    this.router.get('/comments/post/:postId', authMiddleware.checkAuth, CommentGet.prototype.many)
    this.router.get(
      '/comments/:username',
      authMiddleware.checkAuth,
      CommentGet.prototype.manyByUsername
    )

    this.router.delete(
      '/comment/:postId/:prevComment',
      authMiddleware.checkAuth,
      CommentRemove.prototype.init
    )

    return this.router
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes()
