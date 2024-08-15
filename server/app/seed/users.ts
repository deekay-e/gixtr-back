import axios from 'axios'
import dotenv from 'dotenv'
import { createCanvas } from 'canvas'
import { floor, random } from 'lodash'
import { faker } from '@faker-js/faker'

dotenv.config({})

const users = []

function avatarColor(): string {
  const colors: string[] = [
    '#f44336',
    '#e91e63',
    '#2196f3',
    '#9c27b0',
    '#3f51b5',
    '#00bcd4',
    '#4caf50',
    '#ff9800',
    '#8bc34a',
    '#009688',
    '#03a9f4',
    '#cddc39',
    '#2962ff',
    '#448aff',
    '#84ffff',
    '#00e676',
    '#43a047',
    '#d32f2f',
    '#ff1744',
    '#ad1457',
    '#6a1b9a',
    '#1a237e',
    '#1de9b6',
    '#d84315',
  ]
  return colors[floor(random(0.9) * colors.length)]
}

function generateAvatar(text: string, bgColor: string, fgColor = 'white'): string {
  const canvas = createCanvas(200, 200)
  const context = canvas.getContext('2d')

  context.fillStyle = bgColor
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.font = 'normal 80px sans-serif'
  context.fillStyle = fgColor
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  return canvas.toDataURL('image/png')
}

async function seedUserData(count: number): Promise<void> {
  let i = 0
  try {
    console.log('***ADDING USER DATA TO DATABASE***')
    for (i = 0; i < count; i++) {
      const username: string = faker.person.firstName()
      const color = avatarColor()
      const avatarImage = generateAvatar(username.charAt(0).toUpperCase(), color)

      const body = {
        username,
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarColor: color,
        avatarImage
      }
      users.push(body)
      console.log(`- ${i + 1} of ${count} users - ${username}`)
      await axios.post(`${process.env.API_URL}/signup`, body)
    }
  } catch (error: any) {
    console.log(error?.response?.data)
  }
}

seedUserData(100)
