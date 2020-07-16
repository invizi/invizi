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
const CACHE_PATH = 'Settings'

let Settings = {
  saveAltCurrency: function (currency) {
    InviziCache.setItem('Settings.alternateCurrency', currency, {persistent: true})
    return currency
  },

  saveSMADuration: function (duration) {
    InviziCache.setItem('Settings.smaDuration', duration, {persistent: true})
    return duration
  },

  getSMADuration: function (duration) {
    return InviziCache.getItem('Settings.smaDuration')
  },

  save (key, value) {
    InviziCache.setItem(`${CACHE_PATH}.${key}`, value, {persistent: true})
  },

  reset (key) {
    InviziCache.deleteItem(`${CACHE_PATH}.${key}`, {persistent: true})
  },

  get (key) {
    return InviziCache.getItem(`${CACHE_PATH}.${key}`)
  },

  getAltCurrencyIconClass () {
    let CURRENCY_CLASS = {
      eur: 'euro'
    }
    var alt = this.get('alternateCurrency')
    var result
    if (alt) {
      var mapping = (CURRENCY_CLASS[alt.toLowerCase()] || alt.toLowerCase())
      result = `fa-${mapping}`
    }
    return result
  }
}

export default Settings
