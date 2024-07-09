import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { socketIOPostObject } from '@socket/post'
import { PostCache } from '@service/redis/post.cache'
import { postQueue } from '@service/queues/post.queue'
import { IPostDocument } from '@post/interfaces/post.interface'
import { JoiValidator } from '@global/decorators/joi-validation'
import { postSchema, postWithImageSchema } from '@post/schemas/post.schema'
import { uploads } from '@global/helpers/cloudinary-upload'
import { BadRequestError } from '@global/helpers/error-handler'
import { UploadApiResponse } from 'cloudinary'

const postCache: PostCache = new PostCache()

export class PostCreate {
  @JoiValidator(postSchema)
  public async minusImage(req: Request, res: Response): Promise<void> {
    const userId: string = req.currentUser!.userId
    const { post, bgColor, scope, gifUrl, profilePicture, feelings } = req.body

    const postId: ObjectId = new ObjectId()
    const newPost: IPostDocument = {
      _id: postId,
      userId,
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
    await postCache.addPost({
      key: postId,
      currentUserId: userId,
      uId: req.currentUser!.uId,
      newPost
    })

    // add post data to databse
    postQueue.addPostJob('addToPost', { key: userId, value: newPost })

    res.status(HTTP_STATUS.CREATED).json({ message: 'Create post successful' })
  }

  @JoiValidator(postWithImageSchema)
  public async plusImage(req: Request, res: Response): Promise<void> {
    const userId: string = req.currentUser!.userId
    const { post, bgColor, scope, gifUrl, profilePicture, feelings, image } = req.body

    const postId: ObjectId = new ObjectId()

    // upload post image to cloudinary
    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse
    if (!result?.public_id) throw new BadRequestError(result.message)

    const newPost: IPostDocument = {
      _id: postId,
      userId,
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
      imgVersion: `${result.version}`,
      imgId: result.public_id,
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
    } as IPostDocument

    // emit post event to user and add post data to redis
    socketIOPostObject.emit('addPost', newPost)
    await postCache.addPost({
      key: postId,
      currentUserId: userId,
      uId: req.currentUser!.uId,
      newPost
    })

    // add post data to databse
    postQueue.addPostJob('addToPost', { key: userId, value: newPost })
    // call image queue to add image to database

    res.status(HTTP_STATUS.CREATED).json({ message: 'Create post with image successful' })
  }
}
