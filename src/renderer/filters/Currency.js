/*
Copyright (C) 2018-2020 AI Atelier Ltd.

This file is part of Invizi.

Invizi is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at
your option) any later version.

Invizi is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with Invizi.  If not, see <https://www.gnu.org/licenses/>.
*/
import Vue from 'vue'
import InviziCalc from '@/components/InviziCalc'

const math = require('mathjs')
const _ = require('lodash')

Vue.filter('currency', function (value, currency) {
  if (!_.isFinite(value)) {
    return value
  }
  let fractionDigits = Math.abs(value) > 1.00 || value === 0 ? 2 : 6
  let curr = currency || 'USD'
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: fractionDigits
  })
  return formatter.format(value)
})

Vue.filter('amount', (value) => {
  if (!_.isFinite(value)) {
    return value
  }
  let fractionDigits = Math.abs(value) > 1.00 || value === 0 ? 2 : 6
  return +parseFloat(value).toFixed(fractionDigits)
})

Vue.filter('currencyWithoutDecimals', function (value, currency) {
  if (!_.isFinite(value)) {
    return value
  }

  let curr = currency || 'USD'
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  return formatter.format(value)
})

Vue.filter('toTwoDecimals', function (value) {
  if (_.isFinite(value)) {
    return new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  } else {
    return value
  }
})

Vue.filter('formatBTC', function (value) {
  if (_.isFinite(value)) {
    return value.toFixed(8)
  } else {
    return value
  }
})

Vue.filter('fiatToUSD', function (currency, quantity) {
  return math.unit(quantity, currency.toLowerCase()).toNumber('usd')
})

Vue.filter('multiplyBy', function (value, multiplier) {
  if (_.isNumber(value) && _.isNumber(multiplier)) {
    return InviziCalc.multiply(value, multiplier)
  } else {
    return ''
  }
})
