import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { UploadApiResponse } from 'cloudinary'

import { socketIOPostObject } from '@socket/post'
import { PostCache } from '@service/redis/post.cache'
import { postQueue } from '@service/queues/post.queue'
import { uploads } from '@global/helpers/cloudinary-upload'
import { BadRequestError } from '@global/helpers/error-handler'
import { IPostDocument } from '@post/interfaces/post.interface'
import { JoiValidator } from '@global/decorators/joi-validation'
import { postSchema, postWithImageSchema } from '@post/schemas/post.schema'

const postCache: PostCache = new PostCache()

export class PostUpdate {
  @JoiValidator(postSchema)
  public async minusImage(req: Request, res: Response): Promise<void> {
    PostUpdate.prototype.updatePost(req)

    res.status(HTTP_STATUS.OK).json({ message: 'Update post successful' })
  }

  @JoiValidator(postWithImageSchema)
  public async plusImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body
    if (imgId && imgVersion)
      PostUpdate.prototype.updatePost(req)
    else {
      const img: UploadApiResponse = await PostUpdate.prototype.updatePostWithImage(req)
      if (!img.public_id) throw new BadRequestError(img.message)
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Update post with image successful' })
  }

  private async updatePost(req: Request): Promise<void> {
    const { postId } = req.params
    const userId: string = req.currentUser!.userId
    const {
      post, bgColor, feelings, gifUrl, imgVersion, imgId, profilePicture, scope
    } = req.body
    let updatedPost: IPostDocument = {
      profilePicture, post, bgColor, feelings, scope, gifUrl, imgVersion, imgId,
    } as IPostDocument

    // emit post event to user and update post data in redis
    socketIOPostObject.emit('updatePost', updatedPost, 'posts')
    updatedPost = await postCache.updatePost(`${postId}`, updatedPost )

    // update post data in databse
    postQueue.addPostJob('updatePost', { key: userId, value: updatedPost })
  }

  private async updatePostWithImage(req: Request): Promise<UploadApiResponse> {
    const { postId } = req.params
    const userId: string = req.currentUser!.userId
    const {
      post, bgColor, feelings, gifUrl, image, profilePicture, scope
    } = req.body

    // upload post image to cloudinary
    const img: UploadApiResponse = (await uploads(image)) as UploadApiResponse
    if (!img?.public_id) return img

    let updatedPost: IPostDocument = {
      profilePicture, post, bgColor, feelings, scope, gifUrl,
      imgVersion: `${img.version}`,
      imgId: img.public_id,
    } as IPostDocument

    // emit post event to user and update post data in redis
    socketIOPostObject.emit('updatePost', updatedPost, 'posts')
    updatedPost = await postCache.updatePost(`${postId}`, updatedPost )

    // update post data in databse
    postQueue.addPostJob('updatePost', { key: userId, value: updatedPost })
    // call image queue to add image to database

    return img
  }
}
