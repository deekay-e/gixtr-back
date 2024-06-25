import Logger from 'bunyan'
import mongoose from 'mongoose'

import { config } from './config'

const log: Logger = config.createLogger('db')

export default () => {
  const connect = () => {
    mongoose.connect(`${config.DATABASE_URL}`)
      .then(() => {
        log.info('Connection to MongoDB was successful.')
      })
      .catch((error) => {
        log.error('Error connecting to database', error)
        return process.exit(1)
      })
  }
  connect()

  mongoose.connection.on('disconnected', connect)
}