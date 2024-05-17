interface Serialiser<T> {
  encode: (input: T) => string
  decode: (str: string) => T
}

class JSONSerialiser<T> {
  encode(obj: T) {
    return encodeURIComponent(JSON.stringify(obj))
  }

  decode(str: string) {
    return JSON.parse(decodeURIComponent(str))
  }
}

export class HashManager<T> {
  static IgnoreNextHashChange(newHash: string) {
    const tmpHashChange = window.onhashchange
    function hashChanged(e: HashChangeEvent) {
      e.preventDefault()
      window.onhashchange = tmpHashChange
    }
    window.location.hash = newHash
    window.onhashchange = hashChanged
  }

  onstatechange = (obj: T) => {}
  #init: T | undefined
  get init() {
    return this.#init
  }
  constructor(
    public readonly serialiser: Serialiser<T> = new JSONSerialiser<T>(),
  ) {
    window.onhashchange = (e) => {
      const newSerial = window.location.hash.substring(1)
      if (newSerial === this.#serial) return
      const decoded = this.serialiser.decode(newSerial)
      this.onstatechange(decoded)
      e.preventDefault()
    }

    const newSerial = window.location.hash.substring(1)
    if (newSerial === this.#serial) return
    this.#init = this.serialiser.decode(newSerial)
  }

  #serial: string = ""
  set state(obj: T) {
    const newSerial = this.serialiser.encode(obj)
    if (newSerial === this.#serial) return
    this.#serial = newSerial
    HashManager.IgnoreNextHashChange(this.#serial)
  }
}
