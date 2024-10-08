import { Request, Response } from 'express'
import { UserCache } from '@service/redis/user.cache'
import { CurrentUser } from '@auth/controllers/current-user'
import { IUserDocument } from '@user/interfaces/user.interface'
import { authMockRequest, authMockResponse, authUserPayload } from '@mock/auth.mock'
import { existingUser } from '@mock/user.mock'

jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/user.cache')
jest.mock('@service/db/user.service')

const USERNAME = 'A-star'
const PASSWORD = 'kira22bo'

describe('CurrentUser', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('token', () => {
    it('should set session token to undefined and send correct json response', async () => {
      const req: Request = authMockRequest(
        {},
        { username: USERNAME, password: PASSWORD },
        authUserPayload
      ) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue({} as IUserDocument)

      await CurrentUser.prototype.read(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        token: undefined,
        isUser: false,
        user: {}
      })
    })

    it('should set session token and send correct json response', async () => {
      const req: Request = authMockRequest(
        { jwt: '12djdj34' },
        { username: USERNAME, password: PASSWORD },
        authUserPayload
      ) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(existingUser)

      await CurrentUser.prototype.read(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        token: req.session?.jwt,
        isUser: true,
        user: existingUser
      })
    })
  })
})
