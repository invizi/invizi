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
    <div class="col-xl-5" id="full-portfolio-chart"> </div>

    <div class="col-xl-7">
      <div class="row">
        <table class="table large-header table-simple">
          <thead>
            <tr>
              <th></th>
              <th class="text-right" v-if="!inviziApp.stealthMode">Quantity</th>
              <th class="text-right">Price</th>
              <th class="text-right">Percent</th>
              <th class="text-right" v-if="!inviziApp.stealthMode">Total BTC</th>
              <th class="text-right" v-if="!inviziApp.stealthMode">Total USD</th>
            </tr>
          </thead>
          <tr v-for="(value, key) in balanceByCoin" :class="{'text-grayed': key === 'dust'}">
            <td class="title-font">
              <coin-image-text :coin-id='key' :label="key"/>
            </td>
            <td class="text-right" v-if="!inviziApp.stealthMode"><span v-if="key !== 'dust'">{{balanceByCoin[key]['quantity'] | amount }}</span></td>
            <td class="text-right"><span v-if="key !== 'dust'">${{balanceByCoin[key]['price'] | toTwoDecimals }}</span></td>
            <td class="text-right">{{balanceByCoin[key]['percent'] | formatPercent}}</td>
            <td class="text-right" v-if="!inviziApp.stealthMode"><i class="fa fa-btc" title="bitcoin" style="margin-right: 2px"></i>{{balanceByCoin[key]['totalBTC'] | formatBTC}}</td>
            <td class="text-right" v-if="!inviziApp.stealthMode" >{{balanceByCoin[key]['totalUSD'] | currency}}</td>
          </tr>
        </table>
      </div>

    </div>
  </div>
</template>

<script>
 import PlotMixin from '@/components/PlotMixin'
 import TradeClient from '@/components/TradeClient'
 import EventBus from '@/components/EventBus'
 import CoinImageText from '@/components/CoinImageText'

 export default {
   title: 'Coins',
   id: 'balance-by-coin',
   mixins: [PlotMixin],
   components: {
     'coin-image-text': CoinImageText
   },
   data () {
     return {
       inviziApp: window.inviziApp,
       balanceByCoin: {}
     }
   },
   watch: {
     balanceByCoin () {
       this.plotPie('full-portfolio-chart', this.balanceByCoin, 0)
     }
   },
   methods: {
     getBalancePerCoin () {
       return TradeClient.getBalancePerCoin().then(result => {
         this.balanceByCoin = result
       })
     }
   },
   mounted () {
     this.getBalancePerCoin()
     EventBus.$on('Ticker/get', (ticker) => {
       this.ticker = ticker.data
       if (this.$router.history.current.name === 'main-dashboard') {
         this.getBalancePerCoin()
       }
     })
   }
 }
</script>
