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
import assert from './assert.js'
const _ = require('lodash')

const colorPalettes = [
  [
    'rgb(168,94,233)',
    'rgb(220,77,209)',
    'rgb(255,64,178)',
    'rgb(255,65,145)',
    'rgb(255,84,111)',
    'rgb(255,111,78)',
    'rgb(255,139,46)',
    'rgb(255,166,0)'
  ],
  [
    'rgb(106,184,181)',
    'rgb(216,180,19)',
    'rgb(98, 193, 147)',
    'rgb(93,189,168)',
    'rgb(117,195,119)',
    'rgb(179,189,54)',
    'rgb(145,193,88)',
    'rgb(255,166,0)'
  ],
  [
    'rgb(51, 194, 47)',
    'rgb(234, 173, 0)',
    'rgb(133, 190, 0)',
    'rgb(188, 183, 0)',
    'rgb(255, 166, 0)',
    'rgb(212, 178, 0)',
    'rgb(100, 193, 16)',
    'rgb(162, 187, 0)'
  ]]

const defaultFontLayout = {
  font: {
    family: 'Fira Mono',
    color: '#dadada'
  }
}.freeze

const titlefontColor = '#FFF'
const tickfontColor = titlefontColor
const usdColor = 'hsl(120, 100%, 75%)'
// const usdColorDark = 'hsl(120, 31%, 75%)'
const btcColor = 'hsl(52, 91%, 65%)'
// const btcColorDark = 'hsl(52, 31%, 65%)'
const bgColor = 'rgba(0,0,0,0)'
// const lightGray = '#333333'

const usdTrace = Object.freeze({
  type: 'scatter',
  mode: 'lines',
  name: 'USD',
  marker: {
    color: usdColor,
    size: 12
  },
  line: {
    color: usdColor,
    width: 2
  }
})

const btcTrace = Object.freeze({
  type: 'scatter',
  mode: 'lines',
  name: 'BTC',
  yaxis: 'y2',
  line: {
    color: btcColor,
    width: 2
  }
})

const smaTrace = (smaDuration) => {
  return {
    type: 'scatter',
    mode: 'lines',
    name: `SMA(${smaDuration})`,
    yaxis: 'y1',
    line: {
      color: 'hsl(330, 100%, 77%)',
      width: 1
    }
  }
}

const historicalUsdBtcLayout = Object.freeze(Object.assign({}, defaultFontLayout, {
  xaxis: {
    showgrid: false,
    automargin: true,
    titlefont: {color: titlefontColor},
    tickfont: {color: tickfontColor}
  },
  yaxis: {
    title: 'USD',
    automargin: true,
    showgrid: false,
    showline: true,
    zeroline: true,
    ticks: 'outside',
    titlefont: {color: usdColor},
    tickfont: {color: usdColor}
  },
  yaxis2: {
    title: 'BTC',
    automargin: true,
    showgrid: false,
    showline: true,
    titlefont: {color: btcColor},
    tickfont: {color: btcColor},
    overlaying: 'y',
    side: 'right'
  },
  legend: {
    x: 0,
    y: 1,
    traceorder: 'normal',
    font: {
      color: '#dadada'
    },
    bgcolor: bgColor
  },
  paper_bgcolor: bgColor,
  plot_bgcolor: bgColor
}))

