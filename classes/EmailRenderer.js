const fs                      = require('fs')
const path                    = require('path')
const { template: _template } = require('lodash')
const striptags               = require('striptags')
const mjml2html               = require('mjml')

/**
 * @typedef LocaleLanguage
 * @type {{}}
 *
 * @property {string} subject
 * @property {string | Object} content
 */

class EmailRenderer {
  constructor() {
    this._settings = {
      emailsDir:     'emails/',
      localesDir:    'lang/',
      localesSuffix: '-emails'
    }

    /**
     * List of available translations
     *
     * @type {Object.<string, LocaleLanguage>}
     * @private
     */
    this._availableLanguages = {}

    /**
     * List of cached fileTemplates.
     *
     * This list is populated each time a new fileTemplate is requested
     *
     * @type {Object.<string, string>}
     * @private
     */
    this._cachedTemplates = {}

    this._noCache = false

  }

  get _areLangsLoaded() {
    if (this._noCache) {
      return null
    }

    return Object.keys(this._availableLanguages).length > 0
  }

  /**
   *
   * @returns {Promise<{}>}
   * @private
   */
  async _getAvailableLanguages() {
    const langDir        = path.resolve(this._settings.localesDir)
    const availableFiles = fs.readdirSync(langDir)

    if (!fs.existsSync(langDir)) {
      throw new Error('Lang dir doesn\'t exist: ' + langDir)
    }

    for (const file of availableFiles) {
      const fileNameMatch = new RegExp(`${ this._settings.localesSuffix }\.(m|)js$`)

      /*
       if the file doesn't end with the specified suffix, i skip it
       */
      if (!file.match(fileNameMatch)) {
        continue
      }

      /*
       i retrive only the part of the string before the suffix
       */
      const fileLang = file.split(this._settings.localesSuffix)[0]

      const modulePath = path.resolve(langDir, file) + (this._noCache ? '?v=' + Date.now() : '')

      this._availableLanguages[fileLang] = (await import(modulePath)).default
    }

    return this._availableLanguages
  }

  _getLocalizedContent(tmpl, lang) {
    try {
      return this._availableLanguages[lang][tmpl]
    } catch (e) {
      return {}
    }
  }

  /**
   * Read the content of an .mjml file and returns it as a string
   *
   * @param {string} fileName
   * @returns {Promise<string>}
   * @private
   */
  async _readMjmlFile(fileName) {
    /*
     If i've already loaded once this file, i return the cached version
     */
    if (!this._noCache && this._cachedTemplates[fileName]) {
      return this._cachedTemplates[fileName]
    }

    const filePath = path.resolve(this._settings.emailsDir, fileName + '.mjml')

    /**
     * The content of the mjml file as string
     *
     * @type {string}
     */
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    /*
     i store a copy of the content of the file locally,
     to be able to return it faster next time will be requested
     */
    this._cachedTemplates[fileName] = fileContent

    return fileContent
  }

  /**
   * @param {string} fileName
   * @param {{}} fileContent
   * @returns {string}
   * @private
   */
  async _compileFile(fileName, fileContent) {
    const tmplString = await this._readMjmlFile(fileName)

    let toReturn = this._compileString(tmplString, fileContent)

    if (toReturn.indexOf('${') > -1) {
      toReturn = this._compileString(toReturn, fileContent)
    }

    return toReturn
  }

  _compileString(str, dataContent) {
    /**
     * @type {TemplateExecutor}
     */
    const tmplInstance = _template(str)

    return tmplInstance(dataContent || {})
  }

  async renderSubject(template, lang, data) {
    const localizedData = this._getLocalizedContent(template, lang).subject

    return this._compileString(localizedData, {
        data: data || {}
      }
    )
  }

  async renderText(template, lang, data) {
    const localizedData = this._getLocalizedContent(template, lang).content

    const compiledText = await this._compileFile(template, {
      t:    localizedData || {},
      data: data || {}
    })

    const strippedString = striptags(compiledText, [], '\n')

    return strippedString.replace(/\n{2,}|^\s{1,}/gm, '')
  }

  /**
   *
   * @param {string} tmplName
   * @param {string} lang
   * @param {{}} data
   * @returns {Promise<string>}
   */
  async render(tmplName, lang, data) {
    try {
      if (!this._areLangsLoaded) {
        await this._getAvailableLanguages()
      }

      const fileToInclude = await this._compileFile(tmplName, {
        t:    this._getLocalizedContent(tmplName, lang).content || {},
        data: data || {}
      })

      const layout = await this._compileFile('basicLayout', {
        fileToInclude
      })

      /**
       * @property {string} html
       * @property {Object[]} error
       */
      const mjmlResult = mjml2html(layout)

      if (mjmlResult.errors.length > 0) {
        throw new Error(mjmlResult.error.join())
      }

      return Promise.resolve(mjmlResult.html)
    } catch (er) {
      console.info(er)
      return Promise.reject(er)
    }
  }

  /**
   *
   * @param {string} view
   * @param {{}} locals
   * @param {string} locals.lang
   * @param {{}} [locals.data]
   * @param {boolean} [locals.noCache]
   *
   *
   * @returns {Promise<string>}
   */
  async renderEmailTemplates(view, locals) {
    const requiredBlocks = view.split('/')
    const template       = requiredBlocks[0]
    const type           = requiredBlocks[1]

    if (locals.hasOwnProperty('noCache')) {
      this._noCache = locals.noCache
    }

    let toReturn = null

    if (!this._areLangsLoaded) {
      await this._getAvailableLanguages()
    }

    switch (type) {
      case 'subject':
        toReturn = await this.renderSubject(template, locals.lang, locals.data)

        break
      case 'html':
        toReturn = await this.render(template, locals.lang, locals.data)

        break
      case 'text' :
        toReturn = await this.renderText(template, locals.lang, locals.data)

        break
    }

    return toReturn
  }
}

const emailRenderer = new EmailRenderer()

module.exports = {
  emailRenderer:          emailRenderer.render,
  emailTemplatesRenderer: (...args) => emailRenderer.renderEmailTemplates(...args)
}
