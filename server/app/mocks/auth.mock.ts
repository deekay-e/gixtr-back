import { Response } from 'express'

import { AuthPayload, IAuthDocument } from '@auth/interfaces/auth.interface'

export const authMockRequest = (
  sessionData: IJWT,
  body: IAuthMock,
  currentUser?: AuthPayload | null,
  params?: any
) => ({
  session: sessionData,
  body,
  params,
  currentUser
})

export const loginMockRequest = (
  sessionData: IJWT,
  body: ILoginMock,
  currentUser?: AuthPayload | null,
  params?: any
) => ({
  session: sessionData,
  body,
  params,
  currentUser
})

export const authMockResponse = (): Response => {
  const res: Response = {} as Response
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

export interface IJWT {
  jwt?: string
}

export interface ILoginMock {
  login?: string
  password?: string
}

export interface IAuthMock {
  _id?: string
  username?: string
  email?: string
  uId?: string
  password?: string
  avatarColor?: string
  avatarImage?: string
  createdAt?: Date | string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  quote?: string
  work?: string
  school?: string
  location?: string
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
  messages?: boolean
  reactions?: boolean
  comments?: boolean
  follows?: boolean
  roles?: string[]
  firstname?: string
  lastname?: string
  nickname?: string
}

export const authUserPayload: AuthPayload = {
  userId: '60263f14648fed5246e322d9',
  uId: '1621613119252066',
  username: 'Esther',
  roles: ['org:user'],
  email: 'a.star@kaycee.me',
  avatarColor: '#9c27b0',
  iat: 12345
}

export const authMock = {
  _id: '60263f14648fed5246e322d3',
  uId: '1621613119252066',
  username: 'Esther',
  roles: ['org:user'],
  email: 'a.star@kaycee.me',
  avatarColor: '#9c27b0',
  createdAt: '2024-05-30T07:42:24.451Z',
  save: () => {},
  comparePassword: () => false
} as unknown as IAuthDocument
