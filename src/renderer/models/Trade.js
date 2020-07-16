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
import InviziCalc from '@/components/InviziCalc'
const moment = require('moment')

const BUY_CURRENCIES = ['usd', 'usd-coin', 'tether', 'eur', 'dai']

class Trade {
  /* eslint-disable */
  constructor ({ id, date, from, quantity_from, to, quantity_to,
    account_name, account_type, notes}) {
  /* eslint-enable */

    // Add validation for values
    Object.assign(this, {
      id,
      date,
      from,
      quantity_from,
      to,
      quantity_to,
      account_name,
      account_type,
      notes
    })

    for (let prop in this) {
      if (this[prop] === undefined) {
        delete this[prop]
      }
    }
  }

  static isSold (trade) {
    return trade.from && ((BUY_CURRENCIES.indexOf(trade.to) !== -1) ||
      (BUY_CURRENCIES.indexOf(trade.from) === -1 && trade.to === 'bitcoin') ||
                          (BUY_CURRENCIES.concat(['bitcoin']).indexOf(trade.from) === -1 && trade.to === 'ethereum'))
  }

  static label (trade) {
    let result
    if (!trade.quantity_from) {
      result = 'deposited'
    } else if (!trade.quantity_to) {
      result = 'withdrawn'
    } else if (Trade.isSold(trade)) {
      result = 'sold'
    } else {
      result = 'bought'
    }
    return result
  }

  isSold () {
    return Trade.isSold(this)
  }

  isSellSide () {
    return !this.quantity_to || Trade.isSold(this)
  }

  label () {
    return Trade.label(this)
  }

  get quantity () {
    if (['sold', 'withdrawn'].indexOf(this.label()) >= 0) {
      return this.quantity_from
    } else {
      return this.quantity_to
    }
  }

  set quantity (val) {
    let numberVal = parseFloat(val)
    let label = this.label()
    if (label === 'bought') {
      this.quantity_from = InviziCalc.multiply(this.price, numberVal)
      this.quantity_to = numberVal
    } else if (label === 'sold') {
      this.quantity_to = InviziCalc.multiply(this.price, numberVal)
      this.quantity_from = numberVal
    } else if (label === 'deposited') {
      this.quantity_from = 0
      this.quantity_to = numberVal
    } else if (label === 'withdrawn') {
      this.quantity_to = 0
      this.quantity_from = numberVal
    }
  }

  get quantityUnit () {
    if (['sold', 'withdrawn'].indexOf(this.label()) >= 0) {
      return this.from
    } else {
      return this.to
    }
  }

  get price () {
    let result
    if (this.isSold() && +this.quantity_from !== 0) {
      result = InviziCalc.divide(this.quantity_to, this.quantity_from)
      if (BUY_CURRENCIES.includes(this.to)) {
        result = InviziCalc.roundFiat(result)
      } else {
        result = InviziCalc.btcFormat(result)
      }
    } else if (!this.isSold() && +this.quantity_to !== 0) {
      result = InviziCalc.divide(this.quantity_from, this.quantity_to)
      if (BUY_CURRENCIES.includes(this.from)) {
        result = InviziCalc.roundFiat(result)
      } else {
        result = InviziCalc.btcFormat(result)
      }
    }
    return result
  }

  get priceUnit () {
    if (this.isSold() && +this.quantity_from !== 0) {
      return this.to
    } else if (!this.isSold() && +this.quantity_to !== 0) {
      return this.from
    } else {
      return undefined
    }
  }

  set price (val) {
    if (val === Infinity) return

    if (this.isSold()) {
      this.quantity_to = InviziCalc.multiply(this.quantity_from, val)
    } else {
      this.quantity_from = InviziCalc.multiply(this.quantity_to, val)
    }
  }

  set dateString (val) {
    this.date = moment(val, 'YYYY-MM-DD').unix()
  }

  // return the date in 'YYYY-MM-DD' format
  get dateString () {
    return moment(this.date, 'X').format('YYYY-MM-DD')
  }

  setPriceQuantity (price, quantity) {
    if (this.isSellSide()) {
      this.quantity_from = quantity
    } else {
      this.quantity_to = quantity
    }
    this.price = price
  }

  static updateFromView (tradeView) {
    let trade = new Trade(tradeView)
    trade.price = tradeView.price
    trade.quantity = tradeView.quantity
    trade.dateString = tradeView.date
    return trade
  }
}

export default Trade
