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
  <!-- Navbar -->
  <aside v-if="loggedIn" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" :class="{ expanded: expanded }">
    <ul>
      <li class="invizi-logo">

        <transition
          name="custom-classes-transition"
          enter-active-class="animated bounceIn"
        >
          <img src="static/images/logo/invizi-logo-transparent-50x50.png" v-if="!expanded" :class="{invisible:  $router.history.current.name === 'main-dashboard'}"/>
        </transition>

        <img style="height: 50px;" src="static/images/logo/invizi-logo-full-transparent.png" v-if="expanded"  :class="{invisible:  $router.history.current.name === 'main-dashboard'}"/>
      </li>
      <li v-for="route in routes">
        <router-link :to="route.path" v-if="!route.needTrades || hasAccountsWithTrades" class="nav-link waves-effect" :class="{'active': $route.path === route.path}">
          <img :src="route.iconPath" class="icon"/>
          <div>{{route.name}}</div>
        </router-link>
      </li>
      <li>
        <a href="#" class="nav-link waves-effect" @click.stop="$emit('show-omni')">
          <img src="static/icons/font-awesome/search.svg" class="icon">
          <div>Omni Search</div>
        </a>
      </li>
    </ul>
  </aside>
</template>

<script>
 import TradeClient from '@/components/TradeClient'
 import EventBus from '@/components/EventBus'
 const routes = [
   {name: 'Dashboard', path: '/main-dashboard', iconPath: 'static/icons/font-awesome/chart-pie.svg', needTrades: true},
   {name: 'Accounts', path: '/accounts/local1', iconPath: 'static/icons/font-awesome/wallet.svg'},
   {name: 'Profit & Loss', path: '/profit-loss', iconPath: 'static/icons/font-awesome/file-invoice-dollar.svg', needTrades: true},
   {name: 'Buy & Sell', path: '/buy-sell', iconPath: 'static/icons/font-awesome/exchange-alt.svg'},
   {name: 'Coins', path: '/coins', iconPath: 'static/icons/font-awesome/bitcoin.svg'},
   {name: 'Indexes', path: '/asset-indexes', iconPath: 'static/icons/font-awesome/chart-line.svg'},
   {name: 'Tools', path: '/tools', iconPath: 'static/icons/font-awesome/wrench.svg'},
   {name: 'Settings', path: '/settings', iconPath: 'static/icons/font-awesome/cogs.svg'}
 ]

 export default {
   name: 'navigation-bar',
   data () {
     return {
       expanded: true,
       routes: routes,
       hasAccountsWithTrades: false,
       inviziApp: window.inviziApp,
       loggedIn: false
     }
   },
   methods: {
     onMouseLeave () {
       this.expanded = false
     },
     onMouseEnter () {
       this.expanded = true
     },
     getAccounts () {
       this.hasAccountsWithTrades = TradeClient.hasAccountsWithTrades()
     }
   },
   mounted () {
     /* let aside = document.getElementsByTagName('aside')[0] */
     /* aside.addEventListener('mouseenter', (el) => el.target.classList.add('expanded')) */
     EventBus.$on('accountsUpdated', this.getAccounts)
     EventBus.$once('loggedIn', () => {
       this.loggedIn = true
       this.getAccounts()
     })
   },
   destroyed () {
     EventBus.$off('accountsUpdated')
   }
 }
</script>
<style lang="scss" scoped>

 a {
   color: #fff;
 }

 a.active {
   color: var(--primary);
 }

 .router-link-active {
   border-bottom: 1px solid var(--primary);
 }

 aside:not(.expanded) .invizi-logo {
   padding: 0 0.2rem;
 }

 aside.expanded .invizi-logo {
   padding: 0 0.9rem;
 }

 aside {
   flex: 0;
   background-color: var(--background-color);
   border-right: 1px solid var(--light-border);
   transition-property: all;
   transition-duration: 0.5s;
   padding-top: 40px;
   ul li {
     padding: 0.4rem 0;
   }
   .router-link-active {
     border-bottom: none;
   }
   .nav-link {
     display: flex;
   }
   .nav-link div {
     display: none;
     float: right;
     margin-left: 10px;
     line-height: 20px;
     width: 10vw;
   }
   ul {
     position: sticky;
     top: 20px;
   }
 }

 .icon {
   filter: invert(80%);
   width: 20px;
   height: 20px;
   margin-right: 5px;
 }

 a:hover .icon {
   filter: invert(100%);
 }

 aside.expanded {
   flex: 1;
   .nav-link div {
     display: block;
     visibility: visible;
     line-height: 20px;
   }
 }
</style>
