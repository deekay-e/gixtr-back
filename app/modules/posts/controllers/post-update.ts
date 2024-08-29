import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { UploadApiResponse } from 'cloudinary'

import { socketIOPostObject } from '@socket/post'
import { PostCache } from '@service/redis/post.cache'
import { postQueue } from '@service/queues/post.queue'
import { uploads } from '@global/helpers/cloudinary-upload'
import { BadRequestError } from '@global/helpers/error-handler'
import { IPostDocument } from '@post/interfaces/post.interface'
import { joiValidator } from '@global/decorators/joi-validation'
import { imageQueue } from '@service/queues/image.queue'
import { postSchema, postWithImageSchema, postWithVideoSchema } from '@post/schemas/post.schema'

const postCache: PostCache = new PostCache()

export class PostUpdate {
  @joiValidator(postSchema)
  public async solo(req: Request, res: Response): Promise<void> {
    PostUpdate.prototype.updatePost(req)

    res.status(HTTP_STATUS.OK).json({ message: 'Post update successful' })
  }

  @joiValidator(postWithImageSchema)
  public async plusImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body
    if (imgId && imgVersion) PostUpdate.prototype.updatePost(req)
    else {
      const img: UploadApiResponse = await PostUpdate.prototype.withImage(req)
      if (!img.public_id) throw new BadRequestError(img.message)
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Post update with image successful' })
  }

  @joiValidator(postWithVideoSchema)
  public async plusVideo(req: Request, res: Response): Promise<void> {
    const { vidId, vidVersion } = req.body
    if (vidId && vidVersion) PostUpdate.prototype.updatePost(req)
    else {
      const vid: UploadApiResponse = await PostUpdate.prototype.withVideo(req)
      if (!vid.public_id) throw new BadRequestError(vid.message)
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Post update with video successful' })
  }

  private async updatePost(req: Request): Promise<void> {
    const { postId } = req.params
    const { post, bgColor, feelings, gifUrl, imgVersion, imgId, profilePicture, scope } = req.body
    let updatedPost: IPostDocument = {
      profilePicture,
      post,
      bgColor,
      feelings,
      scope,
      gifUrl,
      imgVersion,
      imgId
    } as IPostDocument

    // update post data in redis and emit post event to user
    const postUpdated = await postCache.updatePost(`${postId}`, updatedPost)
    socketIOPostObject.emit('update post', postUpdated, 'posts')

    // update post data in databse
    postQueue.addPostJob('updatePost', { key: postId, value: postUpdated })
  }

  private async withImage(req: Request): Promise<UploadApiResponse> {
    const { postId } = req.params
    const { post, bgColor, feelings, gifUrl, image, profilePicture, scope } = req.body

    // upload post image to cloudinary
    const res: UploadApiResponse = (await uploads(image)) as UploadApiResponse
    if (!res?.public_id) return res

    const imgId = res.public_id
    const imgVersion = `${res.version}`
    let updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      imgVersion,
      profilePicture,
      gifUrl,
      scope,
      imgId
    } as IPostDocument

    // update post data in redis and emit post event to user
    const postUpdated = await postCache.updatePost(`${postId}`, updatedPost)
    socketIOPostObject.emit('updatePost', postUpdated, 'posts')

    // update post data in databse
    postQueue.addPostJob('updatePost', { key: postId, value: postUpdated })
    // call image queue to add image to database
    imageQueue.addImageJob('addImage', {
      userId: req.currentUser!.userId,
      key: 'post',
      imgVersion,
      imgId
    })

    return res
  }

  private async withVideo(req: Request): Promise<UploadApiResponse> {
    const { postId } = req.params
    const { post, bgColor, feelings, gifUrl, video, profilePicture, scope } = req.body

    // upload post video to cloudinary
    const res: UploadApiResponse = (await uploads(video)) as UploadApiResponse
    if (!res?.public_id) return res

    const vidId = res.public_id
    const vidVersion = `${res.version}`
    let updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      vidVersion,
      profilePicture,
      gifUrl,
      scope,
      vidId
    } as IPostDocument

    // update post data in redis and emit post event to user
    const postUpdated = await postCache.updatePost(`${postId}`, updatedPost)
    socketIOPostObject.emit('updatePost', postUpdated, 'posts')

    // update post data in databse
    postQueue.addPostJob('updatePost', { key: postId, value: postUpdated })
    // call video queue to add video to database

    return res
  }
}
