import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { socketIOPostObject } from '@socket/post'
import { PostCache } from '@service/redis/post.cache'
import { postQueue } from '@service/queues/post.queue'

const postCache: PostCache = new PostCache()

export class PostDelete {
  public async remove(req: Request, res: Response): Promise<void> {
    const postId = req.params.postId
    const userId = `${req.currentUser!.userId}`

    // emit the socketIO event to handle the post delete operation
    socketIOPostObject.emit('deletePost', postId)

    // remove post from cache and database
    await postCache.deletePost(postId, userId)
    postQueue.addPostJob('deletePost', { keyOne: postId, keyTwo: userId })

    res.status(HTTP_STATUS.OK).json({ message: 'Delete post successful' })
  }
}
