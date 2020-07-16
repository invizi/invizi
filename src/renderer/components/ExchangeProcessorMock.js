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
let allOrders =
  [
    {
      'amount': 0.2,
      'average': 0.07724294999999999,
      'cost': 0.01544859,
      'datetime': '2017-08-27T06:26:48.353Z',
      'filled': 0.2,
      'id': '2000000',
      'info': {
        'clientOrderId': 'i123',
        'cummulativeQuoteQty': '0.01544859',
        'executedQty': '0.20000000',
        'icebergQty': '0.00000000',
        'isWorking': true,
        'orderId': 2000000,
        'origQty': '0.20000000',
        'price': '0.07724300',
        'side': 'BUY',
        'status': 'FILLED',
        'stopPrice': '0.00000000',
        'symbol': 'ETHBTC',
        'time': 1503815208353,
        'timeInForce': 'GTC',
        'type': 'LIMIT',
        'updateTime': 1503815776930
      },
      'price': 0.077243,
      'remaining': 0,
      'side': 'buy',
      'status': 'open',
      'symbol': 'ETH/BTC',
      'timestamp': 1503815208353,
      'type': 'limit'
    },
    {
      'amount': 5.995,
      'average': 0.05441031359466222,
      'cost': 0.32618983,
      'datetime': '2017-11-25T08:43:30.549Z',
      'filled': 5.995,
      'id': '2000001',
      'info': {
        'clientOrderId': 'd123',
        'cummulativeQuoteQty': '0.32618983',
        'executedQty': '5.99500000',
        'icebergQty': '0.00000000',
        'isWorking': true,
        'orderId': 2000001,
        'origQty': '5.99500000',
        'price': '0.00000000',
        'side': 'SELL',
        'status': 'FILLED',
        'stopPrice': '0.00000000',
        'symbol': 'ETHBTC',
        'time': 1511599410549,
        'timeInForce': 'GTC',
        'type': 'MARKET',
        'updateTime': 1511599410549
      },
      'price': 0.05441031359466222,
      'remaining': 0,
      'side': 'sell',
      'status': 'closed',
      'symbol': 'ETH/BTC',
      'timestamp': 1511599410549,
      'type': 'market'
    },
    {
      'amount': 5.528,
      'average': 0.054984996382055,
      'cost': 0.30395706,
      'datetime': '2017-11-25T09:20:30.292Z',
      'filled': 5.528,
      'id': '200002',
      'info': {
        'clientOrderId': 'g123',
        'cummulativeQuoteQty': '0.30395706',
        'executedQty': '5.52800000',
        'icebergQty': '0.00000000',
        'isWorking': true,
        'orderId': 2000002,
        'origQty': '5.52800000',
        'price': '0.05498500',
        'side': 'SELL',
        'status': 'FILLED',
        'stopPrice': '0.00000000',
        'symbol': 'ETHBTC',
        'time': 1511601630292,
        'timeInForce': 'GTC',
        'type': 'LIMIT',
        'updateTime': 1511601634082
      },
      'price': 0.054985,
      'remaining': 0,
      'side': 'sell',
      'status': 'closed',
      'symbol': 'ETH/BTC',
      'timestamp': 1511601630292,
      'type': 'limit'
    },
    {
      'amount': 3,
      'average': 0.04054,
      'cost': 0.12162,
      'datetime': '2017-12-16T02:30:46.693Z',
      'filled': 3,
      'id': '2000003',
      'info': {
        'clientOrderId': 'E123',
        'cummulativeQuoteQty': '0.12162000',
        'executedQty': '3.00000000',
        'icebergQty': '0.00000000',
        'isWorking': true,
        'orderId': 2000003,
        'origQty': '3.00000000',
        'price': '0.04054000',
        'side': 'SELL',
        'status': 'FILLED',
        'stopPrice': '0.00000000',
        'symbol': 'ETHBTC',
        'time': 1513391446693,
        'timeInForce': 'GTC',
        'type': 'LIMIT',
        'updateTime': 1513391465975
      },
      'price': 0.04054,
      'remaining': 0,
      'side': 'sell',
      'status': 'closed',
      'symbol': 'ETH/BTC',
      'timestamp': 1513391446693,
      'type': 'limit'
    },
    {
      'amount': 4.08,
      'average': 0.04010799754901961,
      'cost': 0.16364063,
      'datetime': '2017-12-16T02:58:19.641Z',
      'filled': 4.08,
      'id': '2000004',
      'info': {
        'clientOrderId': 'NF123',
        'cummulativeQuoteQty': '0.16364063',
        'executedQty': '4.08000000',
        'icebergQty': '0.00000000',
        'isWorking': true,
        'orderId': 2000004,
        'origQty': '4.08000000',
        'price': '0.04010800',
        'side': 'SELL',
        'status': 'FILLED',
        'stopPrice': '0.00000000',
        'symbol': 'ETHBTC',
        'time': 1513393099641,
        'timeInForce': 'GTC',
        'type': 'LIMIT',
        'updateTime': 1513393100460
      },
      'price': 0.040108,
      'remaining': 0,
      'side': 'sell',
      'status': 'closed',
      'symbol': 'ETH/BTC',
      'timestamp': 1513393099641,
      'type': 'limit'
    },
    {
      'amount': 1.262,
      'average': 0.046435000000000004,
      'cost': 0.05860097,
      'datetime': '2017-12-20T03:02:02.565Z',
      'filled': 1.262,
      'id': '3000000',
      'info': {
        'clientOrderId': 'eU123',
        'cummulativeQuoteQty': '0.05860097',
        'executedQty': '1.26200000',
        'icebergQty': '0.00000000',
        'isWorking': true,
        'orderId': 3000000,
        'origQty': '1.26200000',
        'price': '0.04643500',
        'side': 'SELL',
        'status': 'FILLED',
        'stopPrice': '0.00000000',
        'symbol': 'ETHBTC',
        'time': 1513738922565,
        'timeInForce': 'GTC',
        'type': 'LIMIT',
        'updateTime': 1513738924034
      },
      'price': 0.046435,
      'remaining': 0,
      'side': 'sell',
      'status': 'closed',
      'symbol': 'ETH/BTC',
      'timestamp': 1513738922565,
      'type': 'limit'
    },
    {
      'amount': 2,
      'average': 0.077817995,
      'cost': 0.15563599,
      'datetime': '2018-05-24T00:28:12.054Z',
      'filled': 2,
      'id': '1000000',
      'info': {
        'clientOrderId': 'web_123',
        'cummulativeQuoteQty': '0.15563599',
        'executedQty': '2.00000000',
        'icebergQty': '0.00000000',
        'isWorking': true,
        'orderId': 1000000,
        'origQty': '2.00000000',
        'price': '0.07781800',
        'side': 'BUY',
        'status': 'FILLED',
        'stopPrice': '0.00000000',
        'symbol': 'ETHBTC',
        'time': 1527121692054,
        'timeInForce': 'GTC',
        'type': 'LIMIT',
        'updateTime': 1527121692402
      },
      'price': 0.077818,
      'remaining': 0,
      'side': 'buy',
      'status': 'closed',
      'symbol': 'ETH/BTC',
      'timestamp': 1527121692054,
      'type': 'limit'
    }
  ]

let openOrders = []
let ExchangeProcessorMock = {
  async fetchOrders (symbol) {
    if (!symbol) throw new Error('Missing symbol')
    return allOrders.map(o => Object.assign(o, {symbol: symbol}))
  },

  async createOrder (order) {
    openOrders.push(order)
    return order
  },

  async cancelOrder (orderId, symbol) {
    openOrders = openOrders.filter(o => o.id !== orderId)
    return orderId
  },

  async fetchOrder (orderId) {
    if (!orderId) throw new Error('Missing orderId')
    return allOrders.find(o => o.id === `${orderId}`)
  }
}

export default ExchangeProcessorMock
