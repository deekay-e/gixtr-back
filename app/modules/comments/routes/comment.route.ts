import express, { Router } from 'express'

import { CommentAdd } from '@comment/controllers/comment-add'
import { CommentGet } from '@comment/controllers/comment-get'
import { CommentEdit } from '@comment/controllers/comment-edit'
import { authMiddleware } from '@global/helpers/auth-middleware'
import { CommentDelete } from '@comment/controllers/comment-delete'

class CommentRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/comment', authMiddleware.checkAuth, CommentAdd.prototype.init)

    this.router.get(
      '/comment/:commentId/:postId',
      authMiddleware.checkAuth,
      CommentGet.prototype.one
    )
    this.router.get('/comments/post/:postId', authMiddleware.checkAuth, CommentGet.prototype.many)
    this.router.get(
      '/comments/names/:postId',
      authMiddleware.checkAuth,
      CommentGet.prototype.manyNames
    )

    this.router.put(
      '/comment/:commentId/:postId',
      authMiddleware.checkAuth,
      CommentEdit.prototype.init
    )

    this.router.delete(
      '/comment/:commentId/:postId',
      authMiddleware.checkAuth,
      CommentDelete.prototype.init
    )

    return this.router
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes()
