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
    <div v-for="color in newPieColors" :style="{'background-color': color}">{{color}}</div>
    {{newPieColors.length}}
    <div v-for="color in monochromaticColors" :style="{'background-color': color}">{{color}}</div>
    {{monochromaticColors.length}}
  </div>
</template>

<script>
 import InviziPlot from '@/components/InviziPlot'

 export default {
   data () {
     return {
       niceColors: ['hsl(0, 0%, 0%)'],
       monochromaticColors: [],
       newPieColors: []
     }
   },
   mounted () {
     this.newPieColors = InviziPlot.rainbow(9)
     this.monochromaticColors = InviziPlot.monochromatic(18)
   }
 }
</script>
