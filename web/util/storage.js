const STORAGE_KEY = 'image-assorter'

// local storage
export default class Storage {
  static fetch () {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  }

  static save (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}
