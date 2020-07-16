<template>
  <div class="row">
    <div class="col-lg-12">

      <div class="">
        <div class="row">
          <div class="progress stylish-color" v-if="!hideLoadingHistorical"> <div class="indeterminate"></div> </div>
          <div class="col-lg-8" id="historic" style="padding-left: 0; padding-right: 0;"></div>
          <div class="col-lg-4" id="historicSlicePie" style=""></div>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
 import InviziCache from '@/components/InviziCache'
 import InviziTa from '@/components/InviziTa'
 import InviziPlot from '@/components/InviziPlot'
 import Settings from '@/components/Settings'
 import BalanceHelper from '@/components/BalanceHelper'
 const { ipcRenderer } = require('electron')
 const _ = require('lodash')
 const moment = require('moment')

 export default {
   title: 'Historical',
   id: 'historical',
   data () {
     return {
       hideLoadingHistorical: false,
       historicalData: null
     }
   },
   watch: {
     historicalData (newHistoricalData) {
       let historicalPlot = document.getElementById('historic')
       if (!historicalPlot || !this.historicalData) return
       let historicalPlotWidth
       if (historicalPlot) {
         historicalPlotWidth = historicalPlot.offsetWidth
       }

       // TODO refactor all bottom
       let trace1 = Object.assign({}, InviziPlot.usdTrace, {
         x: this.historicalData.historicalXAxisDates,
         y: this.historicalData.balanceHistorical.USD
       })

       let trace2 = Object.assign({}, InviziPlot.btcTrace, {
         x: this.historicalData.historicalXAxisDates,
         y: this.historicalData.balanceHistorical.BTC
       })

       let smaDuration = Settings.getSMADuration() || 9
       let sma = InviziTa.sma(trace1.y, smaDuration)
       let trace3 = Object.assign(InviziPlot.smaTrace(smaDuration), {
         x: this.historicalData.historicalXAxisDates,
         y: sma
       })

       let layout = Object.assign(
         {
           autosize: true,
           width: historicalPlotWidth,
           height: historicalPlotWidth
         },
         InviziPlot.historicalUsdBtcLayout)

       function plotHistoricalPie (dateIndex) {
         let pieElementId = 'historicSlicePie'
         let currentBalance = BalanceHelper.removeZeroCoins(newHistoricalData.balanceHistorical.raw.data[1][dateIndex])
         if (_.isEmpty(currentBalance)) return

         currentBalance = BalanceHelper.handleDustCoin(currentBalance)
         let labels = Object.keys(currentBalance)
         let dataPie = [Object.assign(
           InviziPlot.pieData(0, labels.length),
           {
             values: Object.values(currentBalance),
             labels: labels,
             type: 'pie'}
         )]

         let layoutPie = Object.assign({}, InviziPlot.pieLayout, {
           title: `${moment(newHistoricalData.historicalXAxisDates[dateIndex], 'YYYY-MM-DD HH:mm:ss').format('ll')}`
         })

         Plotly.newPlot(pieElementId, dataPie, layoutPie, InviziPlot.commonArgOptions) // eslint-disable-line no-undef
       }

       Plotly.newPlot('historic', [trace2, trace3, trace1], layout, InviziPlot.commonArgOptions) // eslint-disable-line no-undef

       plotHistoricalPie(this.historicalData.historicalXAxisDates.length - 1)
       historicalPlot.on('plotly_hover', function (clickData) {
         let currentIndex = clickData.points[0].pointIndex
         plotHistoricalPie(currentIndex)
       })
       this.hideLoadingHistorical = true
     }
   },
   mounted () {
     ipcRenderer.on('worker-response', (event, output) => {
       if (output.channel !== 'historical-computed') return
       this.historicalData = output.data
     })
     if (InviziCache.getItem('historicalData')) {
       this.historicalData = InviziCache.getItem('historicalData')
     } else {
       ipcRenderer.send('worker-request', {channel: 'compute-historical'})
     }
   }
 }
</script>
