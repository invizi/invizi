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
import ExchangeClientFactory from '@/components/ExchangeClientFactory'
import InviziTimer from '@/components/InviziTimer'
import InviziCache from '@/components/InviziCache'
import Ticker from '@/components/Ticker'
import Forex from '@/components/Forex'
import OnlineAccountClient from '@/models/OnlineAccountClient'

const MIN_EXCHANGE_RATE_LIMIT = 60000
const ACTIVATE_WEBSOCKET = true
let trackedExchanges = {}

function untrackExchange (exchangeId) {
  if (trackedExchanges[exchangeId]) {
    for (let topic of Object.values(trackedExchanges[exchangeId])) {
      if (topic.timer) {
        topic.timer.stop()
      }
      if (topic.ws) {
        topic.ws.wsClose()
      }
    }
    delete trackedExchanges[exchangeId]
  }
}

function trackGetTickers (exchangeId) {
  let exchange = ExchangeClientFactory.create(exchangeId)
  let tickerPromise = exchange.getTickers()
  let exchangeWebsocketActivated = InviziCache.getItem(`websocketActive.${exchangeId}`)
  if (ACTIVATE_WEBSOCKET && exchange.hasWebSocket() && exchangeWebsocketActivated) {
    exchange.getWsTickers()
    exchange.wsPersistentConnect()
    trackedExchanges[exchangeId] = {ticker: {ws: exchange}}
    return tickerPromise
  } else {
    exchange.getWsPairs()
    if (trackedExchanges[exchangeId]) {
      untrackExchange(exchangeId)
    }
    let exchangeTimer = InviziTimer.repeat(exchange.getTickers, Math.max(exchange.rateLimit, MIN_EXCHANGE_RATE_LIMIT), exchange)
    trackedExchanges[exchangeId] = {ticker: {timer: exchangeTimer}}
    return tickerPromise
  }
}

var DataSynchronizer = {

  async start () {
    console.log('DataSynchronizer.start')
    // Get list of exchanges to synchronize
    Forex.get({persistent: true})
    await Ticker.get({persistent: true})
    InviziTimer.repeat(Ticker.get, 30000, Ticker)
    let exchanges = await this.userExchanges()
    let tickersPromises = []
    for (let exchangeId of exchanges) {
      let foundExchange = exchanges.indexOf(exchangeId)
      if (foundExchange >= 0 && !trackedExchanges[exchangeId]) {
        tickersPromises.push(trackGetTickers(exchangeId))
      }
    }
    return Promise.all(tickersPromises).catch((error) => {
      console.log(error)
    })
  },

  async userExchanges () {
    let exchanges = await OnlineAccountClient.allExchangeNames()
    return exchanges.map(exchange => exchange.name)
  },

  async trackExchange (exchangeId) {
    let exchanges = await this.userExchanges()
    let foundExchange = exchanges.indexOf(exchangeId)
    if (foundExchange >= 0 && !trackedExchanges[exchangeId]) {
      return trackGetTickers(exchangeId)
    } else {
      return null
    }
  },

  untrackExchange (exchangeId) {
    untrackExchange(exchangeId)
  }
}

export default DataSynchronizer
