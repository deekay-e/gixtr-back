import { ObjectId } from 'mongodb'
import { Response } from 'express'

import { existingUser } from '@mock/user.mock'
import { AuthPayload } from '@auth/interfaces/auth.interface'
import { IPostDocument } from '@post/interfaces/post.interface'

export const postMockRequest = (
  body: IBody,
  currentUser?: AuthPayload | null,
  params?: IParams
) => ({
  body,
  params,
  currentUser
})

export const postMockResponse = (): Response => {
  const res: Response = {} as Response
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

interface IParams {
  postId?: string
  page?: string
}

interface IBody {
  bgColor: string
  post?: string
  gifUrl?: string
  image?: string
  video?: string
  scope?: string
  imgId?: string
  imgVersion?: string
  vidId?: string
  vidVersion?: string
  profilePicture?: string
  feelings?: string
}

export const post: IBody = {
  bgColor: '#f44336',
  post: 'how are you?',
  gifUrl: '',
  imgId: '',
  imgVersion: '',
  image: '',
  vidId: '',
  vidVersion: '',
  video: '',
  scope: 'Public',
  profilePicture: 'http://place-hold.it/500x500',
  feelings: 'happy'
}

export const postMockData: IPostDocument = {
  _id: new ObjectId('6027f77087c9d9ccb1555268'),
  userId: existingUser._id,
  username: existingUser.username,
  email: existingUser.email,
  avatarColor: existingUser.avatarColor,
  profilePicture: existingUser.profilePicture,
  post: 'how are you?',
  bgColor: '#f44336',
  imgId: '',
  imgVersion: '',
  vidId: '',
  vidVersion: '',
  feelings: 'happy',
  gifUrl: '',
  scope: 'Public',
  commentsCount: 0,
  createdAt: new Date(),
  reactions: {
    like: 0,
    love: 0,
    happy: 0,
    wow: 0,
    sad: 0,
    angry: 0
  }
} as unknown as IPostDocument

export const updatedPost: IBody = {
  profilePicture: postMockData.profilePicture,
  post: postMockData.post,
  bgColor: postMockData.bgColor,
  feelings: 'wow',
  scope: 'Private',
  gifUrl: '',
  imgId: '',
  imgVersion: '',
  vidId: '',
  vidVersion: ''
}

export const updatedPostWithImage: IBody = {
  profilePicture: postMockData.profilePicture,
  post: 'Wonderful',
  bgColor: postMockData.bgColor,
  feelings: 'wow',
  scope: 'Private',
  gifUrl: '',
  imgId: '',
  imgVersion: '',
  image: ''
}

export const updatedPostWithVideo: IBody = {
  profilePicture: postMockData.profilePicture,
  post: 'Wonderful',
  bgColor: postMockData.bgColor,
  feelings: 'wow',
  scope: 'Private',
  gifUrl: '',
  vidId: '',
  vidVersion: '',
  video: ''
}
