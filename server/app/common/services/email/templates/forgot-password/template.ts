import fs from 'fs'
import ejs from 'ejs'

import { padlock } from '@service/email/icons/padlock'

class ForgotPasswordTemplate {
  public render(username: string, resetLink: string): string {
    return ejs.render(fs.readFileSync(__dirname + '/template.ejs', 'utf-8'), {
      username,
      resetLink,
      image_url: padlock
    })
  }
}

export const forgotPassword: ForgotPasswordTemplate = new ForgotPasswordTemplate()
