import Logger from 'bunyan'
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import sendGridMail from '@sendgrid/mail'

import { config } from '@/config'
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
  public async sendEmail(receiver: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development')
      this.devEmailSender(receiver, subject, body)
    else this.prodEmailSender(receiver, subject, body)
  }

  private async devEmailSender(receiver: string, subject: string, body: string): Promise<void> {
    const testAccount = await nodemailer.createTestAccount()
    const user = config.SENDER_EMAIL || testAccount.user
    const pass = config.SENDER_PASSWORD || testAccount.pass

    // create reusable transport object
    const transport: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.mail',
      port: 587,
      secure: false,
      auth: {
        user,
        pass
      }
    })

    const options: IMailOptions = {
      from: `Gen.e-Sys <${user}>`,
      to: receiver,
      subject,
      html: body
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

  private async prodEmailSender(receiver: string, subject: string, body: string): Promise<void> {
    const options: IMailOptions = {
      from: `Gen.e-Sys <${config.SENDER_EMAIL}>`,
      to: receiver,
      subject,
      html: body
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
