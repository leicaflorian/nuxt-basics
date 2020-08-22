export default ({ $axios, store, redirect, app }) => {

  $axios.setHeader('Locale', app.i18n.locale)

  $axios.interceptors.response.use((response) => {
    if (response && response.data && response.data.error) {
      $nuxt.error({
        statusCode: response.data.error.status,
        message:    response.data.error.message
      })
    } else
      return response
  })
}
