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
import db from '@/components/Database'
import InviziCrypto from '@/components/InviziCrypto'
import UserManager from '@/components/UserManager'

import _ from 'lodash'

// Go Through all the tables to create a proxy
let encryptedDb = _.cloneDeep(db)
const encryptedTableNames = ['trades', 'onlineAccounts', 'coinNotes', 'addresses', 'coinAttributes', 'assetIndexes']
for (let attr of encryptedTableNames) {
  createProxy(attr, encryptedDb)
}

function createProxy (key, db) {
  let table = db[key]
  let functionReadNames = ['toArray', 'get', 'all']
  let functionWriteNames = ['put', 'bulkPut', 'save']
  if (Object.getPrototypeOf(table).constructor.name !== 'Table') return null

  functionReadNames.forEach((attr) => {
    let currentFunction = table[attr]
    if (_.isFunction(currentFunction)) {
      table[`${attr}Raw`] = currentFunction
      table[attr] = new Proxy(currentFunction, {
        apply: (target, thisArg, args) => {
          // read db
          let promise = target.apply(thisArg, args)
          return promise.then((data) => {
            let result = InviziCrypto.decrypt(data, UserManager.hashedPassword)
            return result
          })
        }
      })
    }
  })

  functionWriteNames.forEach((attr) => {
    let currentFunction = table[attr]
    if (_.isFunction(currentFunction)) {
      table[attr] = new Proxy(currentFunction, {
        apply: (target, thisArg, args) => {
          // write db
          let encryptedArgs = args.map(arg => InviziCrypto.encrypt(arg, UserManager.hashedPassword))
          return target.apply(thisArg, encryptedArgs)
        }
      })
    }
  })
}
export default encryptedDb
