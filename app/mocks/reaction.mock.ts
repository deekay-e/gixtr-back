import { Response } from 'express'

import { IJWT } from '@mock/auth.mock'
import { AuthPayload } from '@auth/interfaces/auth.interface'
import { IReactionDocument, IReactions } from '@reaction/interfaces/reaction.interface'
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface'

export const reactionMockRequest = (
  sessionData: IJWT,
  body: IBody,
  currentUser?: AuthPayload | null,
  params?: IParams
) => ({
  body,
  params,
  currentUser,
  session: sessionData
})

export const reactionMockResponse = (): Response => {
  const res: Response = {} as Response
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

export interface IBody {
  type?: string
  postId?: string
  userTo?: string
  comment?: string
  prevReaction?: string
  profilePicture?: string
  postReactions?: IReactions
}

export interface IParams {
  page?: string
  postId?: string
  username?: string
  commentId?: string
  reactionId?: string
  prevReaction?: string
  postReactions?: string
}

export const reactionData: IReactionDocument = {
  type: 'love',
  username: 'KayCee',
  createdAt: new Date(),
  comment: 'This is a comment',
  _id: '6064861bc25eaa5a5d2f9bf4',
  postId: '6027f77087c9d9ccb1555268',
  userTo: '60263f14648fed5246e322d9',
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a'
} as IReactionDocument

export const commentsData: ICommentDocument = {
  _id: '6064861bc25eaa5a5d2f9bf4',
  username: 'KayCee',
  avatarColor: '#9c27b0',
  postId: '6027f77087c9d9ccb1555268',
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
  comment: 'This is a comment',
  createdAt: new Date(),
  userTo: '60263f14648fed5246e322d9'
} as unknown as ICommentDocument

export const commentNames: ICommentNameList = {
  count: 1,
  names: ['Kaycee']
}
