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
    <div style="display: flex; justify-content: center; align-items: center; height: 600px;" v-if="loading">
      <loader style="width: 50px; height: 50px;"/>
    </div>
    <div id="coin-historic" style="width: 100%;height:600px;"></div>
  </div>
</template>

<script>
 import InviziPlot from '@/components/InviziPlot'
 import Historical from '@/components/Historical'
 import AppMixin from '@/components/AppMixin'
 const moment = require('moment')
 let histoData
 export default {
   name: 'coin-historical',
   title: 'Historical',
   id: 'coin-historical',
   props: ['coinId'],
   mixins: [AppMixin],
   data () {
     return {
       loading: true,
       historical: null
     }
   },
   methods: {
     drawChart () {
       let historicalXAxisDates = histoData.price_usd.map((day) => {
         return moment(day[0], 'X').format('YYYY-MM-DD HH:mm:ss')
       })

       let balanceHistoricalUsd = histoData.price_usd.map((day) => {
         return day[1]
       })

       let balanceHistoricalBtc = histoData.price_btc.map((day) => {
         return day[1]
       })

       let trace1 = Object.assign({}, InviziPlot.usdTrace, {
         x: historicalXAxisDates,
         y: balanceHistoricalUsd
       })

       let trace2 = Object.assign({}, InviziPlot.btcTrace, {
         x: historicalXAxisDates,
         y: balanceHistoricalBtc
       })

       let layout = Object.assign({}, InviziPlot.historicalUsdBtcLayout)

       if (document.querySelector('#coin-historic')) {
         Plotly.newPlot('coin-historic', [trace1, trace2], layout, InviziPlot.commonArgOptions) // eslint-disable-line no-undef
         this.loading = false
       }
     }
   },
   mounted () {
     Historical.fetch(this.coinId).then((result) => {
       histoData = result
       this.drawChart()
     })
   }
 }
</script>
