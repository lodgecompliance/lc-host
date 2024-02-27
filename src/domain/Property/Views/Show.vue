<template>
    <app-layer
        ref="app"
        :breadcrumbs="currentBreadcrumbs.concat(breadcrumbs)"
        :header-space="headerSpace"
    >
        <template #header>
          <slot name="header" />
        </template>
        <data-container :loading="loading">
            <template v-slot:loading>
                <property-skeleton />
            </template>
            <v-container v-if="!property">
                <div class="text-center grey--text">
                    <h4>We could not find that property</h4>
                </div>
            </v-container>
            <slot v-else v-bind="property">
              <v-row
                  align="center"
                  justify="center"
              >
                <v-col class="text-center" cols="12" md="6">
                  <v-sheet class="pa-3" rounded>
                    <v-avatar color="primary" size="150">
                      <v-img
                          :src="property.image"
                      ></v-img>

                    </v-avatar>
                    <div class="d-flex justify-center align-center">
                      <h1>{{ property.name }}</h1>
                      <v-btn v-if="property.access" icon title="Edit property" color="primary" class="ml-3" @click="$router.push({name: 'property.settings', params: { property: property.id }})">
                        <v-icon>mdi-cog</v-icon>
                      </v-btn>
                    </div>
                    <p>{{ property.address }}</p>
                    <v-icon color="white" v-if="property.phone">mdi-phone</v-icon> {{ property.phone }}
                    <br>
                    <v-icon color="white" v-if="property.email">mdi-email</v-icon>  {{ property.email }}
                  </v-sheet>
                </v-col>
              </v-row>
            </slot>
        </data-container>
    </app-layer>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';

import AppLayer from '@/AppLayer';
import DataContainer from '../../../components/DataContainer.vue';
import PropertySkeleton from '../Components/PropertySkeleton.vue';

import GET_PROPERTY from '../Queries/getProperty';

export default {
    name: 'Property',
    components: {
        AppLayer, DataContainer, PropertySkeleton
    }, 
    data(){
        return {
            loading: false,
            property: null,
        }
    },
    props: {
      breadcrumbs: Array,
      headerSpace: Number
    },
    computed:{
      ...mapGetters([
          'current_user',
          'properties',
      ]),
       id(){
          return this.$route.params.property;
      },
      currentBreadcrumbs(){
        return [
          {
            text: "Properties",
            to: { name: 'property.list' }
          },
          {
            text: this.property?.name || this.id,
            to: { name: 'property.show', params: { property: this.id } }
          },
        ]
      }
    },
    methods:{
        ...mapActions([
            'query',
            'mutate',
        ]),
        ...mapMutations([
            'SET_ACTIVE_PROPERTY',
            'SET_MODE'
        ]),

        getProperty(){
            this.loading = true;
            this.query({
                query: GET_PROPERTY,
                variables: {
                    id: this.id
                }
            })
            .then(response => {
                this.property = response.data.getPropertyById;
                if(this.property) {
                  const propertyInAuth = this.properties.find(p => p.id === this.property.id);
                  if(propertyInAuth) {
                    this.SET_ACTIVE_PROPERTY(propertyInAuth);
                    this.SET_MODE('host');
                  }
                }
            })
            .catch(e => {
                this.$refs.app.toastError({
                    message: `Could not get property.`,
                    retry: () => this.getProperty(),
                    exception: e
                });
            })
            .finally(() => {
                this.loading = false;
            })
        }
    },
    watch: {
      id: {
        immediate: true,
        handler(id) {
          if(id) this.getProperty();
        }
      }
    }
}
</script>
