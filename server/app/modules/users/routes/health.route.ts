import axios from 'axios'
import moment from 'moment'
import { performance } from 'perf_hooks'
import express, { Router, Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { config } from '@/config'

class HealthRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public status(): Router {
    this.router.get('/health', (req: Request, res: Response) => {
      res
        .status(HTTP_STATUS.OK)
        .send(`Server: Instance running with process id ${process.pid} on ${moment().format('LL')}`)
    })

    return this.router
  }

  public environment(): Router {
    this.router.get('/env', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.OK).send(`Environment: ${config.NODE_ENV}}`)
    })

    return this.router
  }

  public instance(): Router {
    this.router.get('/instance', async (req: Request, res: Response) => {
      const ins = await axios({
        method: 'get',
        url: config.EC2_URL
      })

      res
        .status(HTTP_STATUS.OK)
        .send(
          `Server: EC2 Instance running with id ${ins.data} and process id ${process.pid}} on ${moment().format(
            'LL'
          )}`
        )
    })

    return this.router
  }

  public fiboTest(): Router {
    this.router.get('/fibo/:num', async (req: Request, res: Response) => {
      const { num } = req.params
      const start: number = performance.now()
      const result: number = this.fibo(parseInt(num, 10))
      const end: number = performance.now()
      const ins = await axios({
        method: 'get',
        url: config.EC2_URL
      })

      res
        .status(HTTP_STATUS.OK)
        .send(
          `Performance: Fibonacci series of ${num} is ${result}. It took ${end - start}ms with ${
            ins.data
          } EC2 instance id and process id ${process.pid} on ${moment().format('LL')}`
        )
    })

    return this.router
  }

  private fibo(data: number): number {
    if (data < 2) return 1
    else return this.fibo(data - 2) + this.fibo(data - 1)
  }
}

export const healthRoutes: HealthRoutes = new HealthRoutes()
