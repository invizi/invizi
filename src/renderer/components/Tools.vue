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
  <invizi-tabs :comps="comps"></invizi-tabs>
</template>

<script>
  import InviziTabs from '@/components/InviziTabs'
  import ExportTrades from '@/components/ExportTrades'
  import ImportTrades from '@/components/ImportTrades'
  import DeleteDatabase from '@/components/DeleteDatabase'
  import AppMixin from '@/components/AppMixin'

  export default {
    name: 'tools',
    mixins: [AppMixin],
    components: {
      'invizi-tabs': InviziTabs
    },
    data () {
      return {
        comps: [ExportTrades, ImportTrades, DeleteDatabase]
      }
    }
  }
</script>
