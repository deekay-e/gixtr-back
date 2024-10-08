import { Request, Response } from 'express'
import { Password } from '@auth/controllers/password'
import { authMock, authMockRequest, authMockResponse } from '@mock/auth.mock'
import { CustomError } from '@global/helpers/error-handler'
import { mailQueue } from '@service/queues/mail.queue'
import { authService } from '@service/db/auth.service'

const WRONG_EMAIL = 'test@email.com'
const CORRECT_EMAIL = 'manny@me.com'
const INVALID_EMAIL = 'test'
const CORRECT_PASSWORD = 'manny'

jest.mock('@service/queues/base.queue')
jest.mock('@service/queues/mail.queue')
jest.mock('@service/db/auth.service')
jest.mock('@service/email/mail.transport')

describe('Password', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('forgot', () => {
    it('should throw an error if email is invalid', () => {
      const req: Request = authMockRequest({}, { email: INVALID_EMAIL }) as Request
      const res: Response = authMockResponse()
      Password.prototype.forgot(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Field must be valid')
      })
    })

    it('should throw "Invalid credentials" if email does not exist', () => {
      const req: Request = authMockRequest({}, { email: WRONG_EMAIL }) as Request
      const res: Response = authMockResponse()
      jest.spyOn(authService, 'getAuthUser').mockResolvedValue(null as any)
      Password.prototype.forgot(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Invalid email credential.')
      })
    })

    it('should send correct json response', async () => {
      const req: Request = authMockRequest({}, { email: CORRECT_EMAIL }) as Request
      const res: Response = authMockResponse()
      jest.spyOn(authService, 'getAuthUser').mockResolvedValue(authMock)
      jest.spyOn(mailQueue, 'addMailJob')
      await Password.prototype.forgot(req, res)
      expect(mailQueue.addMailJob).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email sent.'
      })
    })
  })

  describe('reset', () => {
    it('should throw an error if password is empty', () => {
      const req: Request = authMockRequest({}, { password: '' }) as Request
      const res: Response = authMockResponse()
      Password.prototype.reset(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Password is a required field')
      })
    })

    it('should throw an error if password and confirmPassword are different', () => {
      const req: Request = authMockRequest(
        {},
        { password: CORRECT_PASSWORD, confirmPassword: `${CORRECT_PASSWORD}2` }
      ) as Request
      const res: Response = authMockResponse()
      Password.prototype.reset(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Passwords should match')
      })
    })

    it('should throw error if reset token has expired', () => {
      const req: Request = authMockRequest(
        {},
        { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD },
        null,
        {
          token: ''
        }
      ) as Request
      const res: Response = authMockResponse()
      jest.spyOn(authService, 'getAuthUserByToken').mockResolvedValue(null as any)
      Password.prototype.reset(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Reset token has expired.')
      })
    })

    it('should send correct json response', async () => {
      const req: Request = authMockRequest(
        {},
        { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD },
        null,
        {
          token: '12sde3'
        }
      ) as Request
      const res: Response = authMockResponse()
      jest.spyOn(authService, 'getAuthUserByToken').mockResolvedValue(authMock)
      jest.spyOn(mailQueue, 'addMailJob')
      await Password.prototype.reset(req, res)
      expect(mailQueue.addMailJob).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password successfully updated.'
      })
    })
  })
})
