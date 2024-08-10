import { Request, Response } from 'express'

import { existingUser } from '@mock/user.mock'
import { UserCache } from '@service/redis/user.cache'
import { userQueue } from '@service/queues/user.queue'
import { mailQueue } from '@service/queues/mail.queue'
import { userService } from '@service/db/user.service'
import { authService } from '@service/db/auth.service'
import { UserUpdate } from '@user/controllers/user-update'
import { CustomError } from '@global/helpers/error-handler'
import { authMockRequest, authMockResponse, authUserPayload } from '@mock/auth.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/queues/email.queue')
jest.mock('@service/db/user.service')

describe('UserUpdate', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('password', () => {
    it('should throw an error if currentPassword is empty', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: '',
          newPassword: 'manny2',
          confirmPassword: 'manny2'
        }
      ) as Request
      const res: Response = authMockResponse()
      UserUpdate.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Password is a required field')
      })
    })

    it('should throw an error if newPassword is empty', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: 'manny1',
          newPassword: '',
          confirmPassword: 'manny2'
        }
      ) as Request
      const res: Response = authMockResponse()
      UserUpdate.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Password is a required field')
      })
    })

    it('should throw an error if confirmPassword is empty', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: 'manny1',
          newPassword: 'manny2',
          confirmPassword: ''
        }
      ) as Request
      const res: Response = authMockResponse()
      UserUpdate.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Confirm password does not match new password.')
      })
    })

    it('should throw an error if currentPassword does not exist', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: 'manny1',
          newPassword: 'manny2',
          confirmPassword: 'manny2'
        },
        authUserPayload
      ) as Request
      const res: Response = authMockResponse()
      const mockUser = {
        ...existingUser,
        comparePassword: () => false
      }
      jest.spyOn(authService, 'getAuthUser').mockResolvedValue(mockUser as any)

      UserUpdate.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Invalid credentials')
      })
    })

    it('should send correct json response', async () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: 'manny1',
          newPassword: 'manny2',
          confirmPassword: 'manny2'
        },
        authUserPayload
      ) as Request
      const res: Response = authMockResponse()
      const mockUser = {
        ...existingUser,
        comparePassword: () => true,
        hashPassword: () => 'djejdjr123482ejsj'
      }
      jest.spyOn(authService, 'getAuthUser').mockResolvedValue(mockUser as any)
      jest.spyOn(authService, 'updatePassword')
      const spy = jest.spyOn(mailQueue, 'addMailJob')

      await UserUpdate.prototype.password(req, res)
      expect(authService.updatePassword).toHaveBeenCalledWith(`${req.currentUser!.username}`, 'djejdjr123482ejsj')
      expect(mailQueue.addMailJob).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1])
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password updated successfully. You will be redirected shortly to the login page.'
      })
    })
  })

  describe('info', () => {
    it('should call updateSingleUserItemInCache', async () => {
      const basicInfo = {
        quote: 'This is cool',
        work: 'KickChat Inc.',
        school: 'Taltech',
        location: 'Tallinn'
      }
      const req: Request = authMockRequest({}, basicInfo, authUserPayload, {}) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'updateUserProp')

      await UserUpdate.prototype.info(req, res)
      for (const [key, value] of Object.entries(req.body)) {
        expect(UserCache.prototype.updateUserProp).toHaveBeenCalledWith(`${req.currentUser?.userId}`, key, `${value}`)
      }
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated successfully'
      })
    })

    it('should call updateBasicInfoInDB', async () => {
      const basicInfo = {
        quote: 'This is cool',
        work: 'KickChat Inc.',
        school: 'Taltech',
        location: 'Tallinn'
      }
      const req: Request = authMockRequest({}, basicInfo, authUserPayload, {}) as Request
      const res: Response = authMockResponse()
      jest.spyOn(userQueue, 'addUserJob')

      await UserUpdate.prototype.info(req, res)
      expect(userQueue.addUserJob).toHaveBeenCalledWith('updateBasicInfoInDB', {
        key: `${req.currentUser?.userId}`,
        value: req.body
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated successfully'
      })
    })
  })

  describe('socials', () => {
    it('should call updateSingleUserItemInCache', async () => {
      const socialInfo = {
        facebook: 'https://facebook.com/tester',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        twitter: 'https://twitter.com'
      }
      const req: Request = authMockRequest({}, socialInfo, authUserPayload, {}) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'updateUserProp')

      await UserUpdate.prototype.socials(req, res)
      expect(UserCache.prototype.updateUserProp).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'social', req.body)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update social links successful'
      })
    })

    it('should call updateSocials', async () => {
      const socialInfo = {
        facebook: 'https://facebook.com/tester',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        twitter: 'https://twitter.com'
      }
      const req: Request = authMockRequest({}, socialInfo, authUserPayload, {}) as Request
      const res: Response = authMockResponse()
      jest.spyOn(userQueue, 'addUserJob')

      await UserUpdate.prototype.socials(req, res)
      expect(userQueue.addUserJob).toHaveBeenCalledWith('updateSocials', {
        key: `${req.currentUser?.userId}`,
        value: req.body
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update social links successful'
      })
    })
  })

  describe('notifications', () => {
    it('should call "addUserJob" methods', async () => {
      const settings = {
        messages: true,
        reactions: false,
        comments: true,
        follows: false
      }
      const req: Request = authMockRequest({}, settings, authUserPayload) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'updateUserProp')
      jest.spyOn(userQueue, 'addUserJob')

      await UserUpdate.prototype.notifications(req, res)
      expect(UserCache.prototype.updateUserProp).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'notifications', req.body)
      expect(userQueue.addUserJob).toHaveBeenCalledWith('updateNotifications', {
        key: `${req.currentUser?.userId}`,
        value: req.body
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ message: 'Update notification settings successful', settings: req.body })
    })
  })
})
