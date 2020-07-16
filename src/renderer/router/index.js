/*
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
*/
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
const router = new Router({
  routes: [
    {
      path: '/accounts/:id',
      name: 'accounts',
      component: require('@/components/Accounts').default
    },
    {
      path: '/worker',
      name: 'worker',
      component: require('@/components/Worker').default

    },
    {
      path: '/coins',
      name: 'coins',
      component: require('@/components/Coins').default
    },
    {
      path: '/coin/:id',
      name: 'coin',
      component: require('@/components/Coin').default
    },
    {
      path: '/main-dashboard',
      name: 'main-dashboard',
      component: require('@/components/MainDashboard').default
    },
    {
      path: '/buy-sell',
      name: 'buy-sell',
      component: require('@/components/BuySell').default
    },
    {
      path: '/tools',
      name: 'tools',
      component: require('@/components/Tools').default
    },
    {
      path: '/profit-loss',
      name: 'profit-loss',
      component: require('@/components/ProfitLoss').default
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/components/Settings.vue').default
    },
    {
      path: '/',
      name: 'login',
      component: require('@/components/Login').default

    },
    {
      path: '/help',
      name: 'help',
      component: require('@/components/Help').default

    },
    {
      path: '/ethereum',
      name: 'ethereum',
      component: require('@/components/Ethereum').default
    },
    {
      path: '/asset-indexes',
      name: 'asset-indexes',
      component: require('@/components/AssetIndexes').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

// if (process.env.NODE_ENV !== 'development') {
//   router.beforeEach((to, from, next) => {
//     if (to.path !== '/login' && !UserManager.authenticated) {
//       // next('/login')
//     } else {
//       // next()
//     }
//   })
// }

export default router
