import { Server, Socket } from 'socket.io'

import { ISenderReceiver } from '@chat/interfaces/chat.interface'

export let socketIOChatObject: Server

export class SocketIOChatHandler {
  private io: Server

  constructor(io: Server) {
    this.io = io
    socketIOChatObject = io
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('join room', (data: ISenderReceiver) => {
        //this.io.emit('showRoom', data)
        console.log(data)
      })
    })
  }
}
