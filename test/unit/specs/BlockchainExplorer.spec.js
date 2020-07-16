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
// import BlockchainExplorer from '@/components/BlockchainExplorer'
// import Ticker from '@/components/Ticker'
// const _ = require('lodash')

// describe('BlockchainExplorer', () => {
//   it('fetches the live ticker', function () {
//     this.timeout(15000)
//     return Ticker.get().then((value) => {
//       // Check its already cache
//       expect(_.isEqual(Ticker.last(), value.data)).to.equal(true)
//       return expect(_.find(value.data, {symbol: 'BTC'}).price_btc).to.equal('1.0')
//     })
//   })

//   it('fetches the bitcoin address', function () {
//     var btcAddr = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
//     this.timeout(15000)
//     return BlockchainExplorer.getAddressBalance(btcAddr, 'bitcoin').then((result) => {
//       expect(result.data).to.be.above(66.75)
//       return expect(result.data).to.be.below(66.77)
//     })
//   })

//   it('fetches the ethereum address', function () {
//     var btcAddr = '0x7d551397f79a2988b064afd0efebee802c7721bc'

//     this.timeout(15000)
//     return BlockchainExplorer.getAddressBalance(btcAddr, 'ethereum').then((result) => {
//       return expect(result.data).to.be.equal(93.99473908)
//     })
//   })

//   it('fetches the dogecoin address', function () {
//     var addr = 'DNPAfp9btstmZEHPfqoT9gxPEZs9tW4D1Z'
//     this.timeout(15000)
//     return BlockchainExplorer.getAddressBalance(addr, 'dogecoin').then((result) => {
//       return expect(result.data).to.be.above(0)
//     })
//   })

//   it('fetches the dash address', function () {
//     var addr = 'XwjvowiqdDpdT98Zc12Y17JD29iLG4eBP2'
//     this.timeout(15000)
//     return BlockchainExplorer.getAddressBalance(addr, 'dash').then((result) => {
//       return expect(result.data).to.be.above(0)
//     })
//   })

//   it('fetches the nano/xrb address', function () {
//     var addr = 'xrb_3decyj8e1kpzrthikh79x6dwhn8ei81grennibmt43mcm9o8fgxqd8t46whj'
//     this.timeout(15000)
//     return BlockchainExplorer.getAddressBalance(addr, 'raiblocks').then((result) => {
//       return expect(result.data).to.be.above(1000)
//     })
//   })

//   it('fetches the neo address', function () {
//     var addr = 'APRtV4r69uRjD1KeBrydZ82on8WxaZ9Jmo'
//     this.timeout(15000)
//     return BlockchainExplorer.getAddressBalance(addr, 'neo').then((result) => {
//       return expect(result.data).to.be.above(30)
//     })
//   })
//   it('fetches the xrp address', function () {
//     var addr = 'rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn'
//     this.timeout(15000)
//     return BlockchainExplorer.getAddressBalance(addr, 'ripple').then((result) => {
//       return expect(result.data).to.be.above(10)
//     })
//   })
//   it('fetches the stellar address', function () {
//     var addr = 'GDDNNC4SIEDN64YKJWN5VJH3OFMV4R3RWXRPT25BDR3T2HQWZMOWD6QJ'
//     this.timeout(15000)
//     return BlockchainExplorer.getAddressBalance(addr, 'stellar').then((result) => {
//       console.log(result)
//       return expect(result.data).to.be.above(1000)
//     })
//   })
//   it('fetches the erc20 address', function () {
//     var addr = '0x32be343b94f860124dc4fee278fdcbd38c102d88'
//     this.timeout(15000)
//     return BlockchainExplorer.getAddressBalance(addr, 'erc20').then((result) => {
//       return expect(result.data.length).to.be.above(10)
//     })
//   })
// })
