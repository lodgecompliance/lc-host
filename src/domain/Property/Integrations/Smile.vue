<template>
    <integration-setup
        :open="open"
        title="Smile"
        :subtitle="`Smile integration for ${ property.name }`"
        :fetch-query="getQuery"
        @fetched="smileFetched"
        @close="open = false"
    >
      <property-integration
          :property="property"
          :integration-id="smile.integration_id"
      />
    </integration-setup>
</template>

<script>
import gql from 'graphql-tag';
import IntegrationSetup from "@/domain/Property/Integrations/Setup";
import PropertyIntegration from "@/domain/Property/Components/PropertyIntegration.vue";

export default {
    name: "SmileGateway",
    components: {PropertyIntegration, IntegrationSetup },
    data(){
        return {
            open: false,
            getQuery: {},
            smile: {},
        }
    },
    props: {
        property: Object,
    },
    methods: {
      smileFetched(response) {
        this.smile = response.getPropertyById?.integrations?.smile || {};
        this.setForm();
      },
      setForm() {
        const smile = this.smile || {};
        this.form = {
          integration_id: smile.integration_id
        }
      }
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
                     smile {
                         integration_id
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