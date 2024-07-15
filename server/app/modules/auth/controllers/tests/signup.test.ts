import { Request, Response } from 'express'

import { Signup } from '@auth/controllers/signup'
import { authService } from '@service/db/auth.service'
import { CustomError } from '@global/helpers/error-handler'
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload'
import { authMock, authMockRequest, authMockResponse } from '@mock/auth.mock'
import { UserCache } from '@service/redis/user.cache'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/user.cache')
jest.mock('@service/queues/auth.queue')
jest.mock('@service/queues/user.queue')
jest.mock('@global/helpers/cloudinary-upload')

describe('Signup', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'kay@cee.me',
        password: 'Kara18Chi',
        avatarColor: 'purple',
        avatarImage: 'data: text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request
    const res: Response = authMockResponse()

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Username is a required field')
    })
  })

  it('should throw an error if username length is less than minimum', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'ka',
        email: 'kay@cee.me',
        password: 'Kara18Chi',
        avatarColor: 'purple',
        avatarImage: 'data: text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request
    const res: Response = authMockResponse()

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual(
        'Username must contain at least three characters'
      )
    })
  })

  it('should throw an error if username length is more than maximum', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'kaycee123qwerty',
        email: 'kay@cee.me',
        password: 'Kara18Chi',
        avatarColor: 'purple',
        avatarImage: 'data: text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request
    const res: Response = authMockResponse()

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual(
        'Username must contain no more than ten characters'
      )
    })
  })

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'kaycee',
        email: 'kay@cee.me',
        password: '',
        avatarColor: 'purple',
        avatarImage: 'data: text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request
    const res: Response = authMockResponse()

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Password is a required field')
    })
  })

  it('should throw an error if password length is less than minimum', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'kaycee',
        email: 'kay@cee.me',
        password: 'Kar',
        avatarColor: 'purple',
        avatarImage: 'data: text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request
    const res: Response = authMockResponse()

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual(
        'Password must contain at least four characters'
      )
    })
  })

  it('should throw an error if password length is more than maximum', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'kaycee',
        email: 'kay@cee.me',
        password: 'Kara18Chi4ever123qwerty',
        avatarColor: 'purple',
        avatarImage: 'data: text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request
    const res: Response = authMockResponse()

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual(
        'Password must contain no more than 16 characters'
      )
    })
  })

  it('should throw unathourized error if user already exists', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'kaycee',
        email: 'kay@cee.me',
        password: 'Kara18Chi',
        avatarColor: 'purple',
        avatarImage: 'data: text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request
    const res: Response = authMockResponse()

    jest.spyOn(authService, 'getUser').mockResolvedValue(authMock)

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('User already exists')
    })
  })

  it('should set session data with valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'kaycee',
        email: 'kay@cee.me',
        password: 'Kara18Chi',
        avatarColor: 'purple',
        avatarImage: 'data: text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request
    const res: Response = authMockResponse()

    jest.spyOn(authService, 'getUser').mockResolvedValue(null as any)
    jest
      .spyOn(cloudinaryUploads, 'uploads')
      .mockImplementation((): any =>
        Promise.resolve({ version: '123456789', public_id: '1234356' })
      )
    const spyUser = jest.spyOn(UserCache.prototype, 'addUser')

    await Signup.prototype.create(req, res)
    expect(req.session?.jwt).toBeDefined()
    expect(res.json).toHaveBeenCalledWith({
      message: 'Create user successful',
      user: spyUser.mock.calls[0][2],
      token: req.session?.jwt
    })
  })
})
