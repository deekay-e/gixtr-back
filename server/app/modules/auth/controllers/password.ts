import publicIP from 'ip'
import crypto from 'crypto'
import moment from 'moment'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { config } from '@/config'
import { authService } from '@service/db/auth.service'
import { mailQueue } from '@service/queues/mail.queue'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { BadRequestError } from '@global/helpers/error-handler'
import { JoiValidator } from '@global/decorators/joi-validation'
import { emailSchema, passwordSchema } from '@auth/schemas/password'
import { forgotPassword } from '@service/email/templates/forgot-password/template'
import { resetPassword } from '@service/email/templates/reset-password/template'
import { IResetPasswordParams } from '@user/interfaces/user.interface'

const EXPIRES = Date.now() * 60 * 60 * 1000 // I hour

export class Password {
  @JoiValidator(emailSchema)
  public async forgot(req: Request, res: Response): Promise<void> {
    const { email } = req.body
    const authUser: IAuthDocument = await authService.getAuthUserByEmail(email)
    if (!authUser)
      throw new BadRequestError('Invalid email credential.')

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
    const randomChars: string = randomBytes.toString('hex')
    await authService.updatePasswordToken(`${authUser._id}`, randomChars, EXPIRES)

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomChars}`
    const template: string = forgotPassword.render(`${authUser.username}`, resetLink)
    mailQueue.addMailJob('forgotPassword', {
      template, receiver: email, subject: 'Reset your password'
    })
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' })
  }

  @JoiValidator(passwordSchema)
  public async reset(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body
    const { token } = req.params
    const authUser: IAuthDocument = await authService.getAuthUserByToken(token)
    if (!authUser)
      throw new BadRequestError('Reset token has expired.')
    if (password !== confirmPassword)
      throw new BadRequestError('Passwords do not match.')

    authUser.password = password
    authUser.passwordResetToken = undefined
    authUser.passwordResetExpires = undefined
    await authUser.save()

    const templateParams: IResetPasswordParams = {
      username: authUser.username!,
      email: authUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm')
    }

    const template: string = resetPassword.render(templateParams)
    mailQueue.addMailJob('resetPasswordMail', {
      template, receiver: authUser.email!, subject: 'Password reset confirmation'
    })
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' })
  }
}
