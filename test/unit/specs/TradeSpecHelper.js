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
const moment = require('moment')
const now = moment().subtract(1, 'minutes').unix()

let TradeSpecHelper = {
  getData () {
    var threeMonthAgo = moment().subtract(3, 'months').unix()
    var data = [
      {date: now, from: 'usd', quantity_from: 1000, to: 'bitcoin', quantity_to: 1, account_name: 'local2'},
      {date: threeMonthAgo, from: 'usd', quantity_from: 2000, to: 'bitcoin', quantity_to: 2, account_name: 'local2'},
      {date: threeMonthAgo, from: 'bitcoin', quantity_from: 0.124, to: 'ethereum', quantity_to: 2, account_name: 'local2'},
      {date: now, from: 'bitcoin', quantity_from: 0.062, to: 'ethereum', quantity_to: 1, account_name: 'local2'}
    ]
    return data
  }
}

export default TradeSpecHelper
