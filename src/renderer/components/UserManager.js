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
import InviziCrypto, { DB_ENCODING } from '@/components/InviziCrypto'
import InviziCache from '@/components/InviziCache'
import EventBus from '@/components/EventBus'

const _ = require('lodash')
const ipcRenderer = require('electron').ipcRenderer

const CHECK_MESSAGE = 'To be, or not to be, that is the question'
const CHECK_KEY = 'check_v1'
const SALT_KEY = 'data_salt_v1'

async function getSalt () {
  let saltResult = await db.password.where({key: SALT_KEY}).toArray()
  if (saltResult && saltResult[0] && saltResult[0].value) {
    return Buffer.from(saltResult[0].value, 'base64')
  }
  // We did not find any salt yet, create and save in db
  let saltBuffer = InviziCrypto.getSalt({raw: true})
  await db.password.put({key: SALT_KEY, value: saltBuffer.toString(DB_ENCODING)})
  return saltBuffer
}

var UserManager = {
  authenticated: false,
  hashedPassword: undefined,

  async hasPassword () {
    let result = await db.password.where({key: CHECK_KEY}).toArray()
    return result.length > 0
  },

  // @returns: authenticated: boolean
  async login (password) {
    const salt = await getSalt()
    const hashedPassword = await InviziCrypto.hashPassword(password, salt)

    let allTradesEncrypted
    // Encrypt the CHECK_MESSAGE with the user hashedpassword using AES-256
    // try to decypher the message
    let result = await db.password.where({key: CHECK_KEY}).toArray()

    if (!result || _.isEmpty(result)) {
      const cipherMessage = InviziCrypto.encrypt(CHECK_MESSAGE, hashedPassword)
      // Nothing was encrypted yet, so it's new account, we store the message
      await db.password.put({key: CHECK_KEY, value: cipherMessage})

      this.authenticated = true
      this.hashedPassword = hashedPassword // TODO to refactor with same code below

      // Save hashedPassword for worker renderer background process
      allTradesEncrypted = InviziCache.getItem('TradeClient.trades.toArrayRaw()')
      ipcRenderer.send('worker-request', {channel: 'logged-in', data: hashedPassword, allTradesEncrypted})
      EventBus.$emit('loggedIn')
      return this.authenticated
    } else {
      let storedCypherMessage = result[0].value
      let decipherMessage
      // decrypt the stored message
      try {
        decipherMessage = InviziCrypto.decrypt(storedCypherMessage, hashedPassword)
      } catch (e) {
        console.log(e)
      }
      this.authenticated = decipherMessage === CHECK_MESSAGE

      if (this.authenticated) {
        this.hashedPassword = hashedPassword
        allTradesEncrypted = InviziCache.getItem('TradeClient.trades.toArrayRaw()')
        // Save hashedPassword for worker renderer background process
        ipcRenderer.send('worker-request', {channel: 'logged-in', data: hashedPassword, allTradesEncrypted})
        EventBus.$emit('loggedIn')
      }
      return this.authenticated
    }
  }
}

export default UserManager
