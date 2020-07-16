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

let directive = {
  init () {
    Vue.directive('redgreen', {
      update: function (el, binding) {
        if (binding.value < 0) {
          el.classList.remove('green-text')
          el.classList.add('red-text')
        } else {
          el.classList.add('green-text')
          el.classList.remove('red-text')
        }
      }
    })

    Vue.directive('onlynumbers', {
      inserted: function (el) {
        el.onkeypress = function (event) {
          return event.charCode >= 48 && event.charCode <= 57
        }
      }
    })

    Vue.directive('decimalNumbers', {
      bind: function (el) {
        el.addEventListener('keypress', (event) => {
          let charCode = event.keyCode ? event.keyCode : event.which
          let quantity = el.querySelector('input').value
          // only allow number and one dot
          if ((charCode < 48 || charCode > 57) && (charCode !== 46 || quantity.indexOf('.') !== -1)) {
            event.preventDefault()
          }
        })
      }
    })
  }
}

export default directive
