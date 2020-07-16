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
import CoinAttributes from '@/components/CoinAttributes'

const _ = require('lodash')

function randomize (name) {
  return `${name}_${Math.random().toFixed(4)}`
}

const riskName = randomize('risk')
const codeName = randomize('code')
const teamName = randomize('team')

describe('CoinAttributes', () => {
  it('saves new definition', async function () {
    let newAttribute = {name: riskName}
    let definitions = await CoinAttributes.addAttribute(newAttribute)
    expect(_.isEmpty(definitions)).to.be.equal(false)
    expect(definitions.value.length === 1).to.be.equal(true)
    expect(_.isEqual(newAttribute, definitions.value[0])).to.be.equal(true)
  })

  it('saves more definitions', async function () {
    let definitions = await CoinAttributes.addAttribute({name: codeName})
    definitions = await CoinAttributes.addAttribute({name: teamName})
    expect(_.isEmpty(definitions)).to.be.equal(false)
    expect(definitions.value.length === 3).to.be.equal(true)
    expect(!!_.find(definitions.value, {name: codeName})).to.be.equal(true)
    expect(!!_.find(definitions.value, {name: teamName})).to.be.equal(true)
  })

  it('deletes definition', async function () {
    let definitions = await CoinAttributes.deleteAttribute(codeName)
    expect(_.isEmpty(definitions)).to.be.equal(false)
    expect(definitions.value.length === 2).to.be.equal(true)
    expect(!!_.find(definitions.value, {name: codeName})).to.be.equal(false)
    expect(!!_.find(definitions.value, {name: teamName})).to.be.equal(true)
  })

  it('saves coin attributes', async function () {
    let data1 = {
      coinId: 'bitcoin',
      values: [20, 4]
    }
    let coinId = await CoinAttributes.save(data1.coinId, data1.values)
    expect(coinId).to.be.equal(data1.coinId)
    let result = await CoinAttributes.get('bitcoin')
    expect(result.data.length).to.be.equal(1)
    expect(_.isEqual(result.data[0].values, data1.values)).to.be.equal(true)
  })
})
