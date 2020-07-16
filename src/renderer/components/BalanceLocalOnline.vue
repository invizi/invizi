<!--
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
-->
<template>
  <div class="row">

    <div class="col-xl-5 mr-0" id="local-online-portfolio-chart"></div>

    <div class="col-xl-7 mb-r">

      <div class="card-body pb-0">

        <div class="row card-body pt-3">
          <table class="table large-header table-simple">
            <thead>
              <tr>
                <th></th>
                <th class="text-right">Percent</th>
                <th class="text-right" v-if="!inviziApp.stealthMode">Total USD</th>
              </tr>
            </thead>
            <tr v-for="(value, key) in balanceLocalOnline">
              <td class="text-left">{{key}}</td>
              <td class="text-right">{{balanceLocalOnline[key].percent | formatPercent}}</td>
              <td class="text-right" v-if="!inviziApp.stealthMode">{{balanceLocalOnline[key].totalUSD | currency}}</td>
            </tr>
          </table>
        </div>

      </div>

    </div>
    <!--Grid column-->

  </div>
</template>

<script>
 import Ticker from '@/components/Ticker'
 import BalanceHelper from '@/components/BalanceHelper'
 import PlotMixin from '@/components/PlotMixin'
 const _ = require('lodash')
 export default {
   props: ['balanceByExchange'],
   title: 'Local / Online',
   id: 'balance-local-online',
   mixins: [PlotMixin],
   data () {
     return {
       inviziApp: window.inviziApp
     }
   },
   watch: {
     balanceByExchange (newBalance) {
       if (!_.isEmpty(newBalance)) {
         this.plotPie('local-online-portfolio-chart', this.balanceLocalOnline, 1, 208)
       }
     }
   },
   computed: {
     balanceLocalOnline () {
       let discriminator = (key) => {
         let exchangeNames = Object.keys(Ticker.SUPPORTED_EXCHANGES)
         return exchangeNames.includes(key) ? 'online' : 'local'
       }
       let balance = _.mapValues(this.balanceByExchange, val => {
         return val.totalUSD
       })
       return BalanceHelper.balanceKeyDiscriminator(balance, discriminator)
     }
   },
   mounted () {
     this.plotPie('local-online-portfolio-chart', this.balanceLocalOnline, 1, 208)
   }
 }
</script>
