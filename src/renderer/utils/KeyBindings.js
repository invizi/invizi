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

import EventBus from '@/components/EventBus'
import Router from '../router'
const Mousetrap = require('mousetrap')

let keyBindings = {
  init () {
    Mousetrap.bind(['command+p', 'ctrl-p'], () => {
      EventBus.$emit('Omni/show')
    })

    Mousetrap.bind(['command+left', 'alt+left'], () => {
      Router.go(-1)
    })

    Mousetrap.bind(['command+right', 'alt+right'], () => {
      Router.go(1)
    })

    Mousetrap.bind('g d', () => {
      Router.push({ path: '/main-dashboard' })
    })

    Mousetrap.bind('g a', () => {
      Router.push({ path: '/accounts/local1' })
    })

    Mousetrap.bind(['g h', 'f1'], () => {
      Router.push({ path: '/help' })
    })

    Mousetrap.bind('g s', () => {
      Router.push({ path: '/settings' })
    })

    Mousetrap.bind('g t', () => {
      Router.push({ path: '/tools' })
    })

    Mousetrap.bind('g p', () => {
      Router.push({ path: '/profit-loss' })
    })
  }
}

export default keyBindings
