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
const { ipcRenderer } = require('electron')

const _ = require('lodash')

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

let UserManager = {
  authenticated: false,
  hashedPassword: undefined,

  async hasPassword () {
    let result = await db.password.where({key: CHECK_KEY}).toArray()
    return result.length > 0
  },

  // @returns: authenticated: boolean
  async login (password) {
    const salt = await getSalt()
    ipcRenderer.send('hashPassword', {data: [password, salt]})
  }
}

ipcRenderer.on('hashPassword', async function (_e, output) {
  if (!output.data) return

  let allTradesEncrypted
  let hashedPassword = output.data

  let storedPassword = await db.password.where({key: CHECK_KEY}).toArray()

  if (!storedPassword || _.isEmpty(storedPassword)) {
    // Nothing was encrypted yet, so it's new account, we store the message

    // Encrypt the CHECK_MESSAGE with the user hashedpassword using AES-256
    const cipherMessage = InviziCrypto.encrypt(CHECK_MESSAGE, hashedPassword)
    await db.password.put({key: CHECK_KEY, value: cipherMessage})

    UserManager.authenticated = true
    UserManager.hashedPassword = hashedPassword

    // Save hashedPassword for worker renderer background process
    allTradesEncrypted = InviziCache.getItem('TradeClient.trades.toArrayRaw()')
    ipcRenderer.send('worker-request', {channel: 'logged-in', data: hashedPassword, allTradesEncrypted})
  } else {
    let storedCypherMessage = storedPassword[0].value
    let decipherMessage
    // Decrypt the stored message
    try {
      decipherMessage = InviziCrypto.decrypt(storedCypherMessage, hashedPassword)
    } catch (e) {
      console.error(e)
    }

    UserManager.authenticated = decipherMessage === CHECK_MESSAGE

    if (UserManager.authenticated) {
      UserManager.hashedPassword = hashedPassword
      allTradesEncrypted = InviziCache.getItem('TradeClient.trades.toArrayRaw()')
      // Save hashedPassword for worker renderer background process
      ipcRenderer.send('worker-request', {channel: 'logged-in', data: hashedPassword, allTradesEncrypted})
    }
  }
  EventBus.$emit('loggedIn', UserManager.authenticated)
})

export default UserManager
