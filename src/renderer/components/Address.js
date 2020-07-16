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

import InviziModel from '@/models/InviziModel'
import TradeClient from '@/components/TradeClient'
const moment = require('moment')

class Address extends InviziModel {
  constructor () {
    super()
    this.name = 'Address'
    this.tableName = 'addresses'
  }

  account (accountName) {
    return this.table().where({account_name: accountName}).toArray()
  }

  async updateLinkedTrade (coinId, addressHash, amount, account) {
    // Check if already there in trades
    let trades = await TradeClient.find({address: addressHash, to: coinId})
    let tradeToSave = {}

    let existsAlready = trades && trades[0]
    if (existsAlready) {
      tradeToSave = trades[0]
    } else {
      tradeToSave.date = moment().unix()
    }
    Object.assign(tradeToSave, {
      address: addressHash,
      from: 'usd',
      quantity_from: 0,
      to: coinId,
      quantity_to: amount,
      account_name: account.name,
      account_type: account.account_type})
    // save new trade
    if (existsAlready) {
      TradeClient.update([tradeToSave])
    } else {
      TradeClient.add([tradeToSave])
    }
  }
}

export default new Address()
