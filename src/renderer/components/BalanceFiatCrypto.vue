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

    <div class="col-xl-5 mr-0" id="fiat-crypto-portfolio-chart"></div>

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
            <tr v-for="(value, key) in balanceFiatCrypto">
              <td class="text-left">{{key}}</td>
              <td class="text-right">{{balanceFiatCrypto[key].percent | formatPercent}}</td>
              <td class="text-right" v-if="!inviziApp.stealthMode">{{balanceFiatCrypto[key].totalUSD | currency}}</td>
            </tr>
          </table>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
 import PlotMixin from '@/components/PlotMixin'
 import Forex from '@/components/Forex'
 import BalanceHelper from '@/components/BalanceHelper'
 export default {
   title: 'Fiat / Crypto',
   id: 'balance-fiat-crypto',
   props: ['balanceUsd'],
   mixins: [PlotMixin],
   data () {
     return {
       inviziApp: window.inviziApp
     }
   },
   watch: {
     balanceUsd () {
       this.plotPie('fiat-crypto-portfolio-chart', this.balanceFiatCrypto, 3)
     }
   },
   computed: {
     balanceFiatCrypto () {
       let discriminator = (key) => {
         return Forex.isStableCoinOrFiat(key) ? 'fiat' : 'crypto'
       }
       console.log(this.balanceUsd)
       return BalanceHelper.balanceKeyDiscriminator(this.balanceUsd, discriminator)
     }
   },
   mounted () {
     this.plotPie('fiat-crypto-portfolio-chart', this.balanceFiatCrypto, 3)
   }
 }
</script>
