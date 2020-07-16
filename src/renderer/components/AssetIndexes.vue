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
    <div class="row">
      <div class="col-lg-4">
        <v-select
        v-bind:items="assetIndexes"
        v-model="selectedAssetIndex"
        @input="onIndexSelect"
        item-text="name"
        dense>
        </v-select>

      </div>

      <div class="col-lg-2" style="padding-top: 25px; padding-left: 0;">
        <v-menu offset-y>
          <i slot="activator" class="invizi-info fa fa-ellipsis-v fa-2x" title="Menu"></i>
          <v-list class="menu-contextual">
            <v-list-tile v-for="(item, index) in menuActions" :key="index" @click="item.onClick">
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </div>
    </div>
    <hr>
    <section class="">
      <div class="container">
        <div class="row" v-if="selectedAssetIndex">
          <div class="col-lg-3">
            <div class="row">
              <div class="col-lg-8">
                <v-select
                  v-bind:items="strategies"
                  v-model="strategy"
                  label="Strategy"
                  item-text="name"
                  @input="onStrategyChange"
                  dense
                  autocomplete>
                </v-select>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-8">
                <v-text-field
                  label="Name"
                  item-text="Name"
                  single-line
                  v-model="name"
                ></v-text-field>
              </div>
            </div>

            <div class="row">
              <div class="col-lg-8">
                <v-text-field type="text"
                              label="Initial Amount"
                              item-text="Amount"
                              single-line
                              class="money"
                              v-decimal-numbers
                              v-model.number="selectedAssetIndex.initialAmount">
                </v-text-field>

              </div>
            </div>


            <div class="row">
              <v-menu
                ref="menu"
                lazy
                :close-on-content-click="false"
                :return-value.sync="startDateString"
                v-model="menu"
                transition="scale-transition"
                offset-y
                full-width
                :nudge-left="40"
                max-width="390px"
                class="col-lg-7"
              >
                <v-text-field
                  slot="activator"
                  label="Start Date"
                  autosave="true"
                  v-model="startDateString"
                  prepend-icon="event"
                  required
                ></v-text-field>
                <v-date-picker v-model="startDateString" scrollable actions>
                  <v-spacer></v-spacer>
                  <v-btn flat color="primary" @click="menu = false">Cancel</v-btn>
                  <v-btn flat color="primary" @click="$refs.menu.save(startDateString)">OK</v-btn>
                </v-date-picker>
              </v-menu>

            </div>
            <br>

            <p v-if="errorMessage" class="red-text">
              {{errorMessage}}
            </p>

          </div>
          <div class="col-lg-4">
            <div class="row">
              <div class="col-lg-6">
                <v-select
                  :items="symbols"
                  v-model="newCoin"
                  label="Coin"
                  item-text="name"
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

              <div class="col-md-2" style="display: flex; align-items: center;">
                <a href="#" @click="addNewCoin()"><i class="fa fa-2x fa-plus-circle" title="add"></i></a>
              </div>
            </div>
            <div class="row">
              <div v-if="coins.length > 0">
                <table class="table large-header table-simple">
                  <thead>
                    <tr>
                      <th></th>
                      <th></th>
                      <th>Weight</th>
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tr v-for="(coin, index) in coins" :key="coin.coin_id">
                    <td class="text-left">
                      <coin-image :coin-id='coin.coin_id'/>
                    </td>
                    <td class="text-left">{{coin.name}}</td>
                    <td class="text-right">
                      <v-text-field
                        style="padding-top: 0px; width: 60px;"
                        name="input-1-3"
                        label=""
                        @input="compositionChange"
                        single-line
                        v-decimal-numbers
                        v-model.number="coin.composition"
                      ></v-text-field>
                    </td>
                    <td :style="{'background-color': pieColors[index % pieColors.length]}">
                    </td>
                    <td>
                      <a href="#" @click="deleteCoin(coin)"><i class="fa fa-minus-circle" title="delete"></i></a>
                    </td>
                  </tr>
                </table>
                <div class="">
                  <!--Grid column-->
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-5" id="coins-pie" style="">

            <div class="row" style="display: flex; flex-direction: row-reverse;">
              <button type="button" class="btn btn-primary waves-effect
                            waves-light" @click="save()">Save Index</button>
            </div>

          </div>
        </div>
      </div>
    </section>
    <index-performance :value="selectedAssetIndex"></index-performance>
  </div>
