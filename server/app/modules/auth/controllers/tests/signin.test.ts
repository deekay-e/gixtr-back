import { Request, Response } from 'express'

import { Utils } from '@global/helpers/utils'
import { Signin } from '@auth/controllers/signin'
import { authService } from '@service/db/auth.service'
import { userService } from '@service/db/user.service'
import { mergedAuthAndUserData } from '@mock/user.mock'
import { CustomError } from '@global/helpers/error-handler'
import { authMock, loginMockRequest, authMockResponse } from '@mock/auth.mock'

const USERNAME = 'KayCee'
const PASSWORD = 'Kara22Chi'
const WRONG_USERNAME = 'ka'
const WRONG_PASSWORD = 'Ka'
const LOGIN = 'KayCee' || 'kay@cee.me'
const LONG_PASSWORD = 'Kara22Chi123qwerty'
const LONG_USERNAME = 'mathematics123qwerty'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')

describe('Signin', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  /* it('should throw an error if login is not available', () => {
    const req: Request = loginMockRequest({}, { login: '', password: PASSWORD }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid login credentials')
    })
  })

  it('should throw an error if login length is less than minimum length', () => {
    const req: Request = loginMockRequest({}, { username: WRONG_USERNAME, password: WRONG_PASSWORD }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid email or userName')
    })
  })

  it('should throw an error if login length is greater than maximum length', () => {
    const req: Request = loginMockRequest({}, { login: LONG_USERNAME, password: WRONG_PASSWORD }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid email or userName')
    })
  }) */

  it('should throw an error if password is not available', () => {
    const req: Request = loginMockRequest({}, { login: LOGIN, password: '' }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Password is a required field')
    })
  })

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = loginMockRequest({}, { login: LOGIN, password: WRONG_PASSWORD }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid password')
    })
  })

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = loginMockRequest({}, { login: LOGIN, password: LONG_PASSWORD }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid password')
    })
  })

  it('should throw "Invalid login credentials" if login does not exist', () => {
    const req: Request = loginMockRequest({}, { login: LOGIN, password: PASSWORD }) as Request
    const res: Response = authMockResponse()
    jest.spyOn(authService, 'getAuthUser').mockResolvedValueOnce(null as any)

    Signin.prototype.read(req, res).catch((error: CustomError) => {
      //expect(authService.getAuthUser).toHaveBeenCalledWith(req.body.login, EMAIL)
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid login credentials')
    })
  })

  it('should throw "Invalid login password" if password does not exist', () => {
    const req: Request = loginMockRequest({}, { login: LOGIN, password: PASSWORD }) as Request
    const res: Response = authMockResponse()
    jest.spyOn(authService, 'getAuthUser').mockResolvedValueOnce(null as any)

    Signin.prototype.read(req, res).catch((error: CustomError) => {
      //expect(authService.getAuthUser).toHaveBeenCalledWith(req.body.login, EMAIL)
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid login credentials')
    })
  })

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = loginMockRequest({}, { login: LOGIN, password: PASSWORD }) as Request
    const res: Response = authMockResponse()
    authMock.comparePassword = () => Promise.resolve(true)
    jest.spyOn(authService, 'getAuthUser').mockResolvedValue(authMock)
    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(mergedAuthAndUserData)

    await Signin.prototype.read(req, res)
    expect(req.session?.jwt).toBeDefined()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login user successful',
      user: mergedAuthAndUserData,
      token: req.session?.jwt
    })
  })
})
