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
import { Dep } from '@/utils/Dep.js'
const _ = require('lodash')

let cache = {} // TODO Use Map
let dependencies = {}

var InviziCache = {

  table: db.cache,

  getKeys () {
    return Object.keys(cache)
  },

  setItem (key, value, options = {}) {
    if (value === undefined) return undefined
    let oldValue = cache[key]

    cache[key] = value
    if (options.persistent) {
      // save in db
      db.cache.put({key: key, value: value})
    }

    let changed = !_.isEqual(oldValue, cache[key])
    if (changed && dependencies[key]) {
      dependencies[key].notify() // autorun anonymous function will rerun
    }

    return key
  },

  deleteItem (key, options = {}) {
    if (dependencies[key]) {
      dependencies[key].notify({negative: 'all'}) // autorun anonymous function will rerun
    }

    delete cache[key]
    if (options.persistent) {
      db.cache.delete(key)
    }
  },

  getItem (key) {
    dependencies[key] = dependencies[key] || new Dep()
    dependencies[key].depend()
    return cache[key]
  },

  addToCollection (key, items, options = {}) {
    if (!cache[key] || !_.isArray(cache[key])) {
      cache[key] = []
    }
    if (_.isEmpty(items)) return cache[key]

    cache[key]._counterNumber = cache[key]._counterNumber || 1
    // Generate new Id if not present
    items.forEach(item => {
      if (!item.id) {
        item.id = cache[key]._counterNumber
        cache[key]._counterNumber++
      }
    })
    let result = cache[key].concat(items)
    result._counterNumber = cache[key]._counterNumber
    cache[key] = result
    let changed = items.length > 0
    if (changed && dependencies[key]) {
      dependencies[key].notify({positive: items}) // autorun anonymous function will rerun
    }

    if (options.persistent) {
      // save in db
      db.cache.put({key: key, value: cache[key]})
    }
    return cache[key]
  },

  // items = array of ids or array of objects
  removeFromCollection (key, items, options = {}) {
    if (!cache[key] || !_.isArray(cache[key])) {
      cache[key] = []
    }
    if (_.isEmpty(items)) return cache[key]
    let initialLength = cache[key].length

    _.remove(cache[key], item => items.includes(item.id))

    let changed = cache[key].length !== initialLength
    if (changed && dependencies[key]) {
      dependencies[key].notify({negative: items}) // autorun anonymous function will rerun
    }

    if (options.persistent) {
      // save in db
      db.cache.put({key: key, value: cache[key]})
    }

    return cache[key]
  },

  // items = array of ids or array of objects
  updateCollection (key, items, options = {}) {
    if (!cache[key] || !_.isArray(cache[key])) {
      cache[key] = []
    }
    if (_.isEmpty(items)) return cache[key]

    // Go through items and update by id
    let changed
    cache[key].forEach(item => {
      if (!item.id) return
      let found = _.find(items, {id: item.id})
      if (!found) return
      // update the object
      Object.assign(item, found)
      changed = true
    })

    if (changed && dependencies[key]) {
      dependencies[key].notify({update: items}) // autorun anonymous function will rerun
    }

    return cache[key]
  },

  async getItemFromDbCache (key, options = {}) {
    let result = await db.cache.where({key: key}).toArray()
    return (result[0] && result[0].value) || undefined
  },

  async fromDbCacheToCache (key) {
    let result = await db.cache.where({key: key}).toArray()
    return this.setItem(key, (result && result[0] && result[0].value) || undefined)
  },

  async loadDbToMemory () {
    let data = await db.cache.toArray()
    data.forEach((o) => {
      cache[o.key] = o.value
    })
    return cache
  }
}

export default InviziCache
