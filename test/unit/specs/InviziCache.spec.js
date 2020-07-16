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
import InviziCache from '@/components/InviziCache'
import Ticker from '@/components/Ticker'
import UserManager from '@/components/UserManager'
import { sha256 } from '@/components/InviziCrypto'
import { autorun } from '@/utils/Dep.js'
// import TradeSpecHelper from './TradeSpecHelper'
// import TradeClient from '@/components/TradeClient'
import db from '@/components/Database'
const _ = require('lodash')
// const moment = require('moment')

describe('InviziCache', () => {
  before(function (done) {
    db.trades.clear().then(done, done)
    UserManager.hashedPassword = sha256('myPassword').toString()
  })
  it('set - get', () => {
    var initial = { foo: 1, bar: 2 }
    let returnSet = InviziCache.setItem('test1', initial)
    expect(returnSet).to.equal('test1')
    var final = InviziCache.getItem('test1')
    expect(_.isEqual(initial, final)).to.equal(true)
  })

  it('set - get set undefined, should not set', () => {
    let result = InviziCache.setItem('testUndefined', undefined)
    expect(result).to.equal(undefined)
    var final = InviziCache.getItem('testUndefined')
    expect(final).to.equal(undefined)
  })

  it('set persistent - get persistent', async () => {
    var initial = { foo: 1, bar: 2 }
    InviziCache.setItem('test2', initial, {persistent: true})
    var final = await InviziCache.getItemFromDbCache('test2')
    expect(_.isEqual(initial, final)).to.equal(true)
  })

  it('fromDbCacheToCache when undefined', async () => {
    let key = 'RandomTickerKey'
    await InviziCache.fromDbCacheToCache(key)
    let memoryCache = InviziCache.getItem(key)
    let dbCacheTicker = await InviziCache.getItemFromDbCache(key)
    expect(_.isEqual(memoryCache, dbCacheTicker)).to.equal(true)
    expect(memoryCache).to.equal(undefined)
  })

  it('move persistent to memory', async function () {
    this.timeout(10000)
    await Ticker.get({persistent: true})
    let key = 'Ticker.get'
    await InviziCache.fromDbCacheToCache(key)
    let memoryCache = InviziCache.getItem(key)
    let dbCacheTicker = await InviziCache.getItemFromDbCache(key)
    expect(_.isEqual(memoryCache, dbCacheTicker)).to.equal(true)
  })

  it('handles dependencies', async function () {
    let initial = [{ id: 1, bar: 1 }, { id: 2, bar: 2 }, { id: 3, bar: 3 }]
    let initial2 = [{ id: 30, bar: 0 }]

    let fromCache
    InviziCache.setItem('dep1', initial)

    autorun(() => {
      console.log(`autorun 1`)
      fromCache = InviziCache.getItem('dep1')
    })

    expect(_.isEqual(initial, fromCache)).to.equal(true)

    let updates = [{id: 1, bar: 10}]
    InviziCache.updateCollection('dep1', updates)
    expect(_.isEqual([{ id: 1, bar: 10 }, { id: 2, bar: 2 }, { id: 3, bar: 3 }], fromCache)).to.equal(true)
    InviziCache.removeFromCollection('dep1', [1, 2])
    expect(_.isEqual([{ id: 3, bar: 3 }], fromCache)).to.equal(true)
    InviziCache.setItem('dep1', initial2)
    expect(_.isEqual(initial2, fromCache)).to.equal(true)
    let add1 = [{id: 30, bar: 30}]
    InviziCache.addToCollection('dep1', add1)
    expect(_.isEqual(initial2.concat(add1), fromCache)).to.equal(true)
  })

  // it('handles dependencies in TradeClient', async function () {
  //   let data = TradeSpecHelper.getData()
  //   expect(data.length).to.equal(4)
  //   let allTrades = await TradeClient.all()

  //   await TradeClient.add(data)
  //   let dbData1 = await TradeClient.allRaw()
  //   console.log(`dbData1=${dbData1}`)

  //   autorun((diff) => {
  //     console.log('autorun')
  //     return TradeClient.allRaw().then(dbData => {
  //       console.log(`dbData=${dbData}`)
  //       expect(_.isEqual(dbData, allTrades)).to.be.equal(true)
  //       return dbData
  //     })
  //   })
  //   expect(_.isEqual(data, allTrades))
  //   let trade1 = {from: 'usd', quantity_from: 1000, date: moment().unix(), to: 'bitcoin', quantity_to: 1, account_name: 'local0'}
  //   InviziCache.addToCollection('TradeClient.all()', [trade1])
  //   expect(_.isEqual(data.concat(trade1), allTrades))
  // })
})
