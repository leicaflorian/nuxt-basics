import Vue            from 'vue'
import VueSweetalert2 from 'vue-sweetalert2'
import '../assets/sweetAlert.scss'

Vue.use(VueSweetalert2, {})

class Alerts {
  constructor({ app }) {
    this.i18n  = app.i18n
    this.swal  = Vue.swal
    this.trans = this.i18n.t

  }

  _mergeOptions(defaultOpts, ...newOptions) {
    return Object.assign({}, defaultOpts, ...newOptions)
  }

  _stringifyMessage(message) {
    if (message && typeof message === 'object' && message.message) {
      message = message.message
    }

    return message
  }

  /**
   *
   * @param {String | ErrorConstructor} [message]
   * @param {{}} [options]
   */
  error(message, options = {}) {
    const extraOptions = message && message.alertOptions ? message.alertOptions : {}

    console.error(message)

    this.swal(this._mergeOptions({
        text: this._stringifyMessage(message) || this.trans.call(this.i18n, 'errors.generic'),
        icon: 'error'
      }, extraOptions, options)
    )
  }

  async info(message, options = {}) {
    return new Promise(((resolve, reject) => {
      this.swal(this._mergeOptions({
          text: message,
          icon: 'info'

        }, options)
      ).then((result) => {
        resolve()
      })
    }))
  }

  /**
   *
   * @param {String} message
   * @param {{}} [options]
   */
  async ask(message, options) {
    return new Promise((resolve, reject) => {
      const swalOptions = this._mergeOptions({
        text:              message,
        icon:              null,
        showCloseButton:   true,
        showCancelButton:  true,
        confirmButtonText: this.i18n.t('alerts.confirm'),
        cancelButtonText:  this.i18n.t('alerts.cancel'),
        reverseButtons:    true
      }, options)

      if (swalOptions.preConfirm) {
        swalOptions.showLoaderOnConfirm = true
        swalOptions.allowOutsideClick   = false
      }

      this.swal(swalOptions).then((result) => {
        if (result.isConfirmed) {
          return resolve(result)
        }

        reject('alert.cancel')
      })

    })
  }

  /**
   *
   * @param message
   * @param options
   */
  toastSuccess(message, options) {
    const extraOptions = message && message.alertOptions ? message.alertOptions : {}

    this.swal(this._mergeOptions({
        text:              this._stringifyMessage(message),
        toast:             true,
        position:          'top-end',
        showConfirmButton: false,
        showCloseButton:   true,
        timer:             5000,
        timerProgressBar:  true
      }, extraOptions, options)
    )
  }
}

export default (context, inject) => {
  const alerts = new Alerts(context)

  // Inject $hello(msg) in Vue, context and store.
  inject('alerts', alerts)

  // For Nuxt <= 2.12, also add 👇
  context.$alerts = alerts
}
