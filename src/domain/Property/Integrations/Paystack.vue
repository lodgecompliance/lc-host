<template>
    <integration-setup
        :open="open"
        title="Paystack"
        :subtitle="`Paystack integration for ${ property.name }`"
        :fetch-query="getQuery"
        @fetched="paystackFetched"
        @close="open = false"
    >
      <property-integration
          :property="property"
          :integration-id="paystack.integration_id"
      />
    </integration-setup>
</template>

<script>
import gql from 'graphql-tag';
import IntegrationSetup from "@/domain/Property/Integrations/Setup";
import PropertyIntegration from "@/domain/Property/Components/PropertyIntegration.vue";


export default {
    name: "PaystackGateway",
    components: {PropertyIntegration, IntegrationSetup },
    data(){
        return {
            open: false,
            paystack: {},
            getQuery: {}
        }
    },
    props: {
        property: Object,
    },
    methods: {
      paystackFetched(response) {
        this.paystack = response.getPropertyById?.integrations?.paystack || {};
        this.setForm();
      },

      setForm() {
        const paystack = this.paystack || {};
        this.form = {
          integration_id: paystack.integration_id
        }
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
                  paystack {
                    integration_id
                  }
                }
              }
            }`,
            variables: {
              id: this.property.id
            }
          }
        }
      }
    }
}
</script>