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
    <div class="container-fluid">
      <!--Card-->
      <div class="card card-cascade narrower" style="padding: 10px 10px">
        <div class="row">
          <div class="col-lg-3">
          </div>
          <div class="offset-6 col-lg-2">
            <div style="font-size:24px; text-align: right; margin-bottom: 7px;">
              <span v-redgreen="allBalances && allBalances.totalUSD">
                <span style="margin-right: 5px" v-if="allBalances && allBalances.totalUSD > 0">+</span><span style="margin-right: 2px">$</span>{{allBalances && allBalances.totalUSD}}
              </span>
            </div>
            <div style="text-align: right; line-height: 24px">
              <span v-redgreen="allBalances && allBalances.totalBTC">
                <span style="margin-right: 5px" v-if="allBalances && allBalances.totalBTC > 0">+</span><i class="fa fa-btc" aria-hidden="true" style="margin-right: 2px"></i>{{allBalances && allBalances.totalBTC | formatBTC}}
              </span>
            </div>
          </div>
        </div>
      </div>
      <hr>
      <!--Card-->
      <div class="card card-cascade narrower" style="margin-bottom: 20px; padding: 10px 0">
        <!--Grid row-->
        <div class="row col-lg-12">
          <!--Grid column : ADD COINS-->
          <div class="col-lg-3 col-md-3">
            <v-select
              v-bind:items="symbols"
              v-model="filteredCoin"
              label="Coin"
              item-text="name"
              item-value="coin_id"
              autocomplete
            >
              <template slot="item" slot-scope="data">
                <v-list-tile-avatar>
                  <coin-image :coin-id='data.item.coin_id'/>
                  <span style="margin-left: 8px; font-size: 32px"
                        v-if="data.item.iconText">{{data.item.iconText}}</span>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                </v-list-tile-content>
              </template>
            </v-select>

          </div>
          <!--Grid column-->
          <div class="col-lg-3 col-md-3">
            <v-menu
              lazy
              :close-on-content-click="true"
              v-model="fromMenu"
              transition="scale-transition"
              offset-y
              full-width
              :nudge-left="40"
              max-width="390px"
            >
              <v-text-field
                slot="activator"
                label="From"
                autosave="true"
                v-model="filterFrom"
                prepend-icon="event"
              ></v-text-field>
              <v-date-picker v-model="filterFrom" scrollable actions>
                <template slot-scope="{ save, cancel }">
                  <v-card-actions>
                    <v-btn flat primary @click.native="cancel()">Cancel</v-btn>
                    <v-btn flat primary @click.native="save()">Save</v-btn>
                  </v-card-actions>
                </template>
              </v-date-picker>
            </v-menu>
          </div>
          <!--Grid column-->
          <div class="col-lg-3 col-md-3">
            <v-menu
              lazy
              :close-on-content-click="true"
              v-model="toMenu"
              transition="scale-transition"
              offset-y
              full-width
              :nudge-left="40"
              max-width="390px"
            >
              <v-text-field
                slot="activator"
                label="To"
                autosave="true"
                v-model="filterTo"
                prepend-icon="event"
              ></v-text-field>
              <v-date-picker v-model="filterTo" scrollable actions>
                <template slot-scope="{ save, cancel }">
                  <v-card-actions>
                    <v-btn flat primary @click.native="cancel()">Cancel</v-btn>
                    <v-btn flat primary @click.native="save()">Save</v-btn>
                  </v-card-actions>
                </template>
              </v-date-picker>
            </v-menu>
          </div>
          <form class="form-inline">
            <button type="button" class="btn btn-sm btn-primary waves-effect
                          waves-light" @click="filter()">Filter</button>
          </form>
        </div>
      </div>
      <InviziTable @toggle-all="toggleAll" @page-changed="getItemSlice" :slice="itemsSlice"
                 :items-length="itemsLength" :checked-trades="checkedTrades" @item-checked="checkboxFilter"/>
    </div>
  </div>
