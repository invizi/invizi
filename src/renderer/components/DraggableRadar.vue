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
  <div id="radar-chart"></div>
</template>

<script>
  /* eslint-disable */
  const d3 = Plotly.d3
  /* eslint-enable */

  export default {
    name: 'coin-attributes',
    props: ['value'],
    methods: {
      draw () {
        if (!this.value || this.value.length === 0) return
        let vue = this
        let RadarChart = {
          draw (id, d, options) {
            let cfg = {
              radius: 6,
              w: 600,
              h: 600,
              factor: 1,
              factorLegend: 0.85,
              levels: 5,
              maxValue: 100,
              radians: 2 * Math.PI,
              opacityArea: 0.5,
              color: d3.rgb('#4edeff')
            }

            if (typeof options !== 'undefined') {
              for (var i in options) {
                if (typeof options[i] !== 'undefined') {
                  cfg[i] = options[i]
                }
              }
            }

            cfg.maxValue = Math.max(cfg.maxValue, d3.max(d.map(function (o) { return o.value })))
            let allAxis = (d.map(function (i, j) { return i.axis }))
            let total = allAxis.length
            let radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2)

            d3.select(id).select('svg').remove()
            let g = d3.select(id).append('svg').attr('width', cfg.w).attr('height', cfg.h).append('g')

            let tooltip

            drawFrame()
            let initialSlopes = new Array(5)
            let maxAxisValues = []
            drawAxis()
            let dataValues = []
            reCalculatePoints()

            let areagg = initPolygon()

            drawPoly()

            drawnode()

            function drawFrame () {
              for (var j = 0; j < cfg.levels; j++) {
                var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels)
                let opacity = j === cfg.levels - 1 ? 1 : 0.4
                g.selectAll('.levels').data(allAxis).enter().append('svg:line')
                  .attr('x1', function (d, i) { return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total)) })
                  .attr('y1', function (d, i) { return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total)) })
                  .attr('x2', function (d, i) { return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total)) })
                  .attr('y2', function (d, i) { return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total)) })
                  .attr('class', 'line').style('stroke', 'grey').style('stroke-width', '0.5px').style('opacity', opacity).attr('transform', 'translate(' + (cfg.w / 2 - levelFactor) + ', ' + (cfg.h / 2 - levelFactor) + ')')
              }
            }

            function drawAxis () {
              let axis = g.selectAll('.axis').data(allAxis).enter().append('g').attr('class', 'axis')

              axis.append('line')
                .attr('x1', cfg.w / 2)
                .attr('y1', cfg.h / 2)
                .attr('x2', function (j, i) {
                  maxAxisValues[i] = {x: cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total)), y: 0}
                  return maxAxisValues[i].x
                })
                .attr('y2', function (j, i) {
                  maxAxisValues[i].y = cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total))
                  initialSlopes[i] = (300 - maxAxisValues[i].y) / (maxAxisValues[i].x - 300)
                  return maxAxisValues[i].y
                })
                .attr('class', 'line').style('stroke', 'grey').style('stroke-width', '1px')

              axis.append('text').attr('class', 'legend')
                .text(function (d) { return d }).style('fill', 'white').style('font-family', 'sans-serif').style('font-size', '12px').attr('transform', function (d, i) { return 'translate(0, -10)' })
                .attr('x', function (d, i) { return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 20 * Math.sin(i * cfg.radians / total) })
                .attr('y', function (d, i) { return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) + 20 * Math.cos(i * cfg.radians / total) })
            }

            function reCalculatePoints () {
              g.selectAll('.nodes')
                .data(d, function (j, i) {
                  dataValues[i] =
                [
                  cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
                  cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))
                ]
                })
              dataValues[d[0].length] = dataValues[0]
            }

            function initPolygon () {
              return g.selectAll('area').data([dataValues])
                .enter()
                .append('polygon')
                .attr('class', 'radar-chart-serie0')
                .style('stroke-width', '2px')
                .style('stroke', cfg.color)
                .on('mouseover', function (d) {
                  var z = 'polygon.' + d3.select(this).attr('class')
                  g.selectAll('polygon').transition(200).style('fill-opacity', 0.1)
                  g.selectAll(z).transition(200).style('fill-opacity', 0.7)
                })
                .on('mouseout', function () {
                  g.selectAll('polygon').transition(200).style('fill-opacity', cfg.opacityArea)
                })
                .style('fill', function (j, i) { return cfg.color })
                .style('fill-opacity', cfg.opacityArea)
            }

            function drawPoly () {
              areagg.attr('points', function (de) {
                var str = ''
                for (let pti = 0; pti < de.length; pti++) {
                  str = str + de[pti][0] + ',' + de[pti][1] + ' '
                }
                return str
              })
            }

            function drawnode () {
              g.selectAll('.nodes')
                .data(d).enter()
                .append('svg:circle').attr('class', 'radar-chart-serie0')
                .attr('r', cfg.radius)
                .attr('cx', function (j, i) {
                  return cfg.w / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total))
                })
                .attr('cy', function (j, i) {
                  return cfg.h / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))
                })
                .attr('data-id', function (j) { return j.axis })
                .style('fill', cfg.color).style('fill-opacity', 0.9)
                .on('mouseover', function (d) {
                  let newX = parseFloat(d3.select(this).attr('cx')) - 10
                  let newY = parseFloat(d3.select(this).attr('cy')) - 5
                  tooltip.attr('x', newX).attr('y', newY).text(d.value.toFixed()).transition(200).style('opacity', 1)
                  let z = 'polygon.' + d3.select(this).attr('class')
                  g.selectAll('polygon').transition(200).style('fill-opacity', 0.1)
                  g.selectAll(z).transition(200).style('fill-opacity', 0.7)
                })
                .on('mouseout', function () {
                  tooltip.transition(200).style('opacity', 0)
                  g.selectAll('polygon').transition(200).style('fill-opacity', cfg.opacityArea)
                })
                .call(d3.behavior.drag().on('drag', move)) // for drag & drop
            }

            // Tooltip
            tooltip = g.append('text').style('opacity', 0).style('font-family', 'sans-serif').style('font-size', 13).style('fill', 'white')

            function move (dobj, i) {
              this.parentNode.appendChild(this)
              let dragTarget = d3.select(this)
              tooltip.style('opacity', 0)

              let oldData = dragTarget.data()[0]
              let oldX = parseFloat(dragTarget.attr('cx')) - 300
              let oldY = 300 - parseFloat(dragTarget.attr('cy'))
              let newY = 0
              let newX = 0
              let newValue = 0
              let maxX = maxAxisValues[i].x - 300
              let maxY = 300 - maxAxisValues[i].y

              newY = oldY - d3.event.dy
              newX = parseFloat(dragTarget.attr('cx')) - 300 + d3.event.dx
              if (Math.abs(newY) > Math.abs(maxY)) {
                newY = maxY
              }
              if (Math.abs(newX) > Math.abs(maxX)) {
                newX = maxX
              }
              // When x change sign we cap x
              if (maxX * newX < 0) {
                newX = 0
              }
              if (maxY * newY < 0) {
                newY = 0
              }

              let slope
              if (oldY !== 0 && oldX !== 0) {
                slope = oldY / oldX
                newY = newX * slope
                newValue = (newX / maxX) * cfg.maxValue
              } else {
                slope = initialSlopes[i]
                if (slope !== Infinity) {
                  newY = newX * slope
                }
                if (oldX !== 0) {
                  newValue = (newX / maxX) * cfg.maxValue
                } else {
                  newValue = (newY / maxY) * cfg.maxValue
                }
              }

              if (maxX * newX < 0) {
                newX = 0
              }
              if (maxY * newY < 0) {
                newY = 0
              }

              let dragX
              let dragY

              if (oldX === 0 && oldY === 0 && (maxY * newY < 0 || maxX * newX < 0)) {
                dragX = 300
                dragY = 300
              } else {
                dragX = newX + 300
                dragY = 300 - newY
              }

              dragTarget
                .attr('cx', function () { return dragX })
                .attr('cy', function () { return dragY })
              d[oldData.order].value = newValue
              vue.$emit('input', d)
              reCalculatePoints()
              drawPoly()
            }
          }
        }
        RadarChart.draw('#radar-chart', this.value)
      }
    },
    watch: {
      value () {
        this.draw()
      }
    },
    async mounted () {
      this.draw()
    }
  }
</script>
