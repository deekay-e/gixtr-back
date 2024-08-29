import { Request, Response } from 'express'
import { authMockRequest, authMockResponse } from '@mock/auth.mock'
import { Signout } from '@auth/controllers/signout'

const USERNAME = 'A-star'
const PASSWORD = 'Kira22bo'

describe('Signout', () => {
  it('should set session to null', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request
    const res: Response = authMockResponse()
    await Signout.prototype.init(req, res)
    expect(req.session).toBeNull()
  })

  it('should send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request
    const res: Response = authMockResponse()
    await Signout.prototype.init(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logout Successful.',
      user: {},
      token: ''
    })
  })
})