</template>

<script>
  import TradeClient from '@/components/TradeClient'
  import Ticker from '@/components/Ticker'
  import BalanceHelper from '@/components/BalanceHelper'
  import CoinImage from '@/components/CoinImage'
  import CoinImageText from '@/components/CoinImageText'
  import EventBus from '@/components/EventBus'
  import TradeLabel from '@/components/TradeLabel'
  import InviziTable from '@/components/InviziTable'
  import { computeVisibleItems } from '@/utils/InviziTable'
  let allTrades = []
  let importItems = []
  let selected = []

  const _ = require('lodash')
  const moment = require('moment')
  export default {
    name: 'profit-loss',
    components: {
      'coin-image': CoinImage,
      'trade-label': TradeLabel,
      'coin-image-text': CoinImageText,
      InviziTable
    },
    data () {
      return {
        checkedTrades: {},
        itemsLength: 0,
        loading: true,
        msg: '',
        filteredCoin: undefined,
        fromMenu: false,
        filterFrom: undefined,
        filterTo: undefined,
        toMenu: false,
        symbols: [],
        allBalances: null,
        balance: null,
        itemsSlice: undefined
      }
    },
    computed: {
      hasTrades () {
        return allTrades.length > 0
      }
    },
    methods: {
      toggleAll (allChecked) {
        if (!allChecked) {
          this.checkedTrades = {}
        } else {
          this.checkedTrades = _.zipObject(importItems.map(item => item.id), Array(importItems.length).fill(true))
        }
        this.checkboxFilter()
      },
      getItemSlice (page, itemsPerPage) {
        this.itemsSlice = computeVisibleItems(importItems, page, itemsPerPage)
      },
      onItemsChanged () {
        // Recalculate balances
        this.balance = TradeClient.addTradesToBalance(selected)
        this.allBalances = BalanceHelper.allBalances(this.balance, {removeZero: true})
      },
      checkboxFilter () {
        selected = importItems.filter(item => this.checkedTrades[item.id])
        this.onItemsChanged()
      },
      filter () { // TODO: convert to async
        let promise
        if (this.filteredCoin.symbol === 'invizi-all') {
          promise = new Promise((resolve, reject) => {
            importItems = allTrades
            resolve(importItems)
          })
        } else if (this.filteredCoin) {
          promise = TradeClient.loadCoin(this.filteredCoin).then((trades) => {
            importItems = trades
            return trades
          })
        }

        promise.then((trades) => {
          if (this.filterFrom) {
            var fromUnix = moment(this.filterFrom, 'YYYY-MM-DD').unix()
            importItems = _.filter(importItems, function (o) {
              return o.date >= fromUnix
            })
          }
          if (this.filterTo) {
            var toUnix = moment(this.filterTo, 'YYYY-MM-DD').unix()
            importItems = _.filter(importItems, function (o) {
              return o.date <= toUnix
            })
          }
          selected = importItems
          this.onItemsChanged()
          this.updateVisibleItems()
        })
      },
      updateVisibleItems () {
        this.itemsLength = importItems.length
        this.getItemSlice(1, 10)
      },
      fetchTrades () {
        TradeClient.all().then((trades) => {
          allTrades = trades
          importItems = trades
          this.updateVisibleItems()
          this.checkedTrades = _.zipObject(importItems.map(item => item.id), Array(importItems.length).fill(true))
          this.loading = false
        })
      }
    },
    mounted () {
      this.fetchTrades()
      const allCoins = Ticker.allCoins({includeFiat: true})
      this.symbols = [{name: 'All', symbol: 'invizi-all'}].concat(allCoins)
      this.filteredCoin = this.symbols[0]
      this.filter()

      EventBus.$on(`ExchangeClient/getTickers`, (message) => {
        this.checkboxFilter()
      })
    }
  }
</script>
