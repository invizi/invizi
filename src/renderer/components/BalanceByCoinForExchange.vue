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
    <table class="table large-header table-simple table-narrow col-lg-7 offset-2"  v-if="balanceByCoin">
      <thead>
        <tr>
          <th></th>
          <th class="text-right" v-if="!inviziApp.stealthMode">Quantity</th>
          <th class="text-right" v-if="!inviziApp.stealthMode">Total BTC</th>
          <th class="text-right" v-if="!inviziApp.stealthMode">Total USD</th>
        </tr>
      </thead>
      <tr v-for="coin in sortedBalance" :class="{'text-grayed': coin.coin_id === 'dust'}">
        <td class="title-font">
          <coin-image-text :coin-id='coin.coin_id' :label="coin.coin_id"/>
        </td>
        <td class="text-right" ><span v-if="coin.coin_id !== 'dust'">{{coin.quantity | amount }}</span></td>
        <td class="text-right"><i class="fa fa-btc" title="bitcoin" style="margin-right: 2px"></i>{{coin.btc | formatBTC}}</td>
        <td class="text-right"><span v-if="coin.coin_id !== 'dust'">{{coin.usd | amount }}</span></td>
      </tr>
    </table>
  </div>
</template>

<script>
 import CoinImageText from '@/components/CoinImageText'
 import PlotMixin from '@/components/PlotMixin'

 export default {
   title: 'Coins',
   props: ['balanceByCoin'],
   mixins: [PlotMixin],
   components: {
     'coin-image-text': CoinImageText
   },
   data () {
     return {
       inviziApp: window.inviziApp
     }
   },
   computed: {
     sortedBalance () {
       let result = []
       Object.keys(this.balanceByCoin.USD).forEach(key => {
         result.push({
           usd: this.balanceByCoin.USD[key],
           quantity: this.balanceByCoin.coins[key],
           btc: this.balanceByCoin.BTC[key],
           coin_id: key
         })
       })

       result.sort((a, b) => {
         if (a.usd < b.usd) {
           return 1
         } else if (a.usd > b.usd) {
           return -1
         } else {
           return 0
         }
       })
       return result
     }
   }
 }
</script>

<style scoped lang="scss">
 .table-narrow {
   td {
     padding: 0.5rem;
   }
 }

 table.table.table-narrow thead tr {
   height: 100%;
 }
 .coinImage {
   width: 25px;
   height: 25px;
 }
</style>
