import { Server, Socket } from 'socket.io'

import { IFollowers } from '@follower/interfaces/follower.interface'

export let socketIOFollowObject: Server

export class SocketIOFollowHandler {
  private io: Server

  constructor(io: Server) {
    this.io = io
    socketIOFollowObject = io
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('unfollowUser', (data: IFollowers) => {
        this.io.emit('removeFollower', data)
      })
    })
  }
}
