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
import OnlineAccountClient from '@/models/OnlineAccountClient'
import Order from '@/models/Order'
const moment = require('moment')
const MODE = 'production'

var ExchangeOrderManager = {
  async validateExchange (exchangeId) {
    // Check if user has the api key for this exchange
    let onlineAccount = await OnlineAccountClient.load(exchangeId)
    return (onlineAccount && !!onlineAccount.API_KEY) || false
  },

  async fetchOrders (exchangeId, symbol) {
    console.log(`Fetching symbol ${symbol} for exchange ${exchangeId}`)
    let exchange = await ExchangeClientFactory.createWithApi(exchangeId)
    exchange.setMode(MODE)
    let currentExchangeOrders = await exchange.fetchOrders(symbol)
    currentExchangeOrders.forEach(o => {
      o.exchangeId = exchangeId
    })
    return currentExchangeOrders
  },

  async cancelOrder (order) {
    let exchange = await ExchangeClientFactory.createWithApi(order.exchangeId)
    exchange.setMode(MODE)
    let cancelOrderResult = await exchange.cancelOrder(order.id, order.symbol)
    return cancelOrderResult
  },

  // proposedOrder = { date: exchangeId: pair: side: price: amount: status: total: }
  async createOrder ({ date, exchangeId, pair, side, type, price, amount, status, total }) {
    let exchange = await ExchangeClientFactory.createWithApi(exchangeId)
    exchange.setMode(MODE)
    let createOrderResult = await exchange.createOrder(pair.toUpperCase(), type, side, amount, price)
    Order.save({
      orderId: createOrderResult.id,
      status: createOrderResult.status,
      exchange: exchangeId,
      original: createOrderResult,
      timestamp: moment(createOrderResult.datetime).format('X')})

    let fetchOrderResult = await exchange.fetchOrder(createOrderResult.id, pair.toUpperCase())

    // amount: 0.2
    // average : 0.032138
    // datetime : "2019-01-27T02:10:00.000Z"
    // fee : undefined
    // filled : 0.2
    // id : "21861457669"
    // info : {id: 21861457669, cid: 40200014698, cid_date: "2019-01-27", gid: null, symbol: "ethbtc", …}
    // lastTradeTimestamp : undefined
    // price : 0.032169
    // remaining : 0
    // side : "buy"
    // status : "closed"
    // symbol : "ETH/BTC"
    // timestamp : 1548555000000
    // type : "market"
    return fetchOrderResult
  }
}

export default ExchangeOrderManager
