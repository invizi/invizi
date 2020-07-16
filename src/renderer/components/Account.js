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
import Ticker from '@/components/Ticker'
const _ = require('lodash')

let Account = {

  allNames () {
    return db.trades.orderBy('account_name').uniqueKeys((keysArray) => {
      var result = _.map(keysArray, function (key) {
        var type = 'local'
        if (Ticker.SUPPORTED_EXCHANGES[key]) {
          type = 'exchange'
        }
        return { name: key, type: type }
      })
      return result.sort((a, b) => {
        if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1
        } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1
        } else {
          return 0
        }
      })
    })
  }
}

export default Account
