import Logger from 'bunyan'
import { Server, Socket } from 'socket.io'

import { config } from '@/config'

let socketIOPostObject: Server
const log: Logger = config.createLogger('postSocketIO')

export class SocketIOPostHandler {
  private io: Server

  constructor(io: Server) {
    this.io = io
    socketIOPostObject = io
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      log.info('Post socketIO handler')
    })
  }
}
