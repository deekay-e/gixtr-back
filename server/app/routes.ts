import { Application } from 'express'

import { authRoutes } from '@auth/routes/auth.route'
import { postRoutes } from '@post/routes/post.route'
import { serverAdapter } from '@service/queues/base.queue'
import { commentRoutes } from '@comment/routes/comment.route'
import { currentUserRoutes } from '@auth/routes/current.route'
import { authMiddleware } from '@global/helpers/auth-middleware'
import { reactionRoutes } from '@reaction/routes/reaction.route'

const BASE_PATH = '/api/v1'

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter())
    app.use(BASE_PATH, authRoutes.routes())
    app.use(BASE_PATH, authRoutes.signoutRoutes())

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes())
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes())
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes())
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes())
  }
  routes()
}
