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
import InviziCache from '@/components/InviziCache'
import EventBus from '@/components/EventBus'
import axios from '@/utils/InviziAxios'
const _ = require('lodash')
const USE_LOCAL_URL = false

const STATIC_SYMBOLS = [
  'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP',
  'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN',
  'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB',
  'TRY', 'ZAR']

const ROOT_URL = USE_LOCAL_URL ? 'http://0.0.0.0:5000' : 'https://apif.invizi.co'
const END_POINT = `${ROOT_URL}/forex`
const STABLE_COINS = ['tether', 'usd-coin', 'binance-usd', 'paxos-standard', 'dai', 'true-usd', 'husd']

var Forex = {

  get () {
    let promise
    promise = axios.get(END_POINT, { crossdomain: true })
    // Cache value
    promise.then(value => {
      let forexObj = value.data
      forexObj.rates = _.pick(forexObj.rates, STATIC_SYMBOLS)
      InviziCache.setItem('Forex.get', forexObj, {persistent: true})
      EventBus.$emit('Forex/get', forexObj)
    })
    return promise
  },

  symbols () {
    var data = this.last()
    if (!data || !data.rates) {
      return STATIC_SYMBOLS
    }
    var allCurrencySymbols = _.keys(data.rates)
    var topCurrencySymbols = ['EUR', 'GBP', 'JPY', 'KRW', 'CNY']
    allCurrencySymbols = [...topCurrencySymbols, ..._.difference(allCurrencySymbols, topCurrencySymbols)]
    return allCurrencySymbols
  },

  symbolsWithUSD () {
    return ['USD'].concat(this.symbols())
  },

  isStableCoinOrFiat (coinId) {
    if (!coinId) return false

    let stable = this.symbolsWithUSD().map(currency => currency.toLowerCase).concat(STABLE_COINS)
    return stable.includes(coinId)
  },

  isFiat (symbol) {
    if (!symbol) return false
    var symbolsWithUSD = this.symbolsWithUSD()
    return symbolsWithUSD.indexOf(symbol.toUpperCase()) !== -1
  },
  /*
   * Get from cache latest ticker
   */
  last () {
    return InviziCache.getItem('Forex.get')
  }
}

export default Forex
