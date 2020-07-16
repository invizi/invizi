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
  <div>
    <div style="display: flex; justify-content: center; align-items: center;" v-if="!historicalData">
      <loader style="width: 50px; height: 50px;"/>
    </div>
    <div class="row">
      <div class="col-lg-6" id="performance-chart"> </div>
      <div class="col-lg-5">
        <table class="table large-header table-simple text-center" v-if="historicalData" style="margin-top: 100px;">
          <thead>
            <tr>
              <th style="min-width: 100px" v-for="perfKey in DATE_NAMES">{{perfKey | dateNameDisplay}}</th>
              <th></th>
            </tr>
          </thead>
          <tr>
            <td v-for="perfKey in DATE_NAMES" v-if="historicalData" class="grey-text" :class="{'green-text': historicalData && historicalData.performance.USD[perfKey] > 0, 'red-text': historicalData && historicalData.performance.USD[perfKey] < 0}">
              <percent :value="historicalData.performance.USD[perfKey]"/>
            </td>
            <td> <i class="fa fa-dollar" title="dollar" style="margin-right: 2px"/> </td>
          </tr>
          <tr class="no-border">
            <td v-if="historicalData" v-for="perfKey in DATE_NAMES" :class="{'green-text': historicalData && historicalData.performance.BTC[perfKey] > 0, 'red-text': historicalData && historicalData.performance.BTC[perfKey] < 0}">
              <percent :value="historicalData.performance.BTC[perfKey]"/>
            </td>
            <td><i class="fa fa-btc" title="bitcoin" style="margin-right: 2px"/></td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
 import EventBus from '@/components/EventBus'
 import InviziCache from '@/components/InviziCache'
 import AppMixin from '@/components/AppMixin'
 import PlotMixin from '@/components/PlotMixin'
 import TradeClient from '@/components/TradeClient'
 export default {
   mixins: [AppMixin, PlotMixin],
   title: 'Performance',
   id: 'historical-performance',
   data () {
     return {
       historicalData: null,
       DATE_NAMES: TradeClient.DATE_NAMES
     }
   },
   watch: {
     historicalData () {
       const labels = TradeClient.DATE_NAMES.map(name => name.replace('_', ' '))
       const btcValues = TradeClient.DATE_NAMES.map(name => this.historicalData.performance.BTC[name] * 100)
       const usdValues = TradeClient.DATE_NAMES.map(name => this.historicalData.performance.USD[name] * 100)
       let data = [
         {
           name: 'Bitcoin',
           x: labels,
           y: btcValues
         },
         {
           name: 'Usd',
           x: labels,
           y: usdValues
         }
       ]

       const usdColor = 'hsl(120, 100%, 75%)'
       const usdColorDark = 'hsl(120, 31%, 75%)'
       const btcColor = 'hsl(52, 91%, 65%)'
       const btcColorDark = 'hsl(52, 31%, 65%)'
       const colorMap = [{positive: btcColor, negative: btcColorDark}, {positive: usdColor, negative: usdColorDark}]

       this.plotBarChart('performance-chart', data, colorMap)
     }
   },
   mounted () {
     if (InviziCache.getItem('historicalData')) {
       this.historicalData = InviziCache.getItem('historicalData')
     }
     EventBus.$once('update/historicalData', () => {
       this.historicalData = InviziCache.getItem('historicalData')
     })
   }
 }
</script>
