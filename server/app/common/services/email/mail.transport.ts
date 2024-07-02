import Logger from 'bunyan'
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import sendGridMail from '@sendgrid/mail'

import { config } from '@/config'
import { IMailJob } from '@user/interfaces/user.interface'
import { BadRequestError } from '@global/helpers/error-handler'

const log: Logger = config.createLogger('mail')

sendGridMail.setApiKey(config.SENDGRID_API_KEY!)

interface IMailOptions {
  from: string
  to: string
  subject: string
  html: string
}

class MailTransport {
  public async sendEmail(data: IMailJob): Promise<void> {
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development')
      this.devEmailSender(data)
    else this.prodEmailSender(data)
  }

  private async devEmailSender(data: IMailJob): Promise<void> {
    //const testAccount = await nodemailer.createTestAccount()
    const user = config.SENDER_EMAIL// || testAccount.user
    const pass = config.SENDER_PASSWORD// || testAccount.pass

    // create reusable transport object
    const transport: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user,
        pass
      }
    })

    const options: IMailOptions = {
      from: `Gen.e-Sys <${user}>`,
      to: data.receiver,
      subject: data.subject,
      html: data.template
    } as IMailOptions

    // send email with defined transport object
    try {
      await transport.sendMail(options)
      log.info('Send development email successful')
    } catch (error) {
      log.error(error)
      throw new BadRequestError('Error sending email')
    }
  }

  private async prodEmailSender(data: IMailJob): Promise<void> {
    const options: IMailOptions = {
      from: `Gen.e-Sys <${config.SENDER_EMAIL}>`,
      to: data.receiver,
      subject: data.subject,
      html: data.template
    } as IMailOptions

    // send email with defined transport object
    try {
      await sendGridMail.send(options)
      log.info('Send production email successful')
    } catch (error) {
      log.error(error)
      throw new BadRequestError('Error sending email')
    }
  }
}

export const mailTransport: MailTransport = new MailTransport()
