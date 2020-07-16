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
import Ticker from '@/components/Ticker'
import DateHelper from '@/components/DateHelper'
import BalanceHelper from '@/components/BalanceHelper'
import TradeClient from '@/components/TradeClient'
import InviziCache from '@/components/InviziCache'
import EventBus from '@/components/EventBus'
import { autorun } from '@/utils/Dep.js'
import axios from '@/utils/InviziAxios'
const moment = require('moment')
const _ = require('lodash')
const { ipcRenderer } = require('electron')

const INVIZI_API_URL = 'https://apif.invizi.co'
let preloadingBalance = false
let autoUpdateRan = false

// TO be called only from electron main renderer
//
let Historical = {
  missingCoinsData: [],
  // Given a dataset and a list of dates, this method filter the data values
  // matching each date the closest (we get the value the closest before)
  // for example if this hour price is not available we take the latest price
  // that is before now
  // data: [[1367433902, 117], [...]]
  // dates: [1495099356, 1495185756,..]
  // coinId
  // return: same format as data input
  filterByDate (historic, originalDates, coinId) {
    let dates = originalDates
    if (!dates || dates.length === 0 || historic.length === 0) {
      return historic
    }
    var coin = Ticker.coinById(coinId)

    if (!coin) {
      throw new Error(`Missing coin ${coinId} in Ticker`)
    }

    let result = []
    dates = dates.sort((a, b) => {
      return a - b
    })

    // if earliest date is before the earliest historic
    // replace it with the historic earliest date because we don't have any historic at
    // those early dates
    if (dates[0] < historic[0][0]) {
      dates = DateHelper.sliceFromInclude(dates, historic[0][0])
    }

    let dateIndex = dates.length - 1
    historic.slice().reverse().forEach((value) => {
      while (dateIndex >= 0 && dates[dateIndex] >= value[0]) {
        result.push(value) // push then reverse is faster
        dateIndex--
      }
    })

    if (result.length !== dates.length) {
      throw new Error('Incorrect size of result : bad algo')
    }

    result = result.reverse()
    return result
  },

  // Filter the data and fetch specific dates like the 24h, 7d, 30 days, 6 months 1 years values
  // Data of the form: [[date1, date2,...], [value1, value2, ...]]
  pickDates (data, dates) {
    // Sort by most recent first
    dates = dates.sort((a, b) => {
      return a - b
    })
    var result = []
    // Make sure the data has dates before the oldest of the passed dates
    if (data[0][0] > dates[0]) {
      throw new Error('data missing early dates')
    }

    let dataDateIndex = 0
    dates.forEach((currentDate, index) => {
      // console.log(`CurrentDate ${currentDate}`)
      // console.log(`Index= ${dataDateIndex}`)
      // our pick date is more than data date
      while (currentDate >= data[0][dataDateIndex]) {
        dataDateIndex++
      }
      let value = data[1][dataDateIndex - 1]
      // console.log(`value ${value}`)
      result.push(value)
    })

    return result
  },

  // like pickDate but more permissive when dates are earlier than available
  // data: historical data of the format
  // [[date1, priceUsd, priceBtc], [date2, priceUsd, priceBtc],...]
  pickDatesSafe (data, dates) {
    let dateIndex = 0
    dates = dates.sort((a, b) => {
      return a - b
    })
    while (data[0][0] > dates[dateIndex]) {
      dateIndex++
    }
    let correctDates = dates.slice(dateIndex)

    let result = []
    let dataDateIndex = 0
    correctDates.forEach((currentDate, index) => {
      while (data[dataDateIndex] && currentDate >= data[dataDateIndex][0]) {
        dataDateIndex++
      }
      let value = data[dataDateIndex - 1][1]
      // console.log(`value ${value}`)
      result.push(value)
    })

    let earliestPrice = new Array((dateIndex)).fill(result[0])
    let final = earliestPrice.concat(result)
    return final
  },

  fetchHistorical (coinId, start, end) {
    let url = `/historical?coin_ids=${coinId}`
    if (start) {
      url += `&start=${start}`
    }
    if (end) {
      url += `&end=${end}`
    }
    return axios.get(INVIZI_API_URL + url).then((response) => {
      let priceUsdAr = []
      let priceBtcAr = []
      if (response.data && response.data[coinId]) {
        priceUsdAr = response.data[coinId].map((daysValue) => {
          return [daysValue[0], daysValue[1]]
        })
        priceBtcAr = response.data[coinId].map((daysValue) => {
          return [daysValue[0], daysValue[2]]
        })
      }
      return {
        price_btc: priceBtcAr,
        price_usd: priceUsdAr
      }
    })
  },

  fetch (coinId, start, end) {
    let url = `/historical?coin_ids=${coinId}`
    if (start) {
      url += `&start=${start}`
    }
    if (end) {
      url += `&end=${end}`
    }
    return axios.get(INVIZI_API_URL + url).then((response) => {
      let priceUsdAr = response.data[coinId].map((daysValue) => {
        return [daysValue[0], daysValue[1]]
      })
      let priceBtcAr = response.data[coinId].map((daysValue) => {
        return [daysValue[0], daysValue[2]]
      })
      return {
        price_btc: priceBtcAr,
        price_usd: priceUsdAr
      }
    })
  },

  preloadBalances () {
    if (preloadingBalance) throw new Error('Already preloading Historical Balance ')

    preloadingBalance = true
    return TradeClient.loadHistoricalBalance().then((historical) => {
      if (_.isEmpty(historical) || !historical.data || historical.data.length === 0) {
        preloadingBalance = false
        return
      }
      let data = historical.data

      let balanceHistoricalUsd = _.map(data[1], (balance) => { return BalanceHelper.totalFromObject(balance) })

      let perf = TradeClient.performance([data[0], balanceHistoricalUsd])
      let historicalXAxisDates = _.map(data[0], (unixTime) => { return moment(unixTime, 'X').format('YYYY-MM-DD HH:mm:ss') })

      let result = BalanceHelper.balanceUSDtoBTCHistorical(data[1], data[0]).then((result) => {
        let balanceHistoricalBtc = _.map(result, (o) => { return BalanceHelper.totalFromObject(o) })
        let performanceBtc = TradeClient.performance([data[0], balanceHistoricalBtc])

        this.hideLoadingHistorical = true
        let res = {
          performance: {
            BTC: performanceBtc,
            USD: perf
          },
          balanceHistorical: {
            BTC: balanceHistoricalBtc,
            USD: balanceHistoricalUsd,
            raw: historical
          },
          historicalXAxisDates: historicalXAxisDates
        }
        return res
      })

      preloadingBalance = false
      return result
    })
  },

  autoUpdateHistorical () { // TODO move to parent
    // ensure we dont' do this more than once
    if (autoUpdateRan) return

    autorun((diff) => {
      // Trigger the recompute of worker historical whenever the trades change
      InviziCache.getItem('TradeClient.all()')
      ipcRenderer.send('worker-request', {channel: 'compute-historical'})
    })
    autoUpdateRan = true
  },

  async priceOnDate (coinId, datetime) {
    let fetchResult = await this.get(coinId, [datetime])
    return (fetchResult && fetchResult[0] && fetchResult[0][1]) || undefined
  },

  get (coinId, dates) {
    let coinObject = Ticker.coinById(coinId)

    if (!coinObject || !coinObject.coin_id) {
      let msg = `Coin ${coinId} not a valid id`
      console.error(msg)
      return Promise.reject(msg)
    }

    return this.fetchHistorical(coinId).then((coinData) => {
      if (!coinData) {
        return null
      }
      let result = coinData.price_usd
      if (dates && dates.length > 0) {
        result = Historical.filterByDate(result, dates, coinObject.coin_id)
      }
      return result
    })
  }
}

ipcRenderer.on('worker-response', (event, output) => {
  if (output.channel !== 'historical-computed') return
  InviziCache.setItem('historicalData', output.data)
  EventBus.$emit('update/historicalData')
  Historical.autoUpdateHistorical() // this won't execute more than once
})

export default Historical
