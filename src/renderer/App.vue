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
  <div id="app">
    <snackbar></snackbar>
    <app-dialog></app-dialog>
    <v-app  @keyup.esc="dialog3 = false" @keyup.enter="showOmni()" dark>
    <div id="omni-dialog-attach"> </div>
    <!--Main Navigation-->
    <header style="z-index: 9999">
      <div class="" style="background-color: white; margin-top:60px;margin-bottom: -60px;">
        <v-dialog v-model="dialog3" max-width="700px" attach="#omni-dialog-attach">
          <div class="omnisearch" @keyup.esc="dialog3 = false">
            <div>
              <input class="" type="text" placeholder="Query" aria-label="Query"
              v-model="query" ref="focus" @input="onQueryDebounce" autofocus style="width: 100%;" class="title-font">
            </div>
            <div class="omni--result" v-show="queryResults.length > 0" >
              <v-card-text v-for="result in queryResults" :key="id" :class="{'first-result': result.raw}">
                <strong v-if="result.raw">
                  = {{result.raw}}
                </strong>
                <span class="clickable" v-if="result.coin_id">
                  <router-link @click.native="dialog3=false" :to="{ name: 'coin', params: { id: result.coin_id }}" class="nav-link waves-effect">
<coin-image :coin-id='result.coin_id' style="margin-right: 10px"/>
                    {{result.coin_id}} {{result.symbol}}: {{result.price_usd | currency}} USD {{result.price_btc | formatBTC}} BTC
                  </router-link>
                </span>
              </v-card-text>
            </div>
          </div>
        </v-dialog>
      </div>
    </header>
    <!--Main layout-->
    <main>
      <navigation-bar v-on:show-omni="showOmni()"> </navigation-bar>
      <div class="main-content">
        <router-view></router-view>
      </div>
    </main>
    </v-app>
  </div>
</template>

