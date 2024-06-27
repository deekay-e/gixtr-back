export class Utils {
  static capitalize(str: string): string {
    const value = str
      .toLowerCase()
      .split(' ')
      .map((val: string) => `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()}`)
      .join(' ')
    return value
  }

  static lowercase(str: string): string {
    return str.toLowerCase()
  }

  static genRandomInt(intLen: number): number {
    const chars = '0123456789'
    let result = ''
    const charLen = chars.length
    for (let i = 0; i < intLen; i++) result += chars.charAt(Math.floor(Math.random() * charLen))
    return parseInt(result, 10)
  }
}
