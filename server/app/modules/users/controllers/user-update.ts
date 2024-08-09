import publicIP from 'ip'
import moment from 'moment'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { authService } from '@service/db/auth.service'
import { userService } from '@service/db/user.service'
import { mailQueue } from '@service/queues/mail.queue'
import { BadRequestError } from '@global/helpers/error-handler'
import { joiValidator } from '@global/decorators/joi-validation'
import { changePasswordSchema } from '@user/schemas/user.schema'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { IResetPasswordParams } from '@user/interfaces/user.interface'
import { resetPassword } from '@service/email/templates/reset-password/template'

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
    userService.updatePassword(req.currentUser!.userId, passwordHash)

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
}
