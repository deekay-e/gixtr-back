import { authMock, authMockRequest, authMockResponse } from '@mock/auth.mock'
import { Request, Response } from 'express'
import { CustomError } from '@global/helpers/error-handler'
import { Signin } from '@auth/controllers/signin'
import { Utils } from '@global/helpers/utils'
import { authService } from '@service/db/auth.service'
import { userService } from '@service/db/user.service'
import { mergedAuthAndUserData } from '@mock/user.mock'

const USERNAME = 'Kaycee'
const PASSWORD = 'Kara22Chi'
const WRONG_USERNAME = 'ka'
const WRONG_PASSWORD = 'Ka'
const LONG_PASSWORD = 'Kara22Chi'
const LONG_USERNAME = 'mathematics'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')

describe('SignIn', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid login credentials')
    })
  })

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: WRONG_USERNAME, password: WRONG_PASSWORD }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid email or userName')
    })
  })

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: WRONG_PASSWORD }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid email or userName')
    })
  })

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Password is a required field')
    })
  })

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: WRONG_PASSWORD }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid password')
    })
  })

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request
    const res: Response = authMockResponse()
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid password')
    })
  })

  it('should throw "Invalid credentials" if username does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request
    const res: Response = authMockResponse()
    jest.spyOn(authService, 'getUser').mockResolvedValueOnce(null as any)

    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(authService.getUser).toHaveBeenCalledWith(Utils.capitalize(req.body.username))
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid credentials')
    })
  })

  it('should throw "Invalid credentials" if password does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request
    const res: Response = authMockResponse()
    jest.spyOn(authService, 'getUser').mockResolvedValueOnce(null as any)

    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(authService.getUser).toHaveBeenCalledWith(Utils.capitalize(req.body.username))
      expect(error.statusCode).toEqual(400)
      expect(error.serializeErrors().message).toEqual('Invalid credentials')
    })
  })

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request
    const res: Response = authMockResponse()
    authMock.comparePassword = () => Promise.resolve(true)
    jest.spyOn(authService, 'getUser').mockResolvedValue(authMock)
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
