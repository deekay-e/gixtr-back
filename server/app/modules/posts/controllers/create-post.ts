import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { postSchema } from '@post/schemas/post.schema'
import { JoiValidator } from '@global/decorators/joi-validation'
import { IPostDocument } from '@post/interfaces/post.interface'

export class Create {
  @JoiValidator(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body

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
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
    } as IPostDocument

    res.status(HTTP_STATUS.CREATED).json({ message: 'Create post successful' })
  }
}
