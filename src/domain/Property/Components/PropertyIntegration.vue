<template>
  <data-container
      v-if="integrationId"
      :loading="loading"
      :error="error"
      @retry="getIntegration"
  >
    <template #loading>
      <v-skeleton-loader
          type="article"
      ></v-skeleton-loader>
    </template>
    <slot v-bind="{ integration }">
      <v-alert type="success" border="left" colored-border>
         Integration is set to {{ integration.title }}
        <account-link :path="`/${property.business_id}/integrations`">Manage integration</account-link>
      </v-alert>
    </slot>
  </data-container>
  <v-alert v-else type="error" border="left" colored-border>
      No integration set
  </v-alert>
</template>

<script>
    import gql from "graphql-tag";
    import config from "@/config";
    import {mapActions} from "vuex";
    import AccountLink from "@/components/AccountLink.vue";
    import DataContainer from "@/components/DataContainer.vue";
    export default {
        name: "PropertyIntegration",
      components: { DataContainer, AccountLink},
        data(){
            return {
              loading: false,
              error: null,
              integration: {}
            }
        },
        props: {
            property: Object,
            integrationId: String
        },

        methods: {
          ...mapActions(['query']),

          getIntegration() {
            this.loading = true;
            this.error = null;
            this.query( {
              domain: config.apollo.account,
              query: gql`
                query getBusinessIntegration($business_id: ID!, $integration_id: ID) {
                    getBusinessIntegration(business_id: $business_id, integration_id: $integration_id,) {
                        id
                        title
                    }
                }
                `,
              variables: {
                business_id: this.property.business_id,
                integration_id: this.integrationId,
              }
            }).then(response => {
              this.integration = response.data.getBusinessIntegration
            })
            .catch(e => this.error = e)
            .finally(() => this.loading = false)
          }
        },
        watch: {
          integrationId: {
                immediate: true,
                handler(id){
                    if(id) this.getIntegration()
                }
            }
        }
    }
</script>

