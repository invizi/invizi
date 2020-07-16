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
  <section class="">
    <div class="full-bg-img flex-center">
      <div class="container">
        <div class="row" style="margin-bottom: 5rem;">
          <div class="col-lg-12">

            <!--Form with header-->
            <div class="card wow fadeIn" data-wow-delay="0.3s" style="animation-name: none; visibility: visible;">
              <div class="card-body">
                <div class="row">
                  <div class="col-lg-2">
                    <coin-image :coin-id='coin.coin_id'/>
                    {{coin.coin_id}} {{coin.symbol}}
                  </div>
                  <div class="col-lg-6">
                    <p>{{+coin.price_usd | currency}} USD</p>
                    <p>{{+coin.price_btc | formatBTC}} BTC</p>
                  </div>

                  <div class="col-lg-4 text-right" v-show="!(inviziApp && inviziApp.stealthMode) && balance && allBalances.USD && coin && balance[coin.coin_id]">
                    <h3 style="font-size: 1rem">Your Balance</h3>
                    <h4 style="font-size: 4rem"><span>{{balance[coin.coin_id]}}</span> {{ coin.symbol }}</h4>
                    <h5><i class="fa fa-dollar" title="dollar" style="margin-right: 2px"></i><animated-integer :value="allBalances.USD[coin.coin_id]" v-if="allBalances.USD && allBalances.USD[coin.coin_id]"></animated-integer></h5>
                    <h5><i class="fa fa-btc" title="bitcoin" style="margin-right: 2px"></i><animated-integer :value="allBalances.BTC[coin.coin_id]" :currency="'BTC'" v-if="allBalances.BTC && allBalances.BTC[coin.coin_id]"></animated-integer></h5>
                  </div>

                </div>
              </div>
            </div>
            <!--/Form with header-->
          </div>
        </div>

        <HorizontalTabs :comps="comps">
          <template v-slot:coin-attributes>
            <CoinAttributes :coin-id="coinId"/>
          </template>
          <template v-slot:coin-historical>
            <CoinHistorical :coin-id="coinId"/>
          </template>
          <template v-slot:coin-note>
            <CoinNote :coinId="coinId"/>
          </template>
        </HorizontalTabs>
      </div>
    </div>
  </section>
</template>

<script>
  import BalanceHelper from '@/components/BalanceHelper'
  import TradeClient from '@/components/TradeClient'
  import Ticker from '@/components/Ticker'
  import CoinAttributes from '@/components/CoinAttributes.vue'
  import CoinNote from '@/components/CoinNote.vue'
  import CoinImage from '@/components/CoinImage.vue'
  import HorizontalTabs from '@/components/HorizontalTabs'
  import CoinHistorical from '@/components/CoinHistorical'
  export default {
    name: 'coin',
    methods: {
      fetchBalance () {
        TradeClient.loadBalance().then((balance) => {
          this.balance = BalanceHelper.removeNegative(balance)
          this.allBalances = BalanceHelper.allBalances(this.balance, {removeZero: true})
        })
      }
    },
    components: {
      'coin-image': CoinImage,
      CoinAttributes,
      HorizontalTabs,
      CoinHistorical,
      CoinNote
    },
    data () {
      return {
        coin: {},
        inviziApp: window.inviziApp,
        balance: {},
        allBalances: {},
        comps: [CoinAttributes, CoinHistorical, CoinNote],
        coinId: this.$route.params.id
      }
    },
    beforeRouteUpdate (to, from, next) {
      this.coin = Ticker.coinById(to.params.id)
      this.coinId = this.coin.coin_id
      this.fetchBalance()
      next()
    },
    mounted () {
      this.coin = Ticker.coinById(this.$route.params.id)
      this.fetchBalance()
    }
  }
</script>
