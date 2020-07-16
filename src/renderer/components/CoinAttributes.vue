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
  <section class="coinAttributes">
    <div class="full-bg-img flex-center">
      <div class="container">

        <div class="row" v-if="definitions">
          <div class="col-6">
            <div class="row" v-for="(attribute, index) in definitions.value" :key="attribute.name">
              <v-slider :label="attribute.name" :max="100" step="0" v-model="coinAttributeValues[index]" @input="onAttributeChange" class="col-11"></v-slider>
              <v-text-field type="text" maxlength="3" placeholder="0" v-model.number="coinAttributeValues[index]" v-onlynumbers @input="onAttributeChange" class="col-1"></v-text-field>
            </div>
            <div class="row col-4" v-if="definitions && definitions.value && definitions.value.length !== 0">
              <button type="button" class="btn btn-primary waves-effect
                            waves-light" @click="saveCoinAttributes()" :disabled="hasNotChanged">Save</button>
            </div>
          </div>
          <div class="col-lg-6">
            <draggable-radar v-model.number="radarData" @input="onRadarUpdate"></draggable-radar>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import CoinAttributes from '@/components/CoinAttributes'
  import DraggableRadar from '@/components/DraggableRadar.vue'
  const _ = require('lodash')

  export default {
    name: 'coin-attributes',
    title: 'Coin Rating',
    id: 'coin-attributes',
    props: ['coinId'],
    components: {
      'draggable-radar': DraggableRadar
    },
    methods: {
      async saveCoinAttributes () {
        await CoinAttributes.save(this.coinId, this.coinAttributeValues)
        this.originalCoinAttributeValues = _.clone(this.coinAttributeValues)
      },
      onAttributeChange () {
        this.coinAttributeValues = this.coinAttributeValues.map(val => val ? +val.toFixed() : 0)
        this.radarData = CoinAttributes.radarData(this.definitions.value, this.coinAttributeValues)
      },
      onRadarUpdate (radarData) {
        this.coinAttributeValues = radarData.map(o => +o.value.toFixed())
      },
      async buildAttributes (coinId) {
        let coinInfo = await CoinAttributes.get(coinId)
        if (coinInfo.definition) {
          this.definitions = coinInfo.definition
          let attributeNames = this.definitions.value.map(val => val.name)
          let attributeValues
          if (_.isEmpty(coinInfo.data)) {
            attributeValues = new Array(attributeNames.length).fill(0)
          } else if (coinInfo.data[0].length < attributeNames.length) {
            attributeValues = coinInfo.data[0].values.concat(new Array(attributeNames.length - coinInfo.data[0].length).fill(0))
          } else {
            attributeValues = coinInfo.data[0].values
          }
          this.coinAttributeValues = attributeValues
          this.originalCoinAttributeValues = _.clone(attributeValues)
          this.onAttributeChange()
        }
      }
    },
    computed: {
      hasNotChanged () {
        return _.isEqual(this.coinAttributeValues, this.originalCoinAttributeValues)
      }
    },
    data () {
      return {
        definitions: [],
        originalCoinAttributeValues: [],
        coinAttributeValues: [],
        radarData: []
      }
    },
    mounted () {
      this.buildAttributes(this.coinId)
    },
    watch: {
      async coinId (newCoinId) {
        this.buildAttributes(newCoinId)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.coinAttributes {
  .input-group__input {
    display: none !important;
  }
  .input-group__input input {
    text-align: center !important;
  }
  .input-group.input-group--slider label {
    min-width: 85px !important;
  }
  .input-group__input input {
    margin-top: -16px !important;
  }
  .input-group__details {
    display: none !important;
  }
}
</style>
