import fs from 'fs'
import ejs from 'ejs'

import { padlock } from '@service/email/icons/padlock'
import { INotificationTemplate } from '@notification/interfaces/notification.interface'

class NotificationTemplate {
  public render(templateData: INotificationTemplate): string {
    const { username, header, message } = templateData
    return ejs.render(fs.readFileSync(__dirname + '/template.ejs', 'utf-8'), {
      username,
      header,
      message,
      image_url: padlock
    })
  }
}

export const notification: NotificationTemplate = new NotificationTemplate()
