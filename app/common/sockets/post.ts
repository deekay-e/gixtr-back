import { Server, Socket } from 'socket.io'

import { ICommentDocument } from '@comment/interfaces/comment.interface'
import { IReactionDocument } from '@reaction/interfaces/reaction.interface'

export let socketIOPostObject: Server

export class SocketIOPostHandler {
  private io: Server

  constructor(io: Server) {
    this.io = io
    socketIOPostObject = io
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('reaction', (reaction: IReactionDocument) => {
        this.io.emit('checkReaction', reaction)
      })

      socket.on('comment', (comment: ICommentDocument) => {
        this.io.emit('checkComment', comment)
      })
    })
  }
}
