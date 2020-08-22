export default function (context, inject) {
  const { store } = context

  const $gLoading = new Proxy({
    state:      '',
    dispatcher: '',
    reset() {
      store.dispatch('globalLoading/reset')
    }
  }, {
    get: (target, prop) => {
      if (prop === 'reset') {
        return target[prop]
      }

      return store.getters['globalLoading/get'][prop]
    },
    set: (obj, prop, value) => {
      if (prop === 'reset') {
        return
      }

      store.dispatch('globalLoading/setState', { [prop]: value })

      return true
    }

  })


  // Inject $hello(msg) in Vue, context and store.
  inject('gLoading', $gLoading)

  // For Nuxt <= 2.12, also add 👇
  context.$gLoading = $gLoading
}
