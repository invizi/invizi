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
import UserManager from '@/components/UserManager'
import Historical from '@/components/Historical'
import InviziCache from '@/components/InviziCache'
import TradeClient from '@/components/TradeClient'
const {ipcRenderer} = require('electron')

InviziCache.loadDbToMemory().then((val) => {
  Forex.get({persistent: true})
  Ticker.get({persistent: true})

  ipcRenderer.on('worker-request', (event, input) => {
    if (input.channel === 'logged-in') {
      UserManager.hashedPassword = input.data
      InviziCache.setItem('TradeClient.trades.toArrayRaw()', input.allTradesEncrypted)
      computeHistorical(event)
    }

    if (['compute-historical'].includes(input.channel)) {
      computeHistorical(event)
    }

    if (['cache-update'].includes(input.channel)) {
      updateCache(input.cacheKey, input.data)
    }
  })

  ipcRenderer.send('worker-ready')
})

function computeHistorical (event) {
  TradeClient.all().then(() => {
    Historical.preloadBalances().then(result => {
      event.sender.send('worker-response', {channel: 'historical-computed', data: result})
    }).catch(e => {
      console.log(e)
    })
  })
}

function updateCache (cacheKey, value) {
  InviziCache.setItem(cacheKey, value)
}
