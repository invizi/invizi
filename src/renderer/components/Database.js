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

const db = new Dexie('invizi')
db.version(1).stores({
  onlineAccounts: `name, value`, // last_sync_at, account_type, API_KEY, API_SECRET store all online exchanges accounts , value is an object
  orders: `++id, orderId, timestamp`,
  trades: `++id, date, account_name`, //, from, quantity_from, to, quantity_to, account_type, notes`, // all trades from:
  addresses: `address, type, account_name`, // | watch live address
  userSettings: `++id, key, val`, // store settings, password etc
  password: `++id, key, value`, // store settings, password etc
  coinAttributesDefinition: `&name, value`, // store coin attributes definition
  coinAttributes: `&coinId, values`, // id of coin
  coinLists: `&name`, // id of coin (name, coins)
  cache: `&key`, // id of coin (key, value)
  coinNotes: `&coinId`, // id of coin (coinId), text, createdAt, updatedAt
  assetIndexes: `&name` // store settings, password etc
})

export default db