const InviziPlot = {

  colorPalettes: colorPalettes,

  historicalUsdBtcLayout,
  usdTrace,
  btcTrace,
  smaTrace,

  hexToRgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },

  pieData (palette = 0, numberOfPoints, hue) {
    const result = {
      textinfo: 'label+text',
      hole: 0.7,
      outsidetextfont: {
        color: '#FFF'
      }
    }

    let colors
    if (hue && hue >= 0 && hue <= 360) {
      colors = this.monochromatic(numberOfPoints, hue)
    } else {
      colors = this.rainbow(numberOfPoints)
    }

    if (_.isEmpty(colors)) {
      colors = this.rainbow(20)
    }

    Object.assign(result, {
      marker: {
        colors: colors
      }
    })

    return result
  },

  commonArgOptions: {
    modeBarButtonsToRemove: ['sendDataToCloud'],
    // scrollZoom: true,
    displaylogo: false
  },

  monochromatic (numOfColors, hue = 230) {
    if (!numOfColors || numOfColors.length === 0) return []
    // Hue is constant (or if more colors are needed hue varies by a small amount around that value)
    const MAX_HSL = {
      saturation: 100,
      luminosity: 95
    }

    const MIN_HSL = {
      saturation: 40,
      luminosity: 50
    }

    const numberOfHSL = {
      hue: 1,
      saturation: undefined,
      luminosity: undefined
    }

    const MAX_NUMBER_OF_SATURATIONS = 3
    const MAX_NUMBER_OF_LUMINOSITIES = 14
    if (numOfColors > MAX_NUMBER_OF_SATURATIONS * MAX_NUMBER_OF_LUMINOSITIES) {
      return this.rainbow(numOfColors)
    } else {
      numberOfHSL.saturation = Math.ceil(Math.cbrt(numOfColors))
      numberOfHSL.luminosity = numberOfHSL.saturation ** 2
    }

    const steps = {
      saturation: undefined,
      luminosity: undefined
    }

    // Divide the HSL equally
    Object.keys(MAX_HSL).forEach(key => {
      steps[key] = parseInt((MAX_HSL[key] - MIN_HSL[key]) / (numberOfHSL[key])) // floor the value to int
    })

    let result = []

    for (let currentSaturation = 10; result.length < numOfColors; currentSaturation = currentSaturation + steps.saturation % (MAX_HSL.saturation - MIN_HSL.saturation)) {
      let realSaturation = currentSaturation + MIN_HSL.saturation
      for (let currentLuminosity = MIN_HSL.luminosity; currentLuminosity < MAX_HSL.luminosity && result.length < numOfColors; currentLuminosity += steps.luminosity) {
        result.push(`hsl(${hue}, ${realSaturation}%, ${currentLuminosity}%)`)
      }
    }

    assert(result.length === numOfColors)

    return result
  },

  rainbow (numOfColors) {
    // Hue is different every 7 units
    // Saturation below 15 is grey (so ignore)
    // Saturation needs a max saturation (to avoid too vivid colors with our dark background)
    // Saturation is different every 10 units
    // Luminosity below 10 is too black (so ignore)
    // Luminosity above 97 is too white (so ignore)
    // Luminosity of 50% is neutral to the H and S
    // Luminosity is different every 5 units
    // Difference in luminosity is more easily perceived than saturation for a given Hue
    // Algo
    // Do not have adjacents colors close in Hue unless luminosity is really different
    // First and last should be really spaced
    // For Hue drop the last value (since it's circular 360 = 0 = red)
    if (!numOfColors || numOfColors.length === 0) return []

    const MAX_HSL = {
      hue: 360,
      saturation: 90,
      luminosity: 65
    }

    const MIN_HSL = {
      hue: 0,
      saturation: 20,
      luminosity: 27
    }

    const numberOfHSL = {
      hue: 0,
      saturation: 0,
      luminosity: 0
    }
    const MAX_NUMBER_OF_HUES = 20

    if (numOfColors > MAX_NUMBER_OF_HUES && numOfColors < 4 * MAX_NUMBER_OF_HUES) {
      numberOfHSL.saturation = 2
      numberOfHSL.hue = 20
      numberOfHSL.luminosity = 2
      MIN_HSL.luminosity = 37
    } else if (numOfColors > MAX_NUMBER_OF_HUES) {
      numberOfHSL.saturation = 2
      numberOfHSL.luminosity = 4
      numberOfHSL.hue = Math.ceil(numOfColors / numberOfHSL.luminosity / numberOfHSL.saturation)
    } else {
      numberOfHSL.hue = numOfColors
      numberOfHSL.luminosity = 1
      numberOfHSL.saturation = 1
    }

    const steps = {
      hue: undefined,
      saturation: undefined,
      luminosity: undefined
    }

    // Divide the HSL equally
    Object.keys(MAX_HSL).forEach(key => {
      steps[key] = parseInt((MAX_HSL[key] - MIN_HSL[key]) / (numberOfHSL[key])) // floor the value to int
    })

    let result = []

    for (let currentHue = MIN_HSL.hue + steps.hue; currentHue <= MAX_HSL.hue && result.length <= numOfColors; currentHue += steps.hue) {
      if (numberOfHSL.hue === numOfColors) {
        result.push(`hsl(${currentHue}, ${68}%, ${70}%)`)
      } else {
        for (let currentSaturation = MIN_HSL.saturation; currentSaturation < MAX_HSL.saturation && result.length < numOfColors; currentSaturation += steps.saturation) {
          for (let currentLuminosity = MIN_HSL.luminosity; currentLuminosity < MAX_HSL.luminosity && result.length < numOfColors; currentLuminosity += steps.luminosity) {
            result.push(`hsl(${currentHue}, ${currentSaturation}%, ${currentLuminosity}%)`)
          }
        }
      }
    }

    assert(result.length === numOfColors)

    let sortedResult = []
    let gap = 3
    let index = 0
    let boolResult = Array(result.length).fill(false)
    sortedResult[index] = result[index]
    boolResult[index] = true
    while (sortedResult.length !== numOfColors) {
      index = (index + gap) % result.length
      if (!boolResult[index]) {
        sortedResult.push(result[index])
        boolResult[index] = true
      } else {
        index++
      }
    }

    return sortedResult
  },

  barCharLayout: {
    titlefont: {
      color: '#FFF'
    },
    yaxis: {
      gridcolor: bgColor,
      tickfont: {
        size: '1rem',
        color: titlefontColor
      },
      titlefont: {color: titlefontColor}
    },
    xaxis: {
      tickfont: {
        size: '1rem',
        color: titlefontColor
      },
      titlefont: {color: titlefontColor}
    },
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    legend: {
      x: 0,
      y: 1,
      traceorder: 'normal',
      font: {
        family: 'Fira Mono',
        color: '#dadada'
      },
      bgcolor: bgColor
    }
  },

  pieLayout: {
    titlefont: {
      color: '#FFF'
    },
    showlegend: false,
    legend: {
      x: 0,
      y: 1,
      traceorder: 'normal',
      font: {
        family: 'Fira Mono',
        color: '#dadada'
      },
      bgcolor: bgColor
    },
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor
  }
}
export default InviziPlot
