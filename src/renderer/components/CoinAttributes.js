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
import db from '@/components/InviziDatabase'
const _ = require('lodash')

let CoinAttributes = {
  name: 'CoinAttributes',

  table: db.coinAttributes,

  async get (coinId) {
    let definitions = await db.coinAttributesDefinition.toArray()
    let definition = definitions[0]
    let coinAttributes
    if (!coinId) {
      coinAttributes = await this.table.toArray()
    } else {
      let all = await this.table.toArray()
      coinAttributes = [_.find(all, {coinId: coinId})]
    }
    return {
      definition: definition,
      data: coinAttributes
    }
  },

  async getDefinitions () {
    let dbResult = await db.coinAttributesDefinition.toArray()
    return dbResult[0] || []
  },

  async addAttribute (newAttribute) {
    if (_.isEmpty(newAttribute) || _.isEmpty(newAttribute.name)) {
      throw new Error('Invalid definition.')
    }
    let dbResult = await db.coinAttributesDefinition.toArray()
    let definitions = dbResult[0]
    if (_.isEmpty(definitions)) {
      definitions = {name: 'custom', value: []}
    }
    if (_.find(definitions.value, {name: newAttribute.name})) {
      throw new Error(`${newAttribute.name} already exists.`)
    }
    definitions.value.push(newAttribute)
    await db.coinAttributesDefinition.put(definitions)
    // When adding a coin attribute, set its value to 0
    let coins = await db.coinAttributes.toArray()
    for (let coin of coins) {
      coin.values.push(0)
      await CoinAttributes.save(coin.coinId, coin.values)
    }
    return definitions
  },

  async deleteAttribute (attributeName) {
    if (_.isEmpty(attributeName)) {
      throw new Error('Invalid definition name.')
    }
    let dbResult = await db.coinAttributesDefinition.toArray()
    let definitions = dbResult[0]
    const deletedIndex = _.findIndex(definitions.value, {name: attributeName})
    _.remove(definitions.value, {name: attributeName})
    await db.coinAttributesDefinition.put(definitions)
    // After deleting the coin attribute, delete its value
    let coins = await db.coinAttributes.toArray()
    for (let coin of coins) {
      coin.values.splice(deletedIndex, 1)
      await CoinAttributes.save(coin.coinId, coin.values)
    }
    return definitions
  },

  async setDefaultAttributes () {
    const definitions = await this.getDefinitions()
    if (Array.isArray(definitions) && definitions.length === 0) {
      const defaultAttributes = ['Team', 'Coin Age', 'Marketing', 'Upside', 'Domain']
      for (let defaultAttribute of defaultAttributes) {
        await this.addAttribute({name: defaultAttribute})
      }
    }
  },

  async restoreDefaultAttributes () {
    const definitions = await this.getDefinitions()
    definitions.value = []
    const defaultAttributes = ['Team', 'Coin Age', 'Marketing', 'Upside', 'Domain']
    for (let defaultAttribute of defaultAttributes) {
      definitions.value.push({name: defaultAttribute})
    }
    await db.coinAttributesDefinition.update('custom', definitions)
    // Set all attribute values to zero for all coins
    let coins = await db.coinAttributes.toArray()
    coins.forEach(coin => db.coinAttributes.delete(coin.coinId))
  },

  async save (coinId, attributeValues) {
    let dbResult = await this.table.put({coinId: coinId, values: attributeValues})
    return dbResult
  },

  radarData (attributes, attributesValue) {
    if (!attributes) return []
    return attributes.map((attribute, index) => {
      return {
        axis: attribute.name,
        order: index,
        value: attributesValue[index]
      }
    })
  }
}

export default CoinAttributes
