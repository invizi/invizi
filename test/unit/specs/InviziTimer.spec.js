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
import InviziTimer from '@/components/InviziTimer'
import db from '@/components/EncryptedDatabase'
import UserManager from '@/components/UserManager'
import { sha256 } from '@/components/InviziCrypto'

describe('InviziTimer', () => {
  before(function (done) {
    db.coinAttributes.clear().then(done, done)
    UserManager.hashedPassword = sha256('myPassword').toString()
  })
  it('sequences function call', async function () {
    this.timeout(25000)
    let testCases = [['a', 'b', 'c', 'd'],
      ['a']
    ]

    let result = {}
    let lastCallTime = performance.now()
    let interval = 500
    let testFunc = (character) => {
      result[character] = true
      let dur = performance.now() - lastCallTime
      console.log(dur)
      if (Object.keys(result).length > 1) {
        expect(Math.abs(dur - interval)).to.be.below(30)
      }
      lastCallTime = performance.now()
      console.log(result)
    }

    for (let testArgs of testCases) {
      let start = performance.now()
      let results = await InviziTimer.sequence(testFunc, testArgs, interval, this)
      let executed = results.length
      let end = performance.now()
      let duration = end - start
      // console.log(duration)
      expect(Math.abs(interval * (testArgs.length - 1) - duration)).to.be.below(31)
      // console.log(`Duration: ${end - start}`)
      expect(executed).to.be.equal(testArgs.length)
      result = {}
      lastCallTime = performance.now()
    }
  })
})
