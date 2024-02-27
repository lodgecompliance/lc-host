<template>
    <app-layer ref="app" :breadcrumbs="breadcrumbs" :header-space="0">
        <template #header>
          <v-row justify="center">
            <v-col cols="12" md="10">
              <div class="d-flex">
                <h4 class="headline">Properties</h4>
              </div>
            </v-col>
          </v-row>
        </template>
        <v-container>
            <data-container :loading="loading">
                <template v-slot:loading>
                    <v-row>
                        <v-col cols="12" sm="6" md="4" v-for="i in 6" :key="i">
                            <property-card-skeleton class="ma-2" />
                        </v-col>
                    </v-row>
                </template>

                  <v-row v-if="properties.length">
                    <v-col v-for="property in properties" :key="property.id"
                    cols="12" sm="6" md="4" >
                        <property-card :_property="property">
                            <template #action>
                                <v-icon v-if="property.active" color="success" class="mx-2" title="Active">mdi-check-circle</v-icon>
                                <v-icon v-else color="error"  class="mx-2" title="Not Active">mdi-close-circle</v-icon>
                                <router-link :to="{ name: 'property.settings', params: { property: property.id } }" class="text-decoration-none">
                                    <v-btn icon><v-icon>mdi-cog</v-icon></v-btn>
                                </router-link >
                            </template>
                        </property-card>
                    </v-col>
                </v-row>
                  <v-sheet v-else class="pa-2" rounded>
                  <div class="text-center py-16">
                      <p class="grey--text">No property yet</p>
                  </div>
                </v-sheet>
            </data-container>
        </v-container>
    </app-layer>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

import AppLayer from '@/AppLayer.vue';
import PropertyCard from '../Components/PropertyCard.vue';
import DataContainer from '../../../components/DataContainer.vue';
import PropertyCardSkeleton from '../Components/PropertyCardSkeleton.vue';
export default {
  name: 'PropertyList',
  components: {
    AppLayer, PropertyCard, DataContainer, PropertyCardSkeleton
  },
  data(){
     return {
         loading: false,
     }
  },
  computed: {
     ...mapGetters([
        'current_user',
         'properties',
     ]),
    breadcrumbs(){
      return [
        {
          text: "Properties",
          to: this.$route
        }
      ]
    }
  },
}
</script>
