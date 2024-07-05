import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { PostCache } from '@service/redis/post.cache'
import { postSchema } from '@post/schemas/post.schema'
import { postQueue } from '@service/queues/post.queue'
import { IPostDocument } from '@post/interfaces/post.interface'
import { JoiValidator } from '@global/decorators/joi-validation'
import { socketIOPostObject } from '@socket/post'

const postCache: PostCache = new PostCache()

export class Post {
  @JoiValidator(postSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { post, bgColor, scope, gifUrl, profilePicture, feelings } = req.body

    const postId: ObjectId = new ObjectId()
    const newPost: IPostDocument = {
      _id: postId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      scope,
      gifUrl,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
    } as IPostDocument

    // emit post event to user and add post data to redis
    socketIOPostObject.emit('addPost', newPost)
    await postCache.addPostToCache({
      key: postId,
      currentUserId: req.currentUser!.userId,
      uId: req.currentUser!.uId,
      newPost
    })

    // add post data to databse
    postQueue.addPostJob('addToPost', { value: newPost })

    res.status(HTTP_STATUS.CREATED).json({ message: 'Create post successful' })
  }
}
