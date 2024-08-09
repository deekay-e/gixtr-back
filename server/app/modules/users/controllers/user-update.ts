import publicIP from 'ip'
import moment from 'moment'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import {
  basicInfoSchema,
  changePasswordSchema,
  notificationSettingsSchema,
  socialLinksSchema
} from '@user/schemas/user.schema'
import { UserCache } from '@service/redis/user.cache'
import { authService } from '@service/db/auth.service'
import { mailQueue } from '@service/queues/mail.queue'
import { userQueue } from '@service/queues/user.queue'
import { BadRequestError } from '@global/helpers/error-handler'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { joiValidator } from '@global/decorators/joi-validation'
import { IResetPasswordParams } from '@user/interfaces/user.interface'
import { resetPassword } from '@service/email/templates/reset-password/template'

const userCache: UserCache = new UserCache()

export class UserUpdate {
  @joiValidator(changePasswordSchema)
  public async password(req: Request, res: Response): Promise<void> {
    const email = req.currentUser!.email
    const username = req.currentUser!.username
    const { currentPassword, newPassword, confirmPassword } = req.body
    if (newPassword !== confirmPassword) throw new BadRequestError('Passwords do not match.')

    const authUser: IAuthDocument = await authService.getAuthUser(username, email)
    const isPassword: boolean = await authUser.comparePassword(currentPassword)
    if (!isPassword) throw new BadRequestError('Invalid password. Try again')

    const passwordHash: string = await authUser.hashPassword(newPassword)
    await authService.updatePassword(email, passwordHash)

    const templateParams: IResetPasswordParams = {
      username,
      email,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm')
    }

    const template: string = resetPassword.render(templateParams)
    mailQueue.addMailJob('changePassword', {
      template,
      receiver: email,
      subject: 'Change password confirmation'
    })

    res.status(HTTP_STATUS.OK).json({
      message: 'Change password successful. You will be redirected to the login page shortly.'
    })
  }

  @joiValidator(basicInfoSchema)
  public async info(req: Request, res: Response): Promise<void> {
    const userId = req.currentUser!.userId
    for (const [key, value] of Object.entries(req.body))
      await userCache.updateUserProp(userId, key, `${value}`)

    userQueue.addUserJob('updateUserInfo', { key: userId, value: req.body })

    res.status(HTTP_STATUS.OK).json({ message: 'Update user info successful' })
  }

  @joiValidator(socialLinksSchema)
  public async socials(req: Request, res: Response): Promise<void> {
    const userId = req.currentUser!.userId

    await userCache.updateUserProp(userId, 'social', req.body)
    userQueue.addUserJob('updateSocials', { key: userId, value: req.body })

    res.status(HTTP_STATUS.OK).json({ message: 'Update social links successful' })
  }

  @joiValidator(notificationSettingsSchema)
  public async notifications(req: Request, res: Response): Promise<void> {
    const userId = req.currentUser!.userId

    await userCache.updateUserProp(userId, 'notifications', req.body)
    userQueue.addUserJob('updateNotifications', { key: userId, value: req.body })

    res.status(HTTP_STATUS.OK).json({ message: 'Update notification settings successful' })
  }
}
