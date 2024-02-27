<template>
  <v-card flat>
      <v-card-text>
        <error-handler :error="error" @retry="getDevices" />
        <data-container :loading="loading">
              <v-list v-if="items.length" class="mt-5">
                  <v-list-item
                  v-for="device in items" :key="device.id" >
                      <v-list-item-content>
                          <v-list-item-title>{{ device.attributes.name }}</v-list-item-title>
                      </v-list-item-content>
                  </v-list-item>
              </v-list>
          <div v-else class="py-5 text-center grey--text">
            No device
          </div>
          </data-container>
      </v-card-text>
  </v-card>
</template>

<script>
import gql from 'graphql-tag';
import DataContainer from '../../../../components/DataContainer.vue';
import ErrorHandler from "@/components/ErrorHandler.vue";

export default
  {
    name: "RemoteLockDevices",
    components: {ErrorHandler, DataContainer },
    data(){
        return {
            loading: false,
            devices: null,
            error: null
        }
    },
    props: {
        property: Object,
    },
    computed: {
        items() {
            return this.devices && this.devices.data ? this.devices.data : [];
        },
    },
    methods: {

        getDevices(){
            this.loading = true;
            this.error = null;
            this.$store.dispatch('query', {
                query: gql`
                    query getPropertyById($id: ID!) {
                        getPropertyById(id: $id) {
                          remotelock_devices {
                            data {
                                id
                                type
                                attributes {
                                    name
                                }
                            }
                          }
                        }
                    }`,
                variables: {
                    id: this.property.id
                }
            })
            .then(response => {
                this.devices = response.data.getPropertyById?.remotelock_devices
            })
            .catch(e => this.error = e )
            .finally(() => this.loading = false )
        },
    },
    watch: {
      property: {
        immediate: true,
        handler() {
          this.getDevices()
        }
      }
    }
}
</script>