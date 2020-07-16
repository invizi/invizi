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
import Dexie from 'dexie'

const db = new Dexie('dbTest8')
db.version(1).stores({
  balanceHistoryBTC: `date, value`, // useless
  balanceHistoryUSD: `date, value`, // useless
  // accounts: `++id, date, coin, amount, value_btc, account_name`, // store all coins value in amount and btc, date rounded by hour
  onlineAccounts: `name, value`, // store all online exchanges accounts , value is an object
  coinHistory: `coin_id, value, last_date`, // last_date is the last date we have a value for
  trades: `++id, date, from, quantity_from, to, quantity_to, account_name, account_type, notes` // all trades from:
})

db.version(2).stores({
  addresses: `address, type` // watch live address
})

db.version(3).stores({
  userSettings: `++id, key, vaue` // store settings, password etc
})

export default db