</template>

 <script>
  import Ticker from '@/components/Ticker'
  import AssetIndex from '@/components/AssetIndex'
  import CoinImage from '@/components/CoinImage'
  import InviziPlot from '@/components/InviziPlot'
  import IndexPerformance from '@/components/IndexPerformance'
  import Dialog from '@/utils/Dialog'
  import Snackbar from '@/utils/Snackbar'
  const _ = require('lodash')
  const moment = require('moment')
  export default {
    name: 'help',
    components: {
      'coin-image': CoinImage,
      'index-performance': IndexPerformance
    },
    watch: {
      coins (newCoins) {
        if (!_.isEmpty(newCoins)) {
          this.plotPie('coins-pie', newCoins)
        }
      }
    },
    methods: {
      plotPie (elementId, coins) {
        let names = coins.map(coin => coin.coin_id)
        let compositions = coins.map(coin => coin.composition)
        let labels = coins.map(coin => `${coin.name} %`)
        let hoverinfo = 'label+value+text'
        if (this.inviziApp.stealthMode) {
          hoverinfo = 'label+text'
        }

        let defaultOptions = {
          outsidetextfont: {
            color: '#FFF'
          },
          marker: {
            colors: this.pieColors
          }
        }

        let pieData = [Object.assign(
          defaultOptions,
          {
            values: compositions,
            labels: labels,
            text: names,
            hoverinfo: hoverinfo,
            textinfo: 'label+text',
            hole: 0.7,
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

      addNewCoin () {
        let newComposition = 1
        this.coins.push(Object.assign(_.find(this.allSymbols, {id: this.newCoin.id}), {composition: newComposition}))
        this.onStrategyChange()
        this.newCoin = this.symbols[0]
      },
      deleteCoin (coinToDelete) {
        this.coins = _.filter(this.coins, coin => coin.coin_id !== coinToDelete.coin_id)
        this.newCoin = this.symbols[0]
      },
      compositionChange: _.debounce(function (e) { this.coins = this.coins.slice() }, 200),
      newIndex () {
        this.selectedAssetIndex = {name: 'New Index', composition: {}}
        this.assetIndexes.push(this.selectedAssetIndex)
        this.onIndexSelect()
      },
      onIndexSelect () {
        this.coins = []
        let coinIds = Object.keys(this.selectedAssetIndex.composition)
        let coinCompositions = Object.values(this.selectedAssetIndex.composition)
        coinIds.forEach((coinId, coinIndex) => {
          this.coins.push(Object.assign(_.find(this.allSymbols, {coin_id: coinId}), {composition: coinCompositions[coinIndex]}))
        })
        this.newCoin = this.symbols[0]
        setTimeout(() => this.plotPie('coins-pie', this.coins), 200)
      },
      onStrategyChange () {
        AssetIndex.rebalanceWithStrategy(this.strategy.id, this.coins)
        this.compositionChange()
      },
      confirmDeleteIndex () {
        Dialog.show({message: 'Are you sure you want to delete this index?', actions: {onConfirm: this.deleteIndex}})
      },
      deleteIndex () {
        _.remove(this.assetIndexes, {name: this.selectedAssetIndex.name})
        AssetIndex.delete(this.selectedAssetIndex.name).then((deleted) => {
          if (this.assetIndexes.length > 0) {
            this.selectedAssetIndex = _.first(this.assetIndexes)
            this.onIndexSelect()
          }
        })
      },
      save () {
        this.errorMessage = null
        let nonZeroCoins = this.coins.filter(coin => coin.composition > 0)
        let composition = _.zipObject(nonZeroCoins.map(o => o.coin_id), nonZeroCoins.map(o => +o.composition)) // TODO decimal
        this.selectedAssetIndex.composition = composition
        this.selectedAssetIndex.startDate = moment(this.startDateString).unix()

        this.coins = this.coins.slice()
        AssetIndex.save(this.selectedAssetIndex).then(() => {
          Snackbar.success('Index saved')
          AssetIndex.all().then((assetIndexes) => {
            this.assetIndexes = assetIndexes
            this.selectedAssetIndex = _.find(assetIndexes, {name: this.selectedAssetIndex.name})
          })
        }).catch(error => console.log(error))
      }
    },
    data () {
      return {
        strategies: [],
        defaultIndex: {name: 'Example', composition: {bitcoin: 1, ethereum: 1, ripple: 1, litecoin: 1}, startDate: moment().subtract(6, 'months').unix(), initialAmount: 1000},
        newCoin: null,
        errorMessage: null,
        strategy: null,
        menu: false,
        inviziApp: window.inviziApp,
        menuActions: [
          { title: 'Add index', onClick: this.newIndex, iconClass: 'fa-plus' },
          { title: 'Delete index', onClick: this.confirmDeleteIndex, iconClass: 'fa-trash' }
        ],
        coins: [],
        startDateString: moment().format('YYYY-MM-DD'),
        selectedAssetIndex: null,
        assetIndexes: []
      }
    },
    computed: {
      startDateUnix () {
        return moment(this.startDate).unix()
      },
      symbols () {
        if (_.isEmpty(this.selectedAssetIndex) || _.isEmpty(this.coins)) return this.allSymbols
        let coinIds = this.coins.map(coin => coin.coin_id)
        return _.filter(this.allSymbols, (sym) => {
          return coinIds.indexOf(sym.coin_id) === -1
        })
      },
      name: {
        get () {
          return this.selectedAssetIndex ? this.selectedAssetIndex.name : ''
        },
        set (newValue) {
          this.selectedAssetIndex.name = newValue
        }
      }
    },
    mounted () {
      this.pieColors = InviziPlot.rainbow(25)
      this.allSymbols = Ticker.fillNameAndImage(Ticker.last().data)
      this.strategies = [
        {name: 'manual', id: 'manual'},
        {name: 'marketcap weighted', id: 'marketcap-weighted'},
        {name: 'volume weighted', id: 'volume-weighted'},
        {name: 'price weighted', id: 'price-weighted'},
        {name: 'inverse marketcap weighted', id: 'inverse-marketcap-weighted'},
        {name: 'inverse price weighted', id: 'inverse-price-weighted'},
        {name: 'inverse volume', id: 'inverse-volume'}
      ]
      this.strategy = this.strategies[0]
      AssetIndex.all().then((assetIndexes) => {
        if (_.isEmpty(assetIndexes)) {
          assetIndexes = [_.cloneDeep(this.defaultIndex)]
        }
        this.assetIndexes = assetIndexes
        this.selectedAssetIndex = assetIndexes[0]
        if (this.selectedAssetIndex.startDate) {
          this.startDateString = moment(this.selectedAssetIndex.startDate, 'X').format('YYYY-MM-DD')
        }
        this.onIndexSelect()
      })

      console.log(this.coins)
      this.plotPie('coins-pie', this.coins)
    }
  }
 </script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
