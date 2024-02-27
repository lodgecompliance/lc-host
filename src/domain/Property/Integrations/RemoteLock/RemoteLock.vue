<template>          
    <integration-setup
        :open="open"
        title="Remotelock/Lockstate"
        :subtitle="`Remotelock for ${ property.name }`"
        :fetch-query="getQuery"
        @fetched="remotelockFetched"
        @close="open = false"
    >
      <property-integration
          :property="property"
          :integration-id="remotelock.integration_id"
      />
      <error-handler :error="error" :can-retry="false" />
      <v-card flat class="mt-5">
        <v-tabs v-model="tab" >
          <v-tab>
            Configuration
          </v-tab>
          <v-tab>
            Devices
          </v-tab>
          <v-tab>
            Accesses
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <v-row justify="space-around">
                  <v-col>
                    <v-select
                        outlined dense
                        :items="strategies"
                        item-value="value"
                        item-text="label"
                        v-model="settings.pin_strategy"
                        label="PIN Strategy"
                    >
                    </v-select>
                  </v-col>
                  <v-col>
                    <v-text-field
                        outlined
                        dense
                        label="Days in advance"
                        type="number"
                        v-model="settings.days_in_advance"
                        :suffix="`days`"
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row justify="space-around">
                  <v-col>
                    <v-text-field
                        outlined
                        dense
                        label="Start time"
                        type="time"
                        v-model="settings.start_time"
                    >
                    </v-text-field>
                  </v-col>
                  <v-col>
                    <v-text-field
                        outlined
                        dense
                        label="End time"
                        type="time"
                        v-model="settings.end_time"
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-btn @click="save" color="primary" :loading="saving" depressed>Save changes</v-btn>
              </v-card-actions>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <remotelock-devices :property="property" />
          </v-tab-item>
          <v-tab-item>
            <remotelock-accesses :property="property" />
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </integration-setup>
</template>

<script>
import gql from 'graphql-tag';
import config from '../../../../config';
import RemotelockAccesses from './RemoteLockAccesses.vue';
import RemotelockDevices from './RemoteLockDevices.vue';
import IntegrationSetup from "@/domain/Property/Integrations/Setup";
import ErrorHandler from "@/components/ErrorHandler.vue";
import PropertyIntegration from "@/domain/Property/Components/PropertyIntegration.vue";

export default {
    name: "RemoteLockIntegration",
    components: {
      PropertyIntegration,
      ErrorHandler,
      IntegrationSetup,
      RemotelockAccesses,
      RemotelockDevices
    },
    props: {
        property: Object,
    },
    data(){
        return {
            open: false,
            getQuery: {},
            remotelock: {},
            settings: {
              pin_strategy: null,
              start_time: null,
              end_time: null,
              days_in_advance: null
            },
            saving: false,
            error: null,
            connecting: false,
            strategies: [
                {
                    label: "Random 4 digits",
                    value: "random_4_digits"
                }
            ],
          tab: 0
        }
    }, 

    computed: {
        authorization() {
            return this.remotelock ? this.remotelock.authorization : null
        },
    },

    methods: {
        remotelockFetched(response) {
          this.remotelock = response.getPropertyById?.integrations?.remotelock || {};
          this.setForm();
        },

        setForm() {
          const remotelock = this.remotelock || {};
          this.settings = remotelock.settings || {}
        },

        save() {
            this.saving = true;
            this.error = null;
            this.settings.days_in_advance = parseInt(this.settings.days_in_advance);
            this.$store.dispatch('mutate', {
                mutation: gql`
                mutation setPropertyRemoteLockIntegration($property_id: ID!, $data: PropertyRemoteLockIntegrationInput!) {
                    setPropertyRemoteLockIntegration(property_id: $property_id, data: $data) {
                        integration_id
                        settings {
                          pin_strategy
                          start_time
                          end_time
                          days_in_advance
                        }
                    }
                }
                `,
                variables: {
                    property_id: this.property.id,
                    data: {
                      settings: this.settings
                    }
                }
            })
            .then(response => {
                const settings = response.data.setPropertyRemoteLockIntegration;
                if(settings) {
                    this.settings = settings.settings;
                    this.$store.commit("SNACKBAR", {
                        status: true,
                        text: "Remotelock updated",
                        color: "success"
                    });
                }
            })
            .catch(e => this.error = e )
            .finally(() => this.saving = false )
        },
    },

  watch: {
      property: {
        immediate: true,
        handler(property) {
          if(!property) this.getQuery = null;
          this.getQuery = {
            query: gql`
              query getPropertyById($id: ID!){
                getPropertyById(id: $id){
                  integrations {
                      remotelock {
                          integration_id
                          settings {
                              pin_strategy
                              start_time
                              end_time
                              days_in_advance
                          }
                      }
                  }
                }
              }`,
            variables: {
              id: property.id
            }
          }
        }
      }
    }
}
</script>