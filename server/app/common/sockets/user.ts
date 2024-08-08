import { Server, Socket } from 'socket.io'

import { ILogin, ISocketData } from '@user/interfaces/user.interface'

export let socketIOUserObject: Server
export const connectedUsersMap: Map<string, string> = new Map()

const users: string[] = []

export class SocketIOUserHandler {
  private io: Server

  constructor(io: Server) {
    this.io = io
    socketIOUserObject = io
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('setup', (data: ILogin) => {
        this.addClientToMap(data.userId, socket.id)
      })

      socket.on('block user', (data: ISocketData) => {
        this.io.emit('blocked user id', data)
      })

      socket.on('unblock user', (data: ISocketData) => {
        this.io.emit('unblocked user id', data)
      })

      socket.on('disconnect', () => {
        this.removeClientFromMap(socket.id)
      })
    })
  }

  private addClientToMap(userId: string, socketId: string): void {
    if (!connectedUsersMap.has(userId)) connectedUsersMap.set(userId, socketId)
  }

  private removeClientFromMap(socketId: string): void {
    if (Array.from(connectedUsersMap.values()).includes(socketId)) {
      const disconnectedUser: [string, string] = [...connectedUsersMap].find(
        (user: [string, string]) => {
          return user[1] === socketId
        }
      ) as [string, string]
      connectedUsersMap.delete(disconnectedUser[0])
      // send event to the client
    }
  }
}
