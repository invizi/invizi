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

        <div class="offset-9 col-lg-3">
          <v-select
            :items="coinListViews"
            v-model="selectedCoinListView"
            label="View"
            @input="onCoinListViewSelect"
            item-text="name"
            dense
            style="z-index: 11;"
            autocomplete>
          </v-select>
        </div>
        <div class="row">
          <div class="collapsedSideBar" v-if="!showSideBar">
            <i class="fa fa-angle-double-right pull-left clickable" title="hide" @click="showSideBar = true"></i>
          </div>
          <div class="col-lg-2" v-if="showSideBar">
            <i class="fa fa-angle-double-left row pull-right clickable" title="hide" @click="showSideBar = false"></i>
            <div class="row">
              <a href="#" @click="showNewList()"><i class="fa fa-plus-circle" title="new"></i></a>
              <a href="#" @click="deleteFullList()" v-if="coinLists.length > 0"><i class="fa fa-minus-circle" title="delete" style="margin-left: 10px;"></i></a>
            </div>

            <v-dialog
              v-model="newListDialog"
              width="500"
            >
              <v-card>

                <v-card-text>
                  <div class="">
                    <v-text-field
                      style=""
                      single-line
                      v-model="newListName"
                      autofocus
                    ></v-text-field>
                  </div>

                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>

                  <button type="button" class="btn btn-default btn-sm waves-effect
                                waves-light"
                          @click="newListDialog = false;">Cancel</button>
                  <button type="button" class="btn btn-primary btn-sm waves-effect
                                waves-light" @click="newListDialog = false; newList()">Save</button>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <div class="row" v-if="newListName">
            </div>
            <div class="row">
              <v-select
                v-bind:items="coinLists"
                v-model="selectedCoinList"
                item-text="name"
                @input="onCoinListSelect"
                label="List"
                autocomplete
                v-if="coinLists.length > 0"
              ></v-select>
            </div>
            <div class="col-lg-12" v-if="coins.length > 0" style="height:50px">
              <draggable v-model="deleteList" class="dragArea"
                         :options="{group:'people'}">
              </draggable>
            </div>
            <div class="col-lg-12 dropBox" v-if="coins.length > 0">
              <draggable v-model="coinList" class="dragArea"
                         :options="{group:'people'}">
                <transition-group
                  name="custom-classes-transition"
                  enter-active-class="animated fadeIn"
                  leave-active-class="animated fadeOut"
                  duration="200">
                  <div class="col-lg-12" v-for="coin in coinList" :key="coin.coin_id" style="margin: 10px 0" v-if="coin">
                    <coin-image @dblclick.native="removeCoin(coin)" :coin-id='coin.coin_id'/>
                    <span>{{coin.name}}</span>
                  </div>
                </transition-group>
              </draggable>
            </div>
          </div>
          <div :class="{'col-lg-10': showSideBar, 'col-lg-12': !showSideBar}">
            <table class="table large-header table-simple table-sticky">
              <thead>
                <tr>
                  <th colspan="3"><input type="text" @input="onQueryDebounce" v-model="filterQuery" placeholder="Search" style="font-size: 1.1rem;padding-left: 1rem;"></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th colspan="2">
                    <span v-show="maxPages > 1">
                      <a href="#" :disabled="currentPage <= 1" @click="previousPage"><i class="fa fa-arrow-left" title="previous"></i></a>
                      <input type="text" style="width:40px;text-align: center" v-on:blur="onPageBlur" @input="onQuery" v-model="currentPage">
                      <a href="#" :disabled="currentPage >= maxPages" @click="nextPage"><i class="fa fa-arrow-right" title="next"></i></a>
                    </span>
                  </th>
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  <th>Name</th>
                  <th>Market Cap USD</th>
                  <th>Price USD</th>
                  <th>Price BTC</th>
                  <th>Volume 24h USD</th>
                  <th>24h</th>
                </tr>
              </thead>
              <draggable v-model="coins" class="" :options="{group:{
                                                  name:'people',  pull:'clone', put:false, revertClone: true }}"
                         :move="checkMove" :element="'tbody'">
                <tr v-for="(coin, index) in coins" v-bind:key="coin.coin_id" :id="coin.coin_id"
                    tabindex="1" v-on:dblclick="addCoin(coin)">
                  <td :class="{'no-top-border': index % numPerPage === 0}">{{coin.market_cap_rank}}</td>
                  <td :class="{'no-top-border': index % numPerPage === 0}"><coin-image :coin-id="coin.coin_id"></coin-image></td>
                  <td :class="{'no-top-border': index % numPerPage === 0}" class="hidden-ghost"><router-link style="width:100px;" :to="{ name: 'coin', params: { id: coin.coin_id }}" class="nav-link waves-effect"> {{coin.name}} </router-link></td>
                  <td :class="{'no-top-border': index % numPerPage === 0}">{{coin.market_cap | currencyWithoutDecimals}}</td>
                  <td :class="{'no-top-border': index % numPerPage === 0}">{{coin.price_usd | currency}}</td>
                  <td :class="{'no-top-border': index % numPerPage === 0}"><i class="fa fa-btc" title="bitcoin" style="margin-right: 2px"></i>{{coin.price_btc | formatBTC}}</td>
                  <td :class="{'no-top-border': index % numPerPage === 0}">{{coin.total_volume | currencyWithoutDecimals}}</td>
                  <td class="text-xs-center" :class="{'no-top-border': index % numPerPage === 0, 'red-text': +coin.price_change_percentage_24h < 0, 'green-text': +coin.price_change_percentage_24h >= 0}">
                    {{coin.price_change_percentage_24h | toTwoDecimals}}%
                  </td>
                </tr>
              </draggable>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import Ticker from '@/components/Ticker'
  import EventBus from '@/components/EventBus'
  import CoinImage from '@/components/CoinImage'
  import CoinList from '@/models/CoinList'
  import draggable from 'vuedraggable'
  import AppMixin from '@/components/AppMixin'

  const Mousetrap = require('mousetrap')
  const _ = require('lodash')
  export default {
    name: 'coins',
    mixins: [AppMixin],
    components: {
      draggable: draggable,
      'coin-image': CoinImage
    },
    methods: {
      previousPage () {
        if (this.currentPage > 1) {
          --this.currentPage
          this.onQuery()
        }
      },
      nextPage () {
        if (this.currentPage < this.maxPages) {
          ++this.currentPage
          this.onQuery()
        }
      },
      showNewList () {
        this.newListName = 'NewList'
        this.newListDialog = true
      },
      newList () {
        this.selectedCoinList = {name: this.newListName, coins: []}
        CoinList.save(this.selectedCoinList)
        this.coinLists.push(this.selectedCoinList)
        this.coinList = this.selectedCoinList.coins.map((coinId) => Ticker.coinById(coinId))
      },
      deleteFullList () {
        this.coinLists = _.filter(this.coinLists, (coinList) => coinList.name !== this.selectedCoinList.name)
        this.selectedCoinList = _.first(this.coinLists)
        CoinList.delete(this.selectedCoinList.name)
        this.onCoinListSelect()
      },
      addCoin (coin) {
        if (!_.find(this.coinList, {coin_id: coin.coin_id})) {
          this.coinList.push(coin)
          // Update object and DB
          this.selectedCoinList.coins.push(coin.coin_id)
          CoinList.save(this.selectedCoinList)
        }
      },
      removeCoin (coin) {
        this.coinList = _.filter(this.coinList, o => o.coin_id !== coin.coin_id)
        _.remove(this.selectedCoinList.coins, o => o === coin.coin_id)
        CoinList.save(this.selectedCoinList)
      },
      checkMove (evt) {
        // Cancel drag of already dragged/put objects
        return !_.find(this.coinList, {coin_id: evt.draggedContext.element.coin_id})
      },
      onCoinListSelect () {
        this.coinList = this.selectedCoinList.coins.map((coinId) => Ticker.coinById(coinId))
      },
      onCoinListViewSelect () {
        this.currentPage = 1
        this.onQuery()
      },
      onQuery () {
        this.filteredCoins = this.allCoins
        if (this.selectedCoinListView && this.selectedCoinListView !== 'All') {
          this.filteredCoins = this.allCoins.filter(coin => {
            return this.selectedCoinListView.coins.includes(coin.coin_id)
          })
        }
        // Filter handling
        if (!_.isEmpty(this.filterQuery)) {
          let regEx = new RegExp(`${this.filterQuery}`, 'i')
          this.filteredCoins = _.filter(this.filteredCoins, (coin) => {
            return regEx.test(coin.name) || regEx.test(coin.coin_id) ||
            regEx.test(coin.symbol)
          })
        }
        // Pagination handling
        if (this.currentPage === '') return
        let startIndex = (this.currentPage - 1) * this.numPerPage
        this.coins = this.filteredCoins.slice(startIndex, startIndex + this.numPerPage)
      },
      onPageBlur () {
        if (this.currentPage === '') this.currentPage = 1
      },
      onQueryDebounce: _.debounce(function () {
        this.onQuery()
      }, 100)
    },
    watch: {
      filterQuery (newValue) {
        if (this.currentPage !== 1) {
          this.currentPage = 1
          this.onQuery()
        }
      }
    },
    data () {
      return {
        showSideBar: true,
        allCoins: [],
        newListDialog: false,
        newListName: undefined,
        coins: [],
        coinList: [],
        deleteList: [],
        coinLists: [],
        selectedCoinList: null,
        selectedCoinListView: null,
        filteredCoins: [],
        filterQuery: '',
        currentPage: 1,
        numPerPage: 50
      }
    },
    computed: {
      coinListViews () {
        return ['All'].concat(this.coinLists)
      },
      maxPages () {
        return (this.filteredCoins && Math.ceil(this.filteredCoins.length / this.numPerPage)) || 1
      }
    },
    async mounted () {
      // Get list in db
      this.allCoins = Ticker.fillNameAndImage(Ticker.last().data)
      this.coinLists = await CoinList.all()
      if (_.isEmpty(this.coinLists)) {
        this.coinLists.push({name: 'FirstList', coins: ['bitcoin', 'ethereum']})
      }
      this.onQuery()
      this.selectedCoinList = this.coinLists[0]
      this.selectedCoinListView = this.coinListViews[0]
      this.coinList = this.selectedCoinList.coins.map((coinId) => Ticker.coinById(coinId))
      EventBus.$on('Ticker/get', (finalResult) => {
        this.allCoins = Ticker.fillNameAndImage(finalResult.data)
        this.onQuery()
      })
      Mousetrap.bind('left', () => {
        this.previousPage()
      })
      Mousetrap.bind('right', () => {
        this.nextPage()
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.dragArea {
  min-height: 900px;
}

.dropBox {
  margin-top: 10px;
  /* border: 2px grey; 
   border-style: dashed; */
}
.sortable-ghost {
  opacity: 0.9;
}

.sortable-ghost .hidden-ghost {
  opacity: 0;
}
.table-select tr:focus {
  background-color: #343434 !important;
  outline: 1px #A85EE9;
}
.table td {
  vertical-align: middle;
}

.table th, td {
  text-align: center;
}
.collapsedSideBar {
  flex: 0 0 2.333333%;
  position: relative;
  width: 100%;
  min-height: 1px;
  max-width: 2.333333%;
}
.margin-left {
  margin-left: 200px;
}
.hidden-row {
  visibility: hidden;
}

.hidden-row td {
  height: 1px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  line-height: 0px;
}

td.no-top-border {
  border-top: none !important;
}

 .table-sticky th {
   position: sticky;
   top: 0;
   z-index: 1;
   background-color: var(--background-color);
 }
</style>
