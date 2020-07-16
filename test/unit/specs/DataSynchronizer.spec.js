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
// import DataSynchronizer from '@/components/DataSynchronizer'
// import TradeClient from '@/components/TradeClient'
// import db from '@/components/Database'
// const moment = require('moment')

// describe('DataSynchronizer', () => {
//   after(function (done) {
//     db.trades.clear().then(done, done)
//   })
//   it('saves some trades', function () {
//     var now = moment().unix()
//     var data = [
//       {date: now, from: 'USD', quantity_from: 1000, to: 'BTC', quantity_to: 1, account_name: 'poloniex'},
//       {date: now, from: 'BTC', quantity_from: 0.062, to: 'ETH', quantity_to: 1, account_name: 'bitfinex'}
//     ]
//     return TradeClient.bulkSave(data).then((key) => {
//       return expect(key).not.to.equal(undefined)
//     })
//   })
//   it('gets tickers', async function () {
//     this.timeout(20000)
//     let exchanges = await DataSynchronizer.userExchanges()
//     return DataSynchronizer.start().then((results) => {
//       return expect(results.length).to.be.equal(exchanges.length)
//     })
//   })
// })
