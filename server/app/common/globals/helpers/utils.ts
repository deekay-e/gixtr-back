

export class Utils {
  static capitalize(str: string): string {
    const value = str.toLowerCase()
      .split(' ')
      .map((val: string) => `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()}`)
      .join(' ')
    return value
  }

  static lowercase(str: string): string {
    return str.toLowerCase()
  }
}
