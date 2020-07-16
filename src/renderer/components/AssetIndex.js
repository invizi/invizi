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
import db from '@/components/InviziDatabase'
import Formatter from '@/components/Formatter'
import DateHelper from '@/components/DateHelper'
import Forex from '@/components/Forex'
import Ticker from '@/components/Ticker'
import Historical from '@/components/Historical'
const _ = require('lodash')
const math = require('mathjs')

// attributeName: attribute of a coin like marketcap, volume, price ...
function weightByAttribute (attributeName, inverse) {
  return function (coins) {
    let coinTicker
    coins.forEach(coin => {
      coinTicker = Ticker.coinById(coin.coin_id)
      coin.composition = coinTicker[attributeName]
      if (inverse) {
        coin.composition = math.number(math.divide(1, math.bignumber(coin.composition)))
      }
    })
    // Convert in percentage
    let total = _.sum(coins.map(coin => coin.composition))
    coins.forEach(coin => {
      coin.composition = coin.composition * 100 / total
      coin.composition = +coin.composition.toFixed(2)
    })
    return coins
  }
}

let REBALANCING_STRATEGIES = {
  'price-weighted': weightByAttribute('price_usd'),
  'inverse-price-weighted': weightByAttribute('price_usd', true),
  'volume-weighted': weightByAttribute('total_volume'),
  'inverse-volume-weighted': weightByAttribute('total_volume', true),
  'marketcap-weighted': weightByAttribute('market_cap'),
  'inverse-marketcap-weighted': weightByAttribute('market_cap', true)
}

// TODO use InviziModel
var AssetIndex = {
  name: 'AssetIndex',

  table: db.assetIndexes,

  formatDefinition: {
    composition (obj) {
      return _.mapValues(obj, (val) => {
        return +val
      })
    }
  },

  all () {
    return this.table.toArray()
  },

  delete (primaryKey) {
    return this.table.delete(primaryKey)
  },

  loadIndexHistoricalBalance (indexComposition, initialAmount, startDate) {
    let coinsInvolved = Object.keys(indexComposition)
    // Remove fiat
    coinsInvolved = coinsInvolved.filter(coinId => !Forex.isFiat(coinId))
    var minDate = startDate
    var fullDates = DateHelper.createIntervals(60, 'minutes', minDate)
    var promises = []
    coinsInvolved.forEach((coin) => {
      promises.push(Historical.get(coin, fullDates))
    })

    let totalComposition = _.sum(Object.values(indexComposition))

    return Promise.all(promises).then((values) => {
      var result = [fullDates, []]
      let balance = {}
      let balanceInUnit = {}
      fullDates.forEach((date, dateIndex) => {
        balance = {}
        let dollarAmountByCoin = _.mapValues(indexComposition, comp => comp * initialAmount / totalComposition)
        coinsInvolved.forEach((coinId, coinIdIndex) => { // TODO use balance.keys
          if (values && values[coinIdIndex] && values[coinIdIndex][dateIndex]) {
            let coinPrice = values[coinIdIndex][dateIndex][1]
            if (dateIndex === 0) {
              balanceInUnit[coinId] = dollarAmountByCoin[coinId] / coinPrice
              balance[coinId] = dollarAmountByCoin[coinId]
            } else {
              balance[coinId] = balanceInUnit[coinId] * coinPrice
            }
          }
        })

        result[1].push(balance)
      })
      // Add today's balance
      // var now = moment().unix()
      // result[0].push(now)
      // result[1].push(BalanceHelper.balanceUSD(initialBalance))
      return result
    })
  },

  // coinsComposition: array
  rebalanceWithStrategy (strategy, coinsComposition) {
    if (!REBALANCING_STRATEGIES[strategy]) return coinsComposition
    return REBALANCING_STRATEGIES[strategy](coinsComposition)
  },

  async save (data) {
    let plainData = Formatter.run(data, this.formatDefinition)
    return this.table.put(plainData)
  }
}

export default AssetIndex
