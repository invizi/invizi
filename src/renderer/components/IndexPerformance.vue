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
    <br>
    <div class="row col-lg" v-if="value && performanceAllTime">
      <p style="width:100%;">invested: {{value.initialAmount | currency}}</p>
      <p style="width:100%;">current total: {{currentTotal | currency}}</p>
      <p style="width:100%;">performance:
        <span v-redgreen="performanceAllTime">
          <percent :value="performanceAllTime"/>
        </span>
        <span>{{currentTotal - value.initialAmount | currency}}</span>
      </p>
    </div>
    <loader style="width: 30px; height: 30px;" v-if="!performanceAllTime"/>
    <div class="row">
      <div class="col-lg-8" id="index-performance" style=""></div>
      <div class="col-lg-4" id="index-performance-pie" style=""></div>
    </div>
  </div>
</template>

 <script>
  import AssetIndex from '@/components/AssetIndex'
  import InviziPlot from '@/components/InviziPlot'
  import InviziTa from '@/components/InviziTa'
  import InviziCalc from '@/components/InviziCalc'
  import BalanceHelper from '@/components/BalanceHelper'
  import AppMixin from '@/components/AppMixin'
  import Settings from '@/components/Settings'

  const moment = require('moment')
  const _ = require('lodash')
  export default {
    props: ['value'],
    name: 'index-performance',
    mixins: [AppMixin],
    data () {
      return {
        initialValue: 1000,
        currentTotal: undefined,
        performanceAllTime: undefined,
        historical: [],
        balance: {}
      }
    },
    watch: {
      value (newValue) {
        // Calculate initial balance from intial amount (ex: $1000)
        if (this.value) {
          let initialAmount = this.value.initialAmount || 1000
          let startDate = this.value.startDate || moment().subtract(6, 'months').unix()
          AssetIndex.loadIndexHistoricalBalance(newValue.composition, initialAmount, startDate).then(data => {
            let historicalPlot = document.getElementById('index-performance')
            let historicalPlotWidth
            if (historicalPlot) {
              historicalPlotWidth = historicalPlot.offsetWidth
            }

            let balanceHistoricalUsd = _.map(data[1], (o) => { return BalanceHelper.totalFromObject(o) })
            let historicalXAxisDates = _.map(data[0], (o) => { return moment(o, 'X').format('YYYY-MM-DD HH:mm:ss') })
            let trace1 = {
              type: 'scatter',
              mode: 'lines',
              name: 'USD',
              x: historicalXAxisDates,
              y: balanceHistoricalUsd,
              marker: {
                color: 'hsl(0, 100%, 05%)',
                size: 12
              },
              line: {
                color: 'hsl(120, 100%, 75%)',
                width: 1
              }
            }
            this.currentTotal = _.last(balanceHistoricalUsd)
            this.performanceAllTime = InviziCalc.divide(_.last(balanceHistoricalUsd) - _.first(balanceHistoricalUsd), _.first(balanceHistoricalUsd))

            BalanceHelper.balanceUSDtoBTCHistorical(data[1], data[0]).then((result) => {
              let balanceHistoricalBtc = _.map(result, (o) => { return BalanceHelper.totalFromObject(o) })
              let trace2 = {
                type: 'scatter',
                mode: 'lines',
                name: 'BTC',
                yaxis: 'y2',
                x: historicalXAxisDates,
                y: balanceHistoricalBtc,
                line: {
                  color: 'hsl(52, 91%, 65%)',
                  width: 1
                }
              }

              let smaDuration = Settings.getSMADuration() || 9
              let sma = InviziTa.sma(trace1.y, smaDuration)
              let trace3 = {
                type: 'scatter',
                mode: 'lines',
                name: `SMA(${smaDuration})`,
                yaxis: 'y1',
                x: historicalXAxisDates,
                y: sma,
                line: {
                  color: 'hsl(102, 21%, 66%)',
                  width: 1
                }
              }

              let layout = Object.assign(
                {
                  width: historicalPlotWidth,
                  height: historicalPlotWidth
                },
                InviziPlot.historicalUsdBtcLayout)

              function plotHistoricalPie (dateIndex) {
                let pieElementId = 'index-performance-pie'
                let currentBalance = BalanceHelper.removeZeroCoins(data[1][dateIndex])
                if (_.isEmpty(currentBalance)) return

                let dataPie = [Object.assign(
                  InviziPlot.pieData(),
                  {
                    values: Object.values(currentBalance),
                    labels: Object.keys(currentBalance),
                    text: Object.keys(currentBalance),
                    hole: 0.7,
                    type: 'pie'}
                )]
                dataPie[0].marker.colors = InviziPlot.rainbow(25)

                let placeholderWidth = document.getElementById(pieElementId).offsetWidth
                let layoutPie = Object.assign({}, InviziPlot.pieLayout, {
                  title: `${moment(historicalXAxisDates[dateIndex], 'YYYY-MM-DD HH:mm:ss').format('ll')}`,
                  width: placeholderWidth,
                  height: placeholderWidth
                })

                Plotly.newPlot(pieElementId, dataPie, layoutPie, InviziPlot.commonArgOptions) // eslint-disable-line no-undef
              }

              Plotly.newPlot('index-performance', [trace2, trace3, trace1], layout, InviziPlot.commonArgOptions) // eslint-disable-line no-undef

              plotHistoricalPie(historicalXAxisDates.length - 1)
              historicalPlot.on('plotly_hover', function (clickData) {
                let currentIndex = clickData.points[0].pointIndex
                plotHistoricalPie(currentIndex)
              })
            })
          })
        }
      }
    }
  }
 </script>
