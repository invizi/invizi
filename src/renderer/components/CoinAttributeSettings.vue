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
  <section class="">
    <div class="full-bg-img flex-center">
      <div class="container">

        <div class="row">
          <table class="table large-header table-simple">
            <thead>
              <tr>
                <th style="width: 30px;"></th>
                <th></th>
              </tr>
            </thead>
            <tr v-for="attribute in definitionsValue" v-bind:key="attribute.name">
              <td class="text-left">
                <a href="#" @click="deleteAttribute(attribute)"><i class="fa fa-minus-circle" title="delete"></i></a>
              </td>
              <td class="text-left">{{attribute.name}} </td>
            </tr>
          </table>
        </div>
        <div class="row" style="margin-top: 40px;">
          <div class="col-lg-2">
            <button type="button" class="btn btn-sm btn-primary waves-effect
                          waves-light" @click="addAttribute()">Add Attribute</button>
          </div>
          <div class="col-lg-4">
            <v-text-field
              label="Name"
              single-line
              v-if="newDefinition !== null"
              v-model="newDefinition"
            ></v-text-field>
          </div>
          <div class="col-lg-2">
            <button type="button" class="btn btn-sm btn-primary waves-effect
                          waves-light" v-if="newDefinition !== null" :disabled="newDefinition === ''" @click="saveAttribute()">Add</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import CoinAttributes from '@/components/CoinAttributes'
  export default {
    name: 'coin-attribute-settings',
    methods: {
      addAttribute () {
        this.newDefinition = 'Attribute1'
      },
      async saveAttribute () {
        this.definitions = await CoinAttributes.addAttribute({name: this.newDefinition})
        this.definitionsValue = this.definitions.value
        this.newDefinition = null
      },
      async deleteAttribute (attribute) {
        this.definitions = await CoinAttributes.deleteAttribute(attribute.name)
        this.definitionsValue = this.definitions.value
      },
      async setDefault () {
        await CoinAttributes.restoreDefaultAttributes()
        this.definitions = await CoinAttributes.getDefinitions()
        this.definitionsValue = this.definitions.value
      }
    },
    data () {
      return {
        definitions: [],
        definitionsValue: null,
        newDefinition: null
      }
    },
    async mounted () {
      this.definitions = await CoinAttributes.getDefinitions()
      this.definitionsValue = this.definitions.value
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
