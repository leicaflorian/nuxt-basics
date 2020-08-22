import Vue from 'vue'

function getLocale() {
  return $nuxt.$i18n.locales.find(_ => {
    return _.code === $nuxt.$i18n.locale
  }) || { iso: 'it-IT' }
}

function setMomentLocale() {
  const locale = getLocale()

  $nuxt.$moment.locale(locale.iso)
}

function convertPrice(price) {
  const locale = getLocale()

  return parseFloat(price)
    .toLocaleString(locale.iso, {
      style:    'currency',
      currency: 'EUR'
    })
}

function formatDate(date) {
  setMomentLocale()

  if (!date) {
    return ''
  }

  return $nuxt.$moment(date).format('L')
}

function formatHour(date) {
  setMomentLocale()

  if (!date) {
    return ''
  }

  return $nuxt.$moment(date).format('LT')
}

function formatDateHour(date) {
  setMomentLocale()

  if (!date) {
    return ''
  }

  return $nuxt.$moment(date).format('L LT')
}

Vue.filter('convertPrice', convertPrice)
Vue.filter('formatDate', formatDate)
Vue.filter('formatHour', formatHour)
Vue.filter('formatDateHour', formatDateHour)
