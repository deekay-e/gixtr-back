import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { UploadApiResponse } from 'cloudinary'
import { socketIOPostObject } from '@socket/post'
import { PostCache } from '@service/redis/post.cache'
import { postQueue } from '@service/queues/post.queue'
import { imageQueue } from '@service/queues/image.queue'
import { uploads } from '@global/helpers/cloudinary-upload'
import { BadRequestError } from '@global/helpers/error-handler'
import { IPostDocument } from '@post/interfaces/post.interface'
import { JoiValidator } from '@global/decorators/joi-validation'
import { IFileImageJob } from '@image/interfaces/image.interface'
import { postSchema, postWithImageSchema } from '@post/schemas/post.schema'

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
    const imgId = result?.public_id
    const imgVersion = `${result.version}`
    if (!imgId) throw new BadRequestError(result.message)

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
      imgVersion,
      imgId,
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
    } as IPostDocument

    // emit post event to user and add post data to redis
    socketIOPostObject.emit('add post', newPost)
    await postCache.addPost({
      key: postId,
      currentUserId: userId,
      uId: req.currentUser!.uId,
      newPost
    })

    // add post data to databse
    postQueue.addPostJob('addToPost', { key: userId, value: newPost })

    // call image queue to add image to database
    const imageJob: IFileImageJob = { userId, imgId, imgVersion, key: '' }
    imageQueue.addImageJob('addImage', imageJob)

    res.status(HTTP_STATUS.CREATED).json({ message: 'Create post with image successful' })
  }
}
