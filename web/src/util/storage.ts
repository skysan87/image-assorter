const STORAGE_KEY: string = 'image-assorter'

// local storage
export default class Storage {
  static fetch(): any {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  }

  static save(data: any): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}