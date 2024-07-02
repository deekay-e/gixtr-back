import crypto from 'crypto'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { config } from '@/config'
import { emailSchema } from '@auth/schemas/password'
import { authService } from '@service/db/auth.service'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { BadRequestError } from '@global/helpers/error-handler'
import { JoiValidator } from '@global/decorators/joi-validation'
import { forgotPassword } from '@service/email/templates/forgot-password/template'
import { mailQueue } from '@service/queues/mail.queue'

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
}
