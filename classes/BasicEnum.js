export class BasicEnum {
  constructor() {

  }

  /**
   *
   * @returns {[Number]}
   */
  get toArray() {
    return Object.values(this)
  }

  get toSelectOptions() {
    const rawItems = this.toArray

    return rawItems.reduce((acc, curr) => {
      acc.push({
        value: curr.toString(),
        text:  this.getTranslation(curr)
      })

      return acc
    }, [])
  }

  /**
   *
   * @param {*} id
   * @returns {string}
   */
  getById(id) {
    if (!id) {
      return ""
    }

    const entries      = Object.entries(this)
    const foundedEntry = entries.find(entry => entry[1].toString() === id.toString())

    if (!foundedEntry) {
      return ""
    }

    return foundedEntry[0]
  }

  getTranslation(id) {
    if (!id) {
      return ''
    }

    const genderId = this.getById(id)
    const enumName = this.constructor.name

    try {
      return $nuxt.$i18n.t(`enums.${ enumName }.${ genderId }`)
    } catch (e) {
      return id
    }
  }
}
