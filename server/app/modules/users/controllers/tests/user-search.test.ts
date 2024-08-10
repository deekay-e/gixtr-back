import { Request, Response } from 'express'

import { authUserPayload } from '@mock/auth.mock'
import { searchedUserMock } from '@mock/user.mock'
import { UserSearch } from '@user/controllers/user-search'
import { userService } from '@service/db/user.service'
import { chatMockRequest, chatMockResponse } from '@mock/chat.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/user.cache')

describe('UserSearch', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('user', () => {
    it('should send correct json response if searched user exist', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload, { query: 'Danny' }) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(userService, 'searchUsers').mockResolvedValue([searchedUserMock])

      await UserSearch.prototype.init(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Search users successful',
        users: [searchedUserMock]
      })
    })

    it('should send correct json response if searched user does not exist', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload, { query: 'DannyBoy' }) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(userService, 'searchUsers').mockResolvedValue([])

      await UserSearch.prototype.init(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Search users successful',
        users: []
      })
    })
  })
})
