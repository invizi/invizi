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

    <!--Main layout-->
    <div class="container-fluid text-center" v-show="!hasTrades && !loading" style="display: none; display: flex; justify-content: center; align-items: center; height: 100vh">
      <div>You have no transactions yet.</div>
      <div>
        <router-link to="/accounts/local1" class="btn btn-primary btn-sm nav-link waves-effect">Start</router-link>
      </div>
    </div>

    <div :class="{invisible: !hasTrades}">

      <section style="margin-bottom: 5rem; margin-top: 5rem;">

        <div class="row">
          <div class="col-7">
            <LogoTitle style="color: #929292;"/>

          </div>
          <div class="col-lg-4 text-right" v-show="!inviziApp.stealthMode">
            <div class="big-title">$<animated-integer :value="totalBalanceInUSD" v-if="totalBalanceInUSD"></animated-integer></div>
            <h5 v-if="altCurrencyMultiplier != 1"><i :class="['fa', altCurrencyIconClass]" title="" style="margin-right: 2px"></i><animated-integer :value="totalBalanceInUSD * altCurrencyMultiplier" v-if="altCurrencyMultiplier !== 1 && totalBalanceInUSD"></animated-integer></h5>
            <h5><i class="fa fa-btc" title="bitcoin" style="margin-right: 2px"></i><animated-integer :value="totalBalanceInBTC" :currency="'BTC'" v-if="totalBalanceInBTC"></animated-integer></h5>
          </div>

        </div>

      </section>
      <!--Section: Intro-->

      <HorizontalTabs :comps="comps">
        <template v-slot:historical>
          <Historical/>
        </template>

        <template v-slot:balance-by-coin>
          <BalanceByCoin/>
        </template>

        <template v-slot:balance-by-exchange>
          <BalanceByExchange :balanceByExchange="balanceByExchange"/>
        </template>

        <template v-slot:balance-fiat-crypto>
          <BalanceFiatCrypto :balanceUsd="allBalances.USD"/>
        </template>

        <template v-slot:balance-local-online>
          <BalanceLocalOnline :balanceByExchange="balanceByExchange"/>
        </template>

        <template v-slot:historical-performance>
          <HistoricalPerformanceTable/>
        </template>

      </HorizontalTabs>

    </div>

  </div>

</template>

<script>
  import BalanceHelper from '@/components/BalanceHelper'
  import TradeClient from '@/components/TradeClient'
  import EventBus from '@/components/EventBus'
  import Settings from '@/components/Settings'
  import Performance from '@/components/Performance'
  import Ticker from '@/components/Ticker'
  import Forex from '@/components/Forex'
  import InviziPlot from '@/components/InviziPlot'
  import LogoTitle from '@/components/LogoTitle'
  import AppMixin from '@/components/AppMixin'
  import BalanceLocalOnline from '@/components/BalanceLocalOnline'
  import BalanceFiatCrypto from '@/components/BalanceFiatCrypto'
  import BalanceByExchange from '@/components/BalanceByExchange'
  import BalanceByCoin from '@/components/BalanceByCoin'
  import Historical from '@/components/Historical.vue'
  import HistoricalPerformanceTable from '@/components/HistoricalPerformanceTable'
  import HorizontalTabs from '@/components/HorizontalTabs'

  const _ = require('lodash')
  export default {
    name: 'main-dashboard',
    mixins: [AppMixin],
    components: {
      HorizontalTabs,
      BalanceLocalOnline,
      BalanceFiatCrypto,
      BalanceByExchange,
      BalanceByCoin,
      Historical,
      LogoTitle,
      HistoricalPerformanceTable
    },
    data () {
      return {
        loading: true,
        comps: [Historical, BalanceByCoin, BalanceByExchange, BalanceFiatCrypto, BalanceLocalOnline, HistoricalPerformanceTable],
        inviziApp: window.inviziApp,
        avg: {},
        ticker: [],
        altCurrencyIconClass: null,
        balance: {},
        allBalances: {},
        balanceByExchange: {},
        balanceFiatCoin: {},
        balanceUSD: null,
        totalUSD: null,
        altCurrency: null,
        altCurrencyMultiplier: 1,
        performance: {},
        performanceBtc: {}
      }
    },
    methods: {
      allTimePerf () {
        TradeClient.all().then(trades => {
          let filteredTrades = trades.filter(trade => !Forex.isFiat(trade.to))
          this.avg = Performance.averageBuyingPriceAll(filteredTrades)
        })
      },
      fetch () {
        performance.mark('fetch start')
        TradeClient.loadBalance().then((balance) => {
          this.balance = BalanceHelper.removeNegative(balance)
          this.allBalances = BalanceHelper.allBalances(this.balance, {removeZero: true})
          this.loading = false
        })
      },
      getPortfolioByExchange () {
        return TradeClient.getPortfolioByExchange().then((result) => {
          this.balanceByExchange = result
        })
      },
      plotPie (elementId, newBalance, palette = 1, hue) { // TOREMOVE
        let totalUSD = _.mapValues(newBalance, o => o.totalUSD.toFixed(2))
        let percent = _.mapValues(newBalance, o => `${(o.percent * 100).toFixed(2)} %`)
        let hoverinfo = 'label+value+text'
        let numberOfPoints = Object.keys(newBalance).length

        if (this.inviziApp.stealthMode) {
          hoverinfo = 'label+text'
        }

        let pieData = [Object.assign(
          InviziPlot.pieData(palette, numberOfPoints, hue),
          {
            values: Object.values(totalUSD),
            labels: Object.keys(totalUSD),
            text: Object.values(percent),
            hoverinfo: hoverinfo,
            type: 'pie'}
        )]
        let el = document.getElementById(elementId)
        if (!el) return
        let placeholderWidth = el.offsetWidth
        let layout = Object.assign({}, InviziPlot.pieLayout, {
          width: placeholderWidth,
          height: placeholderWidth
        })
        Plotly.newPlot(elementId, pieData, layout, InviziPlot.commonArgOptions) // eslint-disable-line no-undef
      },
      isFiat (symbol) {
        return Forex.isFiat(symbol)
      }
    },
    computed: {
      hasTrades () {
        return Object.keys(this.balance).length > 0
      },
      perfData () { // TOREMOVE
        return Performance.calc(this.avg, this.tickerData)
      },
      tickerData () {
        let result = {}
        if (this.allBalances && this.allBalances.BTC) {
          Object.keys(this.allBalances.BTC).forEach(coinId => { // TODO n^2
            result[coinId] = _.find(this.ticker, {coin_id: coinId})
          })
        }
        return result
      },
      totalBalanceInUSD () {
        return BalanceHelper.totalByAttribute(this.balanceByExchange, 'totalUSD')
      },
      totalBalanceInBTC () {
        return BalanceHelper.totalByAttribute(this.balanceByExchange, 'totalBTC')
      }
    },
    mounted () {
      this.fetch()
      let forex = Forex.last()
      this.allTimePerf()
      this.altCurrency = Settings.get('alternateCurrency')
      if (this.altCurrency) {
        this.altCurrencyMultiplier = forex.rates[this.altCurrency]
        this.altCurrencyIconClass = Settings.getAltCurrencyIconClass()
      }
      this.ticker = Ticker.last().data
      this.getPortfolioByExchange()
      EventBus.$on('Ticker/get', (ticker) => {
        this.ticker = ticker.data
        if (this.$router.history.current.name === 'main-dashboard') {
          this.allBalances = BalanceHelper.allBalances(this.balance)
          this.getPortfolioByExchange()
        }
      })
    }
  }
</script>

<style scoped>
</style>
