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
import Forex from '@/components/Forex'
const moment = require('moment')
// Typical object format received from csv
// Date: "2018-02-11 18:04:16 +02:00"
// Type: "BUY"
// Exchange: "Bitfinex"
// Base amount: "1"
// Base currency: "BTC (Bitcoin)"
// Quote amount: "8274.1"
// Quote currency: "USD"
// Fee: ""
// Fee currency: ""
// Costs/Proceeds: "8274.10"
// Costs/Proceeds currency: "USD"
// Net worth on 2020-07-23: "9509.16"
// Worth currency: "USD"
// Sync holdings: ""
// Sent/Received from: ""
// Sent to: ""
// Notes: ""
const DATE_FORMAT = 'YYYY-MM-DD k:m:s Z'
const CURRENCY_REGEXP = /(.*) \((.*)\)/

const convertDate = date => moment(date, DATE_FORMAT).unix()

const parseCurrency = deltaCurrency => {
  if (!deltaCurrency) return deltaCurrency
  let match = deltaCurrency.match(CURRENCY_REGEXP) // eslint-disable-line no-unused-vars
  let symbol, coinId
  if (match) {
    symbol = match[1]
    coinId = match[2].toLowerCase()
  } else {
    symbol = deltaCurrency
  }
  // Try to get the coin from our Ticker
  if (Forex.isFiat(symbol)) {
    return symbol.toLowerCase()
  }
  let coin = Ticker.coinByIdOrSymbol(coinId) || Ticker.coinByIdOrSymbol(symbol)
  return coin.coin_id
}

const toInviziReducer = (acc, trade) => {
  let result = {}
  const baseCurrency = parseCurrency(trade['Base currency'])
  if (!baseCurrency) return acc

  const quoteCurrency = parseCurrency(trade['Quote currency'])
  if (!quoteCurrency && !['TRANSFER', 'DEPOSIT'].includes(trade['Type'])) return acc

  result.date = convertDate(trade['Date'])
  result.account_name = trade['Exchange']
  if (trade['Fee']) {
    result.fee = parseFloat(trade['Fee'])
    result.fee_currency = parseCurrency(trade['Fee currency'])
  }
  let result1 = {}
  let result2 = {}

  if (trade['Type'] === 'BUY') {
    result.quantity_to = parseFloat(trade['Base amount'])
    result.to = baseCurrency

    result.quantity_from = parseFloat(trade['Quote amount'])
    result.from = quoteCurrency
  } else if (trade['Type'] === 'SELL') {
    result.quantity_from = parseFloat(trade['Base amount'])
    result.from = baseCurrency

    result.quantity_to = parseFloat(trade['Quote amount'])
    result.to = quoteCurrency
  } else if (trade['Type'] === 'DEPOSIT') {
    result.quantity_to = parseFloat(trade['Base amount'])
    result.to = baseCurrency
    result.quantity_from = 0
  } else if (trade['Type'] === 'TRANSFER') {
    // Transfer is actually 2 transactions, a withdraw and a deposit
    result1.quantity_from = parseFloat(trade['Base amount'])
    result1.from = baseCurrency
    result1.account_name = trade['Sent/Received from']
    result1.quantity_to = 0
    result1.fee = result.fee
    result1.fee_currency = result.fee_currency
    result1.date = result.date

    result2.quantity_to = parseFloat(trade['Base amount'])
    result2.to = baseCurrency
    result2.account_name = trade['Sent to']
    result2.quantity_from = 0
    result2.date = result.date
    acc.push(...[result1, result2])
    return acc
  }

  acc.push(result)
  return acc
}

const parseTrade = trades => trades.reduce(toInviziReducer, [])

export default parseTrade
