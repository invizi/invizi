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
const moment = require('moment')

Vue.filter('formatDate', function (value) {
  if (value) {
    return moment(value, 'X').format('YYYY-MM-DD')
  }
})

Vue.filter('formatDateTime', function (value) {
  if (value) {
    return moment(value, 'X').format()
  }
})

Vue.filter('formatDateTimeHuman', function (value) {
  if (value) {
    return moment(value, 'X').format('DD-MM-YYYY HH:mm:ss')
  }
})

// Transform 24_hours into 24h, etc
Vue.filter('dateNameDisplay', function (value) {
  let splitValue = value.split('_')
  return splitValue[0] + splitValue[1].slice(0, 1)
})
