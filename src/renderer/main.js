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

import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import './filters/Currency.js'
import './filters/StorageFilters.js'
import './filters/DateFilters.js'
import InviziCache from './components/InviziCache'
import CoinAttributes from './components/CoinAttributes'
import Ticker from './components/Ticker'
import Forex from './components/Forex'
import TradeClient from './components/TradeClient'
import EventBus from '@/components/EventBus'
import InviziStorage from '@/utils/InviziStorage'
import InviziDirectives from '@/components/InviziDirectives'
import DataManager from '@/managers/DataManager'
import CurrencyManager from '@/components/CurrencyManager'

const TWEEN = require('@tweenjs/tween.js')
const math = require('mathjs')
const _ = require('lodash')

require('dotenv').config()
DataManager.init()

// Get old Ticker from db cache
performance.mark('mark1')
InviziStorage.initStoragePersistence()
EventBus.$once('Forex/get', (data) => {
  math.createUnit(data.base.toLowerCase())
  Object.keys(data.rates).forEach(function (currency) {
    math.createUnit(currency.toLowerCase(), math.unit(1 / data.rates[currency], data.base.toLowerCase()))
  })
  CurrencyManager.init()
})

InviziCache.loadDbToMemory().then((val) => {
  // InviziCache.fromDbCacheToCache('Forex.get')
  Forex.get({persistent: true})
  Ticker.get({persistent: true})
  TradeClient.table.toArrayRaw().then(result => {
    InviziCache.setItem('TradeClient.trades.toArrayRaw()', result)
  })
  Vue.use(Vuetify, {
    theme: {
      primary: '#4edeff'
      // secondary: '#b0bec5',
      // accent: '#8c9eff',
      // error: '#b71c1c'
    }
  })
  if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
  Vue.http = Vue.prototype.$http = axios
  Vue.config.productionTip = false

  /* eslint-disable no-new */

  InviziDirectives.init()
  Vue.filter('formatPercent', function (value) {
    if (_.isFinite(value)) {
      let fractionDigits = 2
      return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: fractionDigits }).format(value)
    } else {
      return value
    }
  })

  Vue.filter('number', function (value, defaultValue) {
    let defau = defaultValue || ''
    let result = parseFloat(value)
    if (isNaN(result)) return defau
    return result
  })

  Vue.component('percent', {
    template: '<span v-if="value">{{value | formatPercent }}</span><span v-else>{{emptyValue}}</span>',
    props: {
      value: {
        required: true
      },
      emptyValue: {
        default: '-',
        required: false
      }
    }
  })

  Vue.component('animated-integer', {
    template: '<span :style="{ backgroundColor: backgroundCssColor, color: colorCssColor }">{{ tweeningValue }}</span>',
    props: {
      value: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD',
        required: false
      }
    },
    data: function () {
      return {
        tweeningValue: 0,
        backgroundCssColor: null,
        colorCssColor: null
      }
    },
    watch: {
      value: function (newValue, oldValue) {
        if (newValue < oldValue) {
          // Set red
          this.backgroundCssColor = '#fc4465'
          this.colorCssColor = '#bf1331'
        } else {
          // Set green
          this.backgroundCssColor = '#26f263'
          this.colorCssColor = '#0ba037'
        }
        setTimeout(() => {
          this.backgroundCssColor = ''
          this.colorCssColor = ''
        }, 500)
        this.tween(oldValue, newValue)
      }
    },
    mounted: function () {
      this.tween(this.value, this.value)
    },
    methods: {
      tween: function (startValue, endValue) {
        var vm = this
        function animate () {
          if (TWEEN.update()) {
            requestAnimationFrame(animate)
          }
        }

        new TWEEN.Tween({ tweeningValue: startValue })
          .to({ tweeningValue: endValue }, 500)
          .onUpdate(function (object) {
            if (object.tweeningValue) {
              if (vm.currency === 'BTC') {
                vm.tweeningValue = object.tweeningValue.toFixed(8)
              } else {
                vm.tweeningValue = object.tweeningValue.toFixed(2)
              }
            } else {
              vm.tweeningValue = 0
            }
          })
          .start()

        animate()
      }
    }
  })

  let Invizi = {}

  function showPerformanceMarks () {
    // Display each mark using getEntriesByType()
    let entries = performance.getEntriesByType('mark')
    for (let i = 0; i < entries.length; i++) {
      if (i === 0) console.log("= getEntriesByType('mark')", 0)
      let duration = (i !== 0 ? entries[i].startTime - entries[i - 1].startTime : 0)
      console.log('... [' + i + '] = ' + entries[i].name, entries[i].startTime, duration)
    }
  }
  Invizi.showPerformanceMarks = showPerformanceMarks

  Invizi.isDev = function () {
    return process.mainModule.filename.indexOf('app.asar') === -1
  }

  window.Invizi = Invizi

  window.inviziApp = { // TODO move to Invizi object above
    stealthMode: InviziCache.getItem('Settings.stealthMode') || false
  }

  if (this) {
    this.inviziApp = window.inviziApp
  }

  CoinAttributes.setDefaultAttributes()

  new Vue({
    components: { App },
    router,
    template: '<App/>'
  }).$mount('#app')
})
