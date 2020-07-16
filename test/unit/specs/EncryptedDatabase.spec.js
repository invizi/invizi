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
import db from '@/components/EncryptedDatabase'
import CoinAttributes from '@/components/CoinAttributes'
import UserManager from '@/components/UserManager'
import _ from 'lodash'

import { sha256 } from '@/components/InviziCrypto'

describe('Encrypted Database', function () {
  before(function (done) {
    UserManager.hashedPassword = sha256('myPassword').toString()
    db.coinAttributes.clear().then(done, done)
  })

  it('saves new definition then delete', async function () {
    let newAttribute = {'name': 'risk'}
    let definitions = await CoinAttributes.addAttribute(newAttribute)
    console.log(definitions)
    console.log(JSON.stringify(definitions.value))
    console.log(JSON.stringify(_.last(definitions.value)))
    expect(_.isEmpty(definitions)).to.be.equal(false)
    expect(_.isEqual(newAttribute, _.last(definitions.value))).to.be.equal(true)
  })
})
