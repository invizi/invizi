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
    <div v-if="!this.trade.quantity_from" class="outer-label">
      <i class="fa fa-angle-double-right light-green-text action-icon" aria-hidden="true"></i><span>Deposited</span>
    </div>
    <div v-else-if="!this.trade.quantity_to" class="outer-label">
      <i class="fa fa-angle-double-left deep-orange-text action-icon" aria-hidden="true"></i><span>Withdrawn</span>
    </div>
    <div v-else-if="isSold(this.trade)" class="outer-label">
      <i class="fa fa-angle-left deep-orange-text action-icon" aria-hidden="true"></i><span>Sold</span>
    </div>
    <div v-else class="outer-label">
      <i class="fa fa-angle-right light-green-text action-icon" aria-hidden="true"></i><span>Bought</span>
    </div>
    <span v-if="tradeObject">
      <span v-if="tradeObject.quantity > 0" style="display:inline-block; min-width: 120px;">{{ tradeObject.quantity }}</span>
      <coin-image-text :coin-id='tradeObject.quantityUnit' :label="tradeObject.quantityUnit" style="display:inline-block"/>
      <span v-if="tradeObject.price > 0">
        at {{tradeObject.price}}  {{tradeObject.priceUnit}}
      </span>
    </span>
  </div>
</template>

<script>
  import Trade from '@/models/Trade'
  import CoinImageText from '@/components/CoinImageText'
  export default {
    props: ['trade'],
    components: {
      'coin-image-text': CoinImageText
    },
    computed: {
      tradeObject () {
        return new Trade(this.trade)
      }
    },
    methods: {
      isSold (obj) {
        return Trade.isSold(obj)
      }
    }
  }
</script>

<style scoped>
  .transparent {
    display: none;
  }
  .action-icon {
    margin-right: 10px;
  }

  .outer-label {
    display:inline-block;
    min-width: 90px;
  }
</style>
