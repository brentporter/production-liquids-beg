<template>
<div>
  <v-card
      style="background-color: black !important;"
      class="mx-auto"
      prepend-icon="mdi-cogs"
      width="400"
  >
    <template v-slot:title>
      <span class="font-weight-black" style="color: whitesmoke">Production Years</span>
    </template>
    <template v-slot:subtitle>
      <span style="color: whitesmoke">Choose Year -<br/>
        Current Display {{store.selectedProduction}} Produced for {{store.selectedProductionYear}}</span>
    </template>

    <v-card-text class="bg-surface-dark pt-4">
      <v-btn color="orange" class="ma-2" size="small" @click="showYears =!showYears">Production Years</v-btn>
    </v-card-text>
    <v-expand-transition>
      <div v-show="showYears" style="min-height: 180px;">
        <v-divider></v-divider>

          <v-chip-group column class="pl-2 pl-md-4"  v-model="store.selectedProductionYear" @update:model-value="store.setSelectedProductionYear"
              selected-class="error"
          >
            <v-chip
                v-for="year in aryProdYears"
                :key="year"
                :text="year"
                variant="flat"
                :value="year"
                v-model="store.selectedProductionYear"
                :color="getRandomColorProduction(year)"
                @click="toggleChipYear(year)"
            ></v-chip>
          </v-chip-group>
      </div>
    </v-expand-transition>
  </v-card>
</div>
</template>
<script setup>

import {ref} from "vue";
import { useDisplay } from 'vuetify'
import {useMapStore} from "../stores/mapStore.js";
const { smAndDown, mdAndUp } = useDisplay()
const store = useMapStore()

//let selectedChipYear = ref('')
let showProduction = ref(false)
let showYears = ref(true)

let currentDisplayProduct = store.selectedProduction
let currentDisplayYear = store.selectedProductionYear

const chipColorsProd = [
  'secondary',
  'blue-grey',
  'success',
  'info',
  'warning',
  'error',
  'purple',
  'amber',
  'cyan',
  'teal',
  'pink',
  'primary',
  'orange',
  'indigo',
  'green',
  'lime',
  'deep-orange',
  'brown',
]

const aryProdYears =['2010','2011','2012','2013','2014',
  '2015','2016','2017','2018',
  '2019','2020','2021','2022','2023','2024','2025']

function toggleChipYear(incomingYear){
  console.log(incomingYear);
  store.setSelectedProductionYear(incomingYear)
}

function toggleChipProduct(incomingProduct){
  console.log(incomingProduct);
  store.setProductionType(incomingProduct);

}

const getRandomColorProduction = (countyName) => {
  // Use county name to generate consistent hash for color selection
  let hash = 0
  for (let i = 0; i < countyName.length; i++) {
    hash = countyName.charCodeAt(i) + ((hash << 3) - hash)
    //console.log(hash);
  }
  const colorIndex = Math.abs(hash) % chipColorsProd.length
  return chipColorsProd[colorIndex]
}

const productionTags = [
  'Gas',
  'Water',
  'Liquid (Oil)',
]

</script>

<style scoped>

</style>