export class Utils {
  static capitalize(str?: string): string {
    const value = str
      ? str
          .toLowerCase()
          .split(' ')
          .map((val: string) => `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()}`)
          .join(' ')
      : ''
    return value
  }

  static lowercase(str?: string): string {
    return str ? str.toLowerCase() : ''
  }

  static genRandomInt(intLen: number): number {
    const chars = '0123456789'
    let result = ''
    const charLen = chars.length
    for (let i = 0; i < intLen; i++) result += chars.charAt(Math.floor(Math.random() * charLen))
    return parseInt(result, 10)
  }

  static isEmail(email: string): boolean {
    const regexp = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/
    if (email.match(regexp)) return true

    return false
  }

  static parseJson(prop: string): any {
    try {
      return JSON.parse(prop)
    } catch (error) {
      return prop
    }
  }
}
