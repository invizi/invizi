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

import EventBus from '@/components/EventBus'
const math = require('mathjs')
const _ = require('lodash')

const invalidCurrencySymbol = /-/
let invalidCoins = []

let currencyManager = {
  getInvalidCoins () {
    return Object.freeze(invalidCoins)
  },
  init () {
    EventBus.$once('Ticker/get', (message) => {
      // import the currencies
      let tickerBTC = _.find(message.data, {coin_id: 'bitcoin'})
      math.createUnit('btc', math.unit(+tickerBTC.price_usd, 'usd'))
      math.createUnit('bitcoin', math.unit(+tickerBTC.price_usd, 'usd'))

      for (let coin of message.data) {
        if (['BTC', '1ST', 'CAT', 'BTM', '1337', '2GIVE', 'PUT', '42', 'NET',
          'CPC', '8BIT', 'BTG', '808', 'GTC', 'PLC', '611', '300', 'HMC', 'V',
          'ACC', 'BLZ', 'ICN', 'B@', '888', 'J', '$$$', 'GCC', 'CMT', 'RMC',
          'KNC', 'LBTC', 'FAIR', 'CAN', 'CMS', 'XIN', 'ENT'].indexOf(coin.symbol) === -1) {
          let validCoinId = coin.coin_id
          if (invalidCurrencySymbol.test(validCoinId)) {
            validCoinId = validCoinId.replace(invalidCurrencySymbol, '')
            invalidCoins.push(coin)
          }
          try {
            math.createUnit(validCoinId.toLowerCase(), math.unit(+coin.price_btc, 'btc'))
          } catch (error) {
          }
          try {
            math.createUnit(coin.symbol.toLowerCase(), math.unit(+coin.price_btc, 'btc'))
          } catch (error) {
          }
        }
      }
    })
  }
}

export default currencyManager
