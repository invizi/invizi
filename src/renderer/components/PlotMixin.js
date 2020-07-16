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
import InviziPlot from '@/components/InviziPlot'
const _ = require('lodash')

let mixin = {
  methods: {
    plotPie (elementId, newBalance, palette = 1, hue) {
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
      console.log(`placeholderWidth=${placeholderWidth}`)
      let layout = Object.assign({}, InviziPlot.pieLayout, {
        width: placeholderWidth,
        height: placeholderWidth
      })
      Plotly.newPlot(elementId, pieData, layout, InviziPlot.commonArgOptions) // eslint-disable-line no-undef
    },
    plotBarChart (elementId, data, colorMap) {
      let newData = data.map((el, index) => {
        let colors = el.y.map(value => value > 0 ? colorMap[index].positive : colorMap[index].negative)
        let options = {
          marker: {
            line: {
              color: colors,
              width: 2
            },
            color: 'rgba(0,0,0,0)',
            opacity: 0.9
          },
          type: 'bar'
        }
        return Object.assign({}, options, el)
      })

      let el = document.getElementById(elementId)
      if (!el) return
      let placeholderWidth = el.offsetWidth
      let layout = Object.assign({}, InviziPlot.barCharLayout, {
        width: placeholderWidth,
        height: placeholderWidth
      })
      Plotly.newPlot(elementId, newData, layout, InviziPlot.commonArgOptions) // eslint-disable-line no-undef
    }
  }
}

export default mixin