<script>
  import EventBus from '@/components/EventBus'
  import InviziParser from '@/components/InviziParser'
  import CoinImage from '@/components/CoinImage'
  import NavigationBar from '@/components/NavigationBar'
  import AppMixin from '@/components/AppMixin'
  import Snackbar from '@/components/Snackbar'
  import Dialog from '@/components/Dialog'

  const _ = require('lodash')
  const Mousetrap = require('mousetrap')

  export default {
    name: 'electron-vue',
    mixins: [AppMixin],
    components: {
      'coin-image': CoinImage,
      'snackbar': Snackbar,
      'app-dialog': Dialog,
      'navigation-bar': NavigationBar
    },
    data () {
      return {
        tickerBTC: {},
        inviziApp: {},
        id: null,
        query: null,
        queryResults: [],
        dialog3: false
      }
    },
    methods: {
      showOmni () {
        this.query = null
        this.dialog3 = true
        this.queryResults = []
        setTimeout(() => {
          this.$refs.focus.focus()
        }, 500)
      },
      async onQueryChange () {
        this.queryResults = await InviziParser.eval(this.query)
      },
      onQueryDebounce: _.debounce(function () {
        this.onQueryChange()
      }, 100)
    },
    mounted () {
      Mousetrap.bind(['command+p', 'ctrl-p'], () => {
        this.showOmni()
      })
      Mousetrap.bind('backspace', () => {
        this.$router.go(-1)
      })

      EventBus.$on('Ticker/get', (message) => {
        this.tickerBTC = _.find(message.data, {id: 'bitcoin'})
      })
    }
  }
  </script>

  <style lang="scss">
   $primary-background: var(--background-color);

   .application--light .btn {
     color: rgba(0,0,0,0.87) !important;
   }

   table.table-simple thead th {
     border: none
   }

   main {
     margin-left: 0 !important;
     margin-right: 0 !important;
     display: flex;
     min-height: 100vh;
   }

   .left-sidebar {
     padding: 0px;
   }
   .left-sidebar .list-group .list-group-item {
     -webkit-border-radius: 0px !important;
     -moz-border-radius: 0px !important;
     -ms-border-radius: 0px !important;
     -o-border-radius: 0px !important;
     border-radius: 0px !important;
   }

   footer.page-footer {
     margin-top: 0px;
   }
   .tabs-wrapper ul {
     border-radius: 0;
   }
   .ellipsis-dropdown .dropdown-toggle:after{
     display:none;
   }
   .ellipsis-dropdown {
     display: inline;
   }

   .page-title {
     font-size: 34px;
   }

   .omnisearch, .omni--result {
     background-color: var(--background-color);
   }

   .omni--result > div:hover {
     background-color: var(--gray-dark);
     color: white;
   }

   #omni-dialog-attach .dialog__content {
     height: 40vh;
   }

   .omnisearch input {
     height: 60px;
     font-size: 22px;
     padding: 0 0 0 20px;
   }

   .omnisearch a {
     color: white;
   }

   .omnisearch .card {
     overflow-y: scroll;
   }

   .omni--result {
     position: absolute;
     max-height: 500px;
     width: 700px;
     margin-top: 5px;
     overflow: auto;
     border: 1px solid #292929;
     border-top: none;
   }

   .container {
     max-width: 3000px;
   }

   .application.theme--dark {
     background: #262626;
     .list-group-item {
       background: #262626;
     }
     .table th, .table td {
       border-color: var(--light-border);
     }
     .list-group-item.active {
       background: #A85EE9;
     }
     color: #fff;
     .table {
       background-color: #262626;
     }
     .card {
       box-shadow: none;
       background: #262626;
     }
     .navbar {
       color: white;
       background: #262626;
       .nav-link {
         color: white !important;
       }
     }
     input {
       color: white;
     }
     table.table a {
       color: white;
     }
     .modebar {
       background: transparent;
     }

     .js-plotly-plot .plotly path {
       fill: #DEDEDE;
     }
     .js-plotly-plot .plotly .modebar-btn.active path, .js-plotly-plot .plotly
     .modebar-btn:hover path {
       fill: #fff;
     }

     .left-sidebar .action-item {
       border-right: $primary-background;
       border-bottom: $primary-background;
       background-color: $primary-background;
     }
   }

   ::placeholder {
     color: #b1b1b1;
   }

   table.table tbody td.table-bigger-text {
     font-size: 1.2rem;
   }

   .application.theme--dark a i.blueish {
     color: #5da9f5;
   }

   .application.theme--dark .navbar .nav-link .nav-item a:hover {
     text-decoration: underline;
   }

   .application .nav-item, h1, h2, h3, h4, h5, h6 {
     font-family: var(--font-family-title);
   }

   .no-border, tr.no-border td {
     border: none;
   }

   .first-result {
     /* border-bottom: 10px solid var(--background-color) */
   }

   .theme--dark .datatable .datatable__actions, .application .theme--dark.datatable .datatable__actions {
     background-color: inherit;
     color: rgba(255,255,255,0.7);
     border-top: inherit;
   }
   .hidden-not-hover:not(:hover) .show-on-hover {
     visibility: hidden;
   }

   .hidden-not-hover:hover .show-on-hover {
     visibility: visible;
   }

   .fade-enter-active, .fade-leave-active {
     transition: opacity .5s;
   }
   .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
     opacity: 0;
   }

   .btn {
     height: 46px;
   }
   .btn-sm {
     height: 36px;
   }

   main {
     .main-content {
       padding-left: 2rem;
       padding-top: 3rem;
       flex: 6;
     }
   }

   .title-font {
     font-family: var(--font-family-title);
   }

   aside, h1, h2, h3, h4, a[role="tab"], thead {
     font-family: var(--font-family-title);
   }

   aside {
     font-family: var(--font-family-body);
   }

   .btn-primary {
     border-color: #4edeff;
     background: white;
   }

   .application .theme--dark.btn {
     color: var(--background-color);
   }

   button, table, .application, h5 {
     font-family: var(--font-family-body);
   }

   .table thead th {
     border-top: none;
   }

   .menu-contextual {
     .list__tile {
       height: 2rem;
       font-size: 0.8rem;
     }
   }
   .btn__content {
     margin-top: -10px;
   }

   *::-webkit-scrollbar,
   *::-webkit-scrollbar-thumb {
     width: 13;
     border-radius: 13px;
     background-clip: padding-box;
     border: 6px solid transparent;
   }

   *::-webkit-scrollbar-thumb {
     box-shadow: inset 0 0 0 10px;
   }

   .btn:not(.btn--depressed) {
     box-shadow: 0px 2px 1px -2px rgba(255,255,255,0.3), 0px 2px 2px 0px rgba(255,255,255,0.14), 0px 1px 5px 0px rgba(255,255,255,0.12)
   }

   .big-title {
     font-size: 3rem;
   }

   .bigger-title {
     font-size: 4rem;
   }

   .input-group.input-group--single-line.input-group--dirty label,
   .input-group.input-group--solo.input-group--dirty label {
     display: block;
   }

   .money input {
     text-align: left;
   }

   .input-group__input input[type=text] {
     text-align: right;
   }
  </style>
