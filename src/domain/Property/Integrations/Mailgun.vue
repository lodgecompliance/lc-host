<template>
    <integration-setup
        :open="open"
        title="Mailgun"
        :subtitle="`Mailgun integration for ${ property.name }`"
        :fetch-query="getQuery"
        @fetched="mailgunFetched"
        @close="open = false"
    >
      <property-integration
          :property="property"
          :integration-id="mailgun.integration_id"
      />
    </integration-setup>
</template>

<script>
import gql from 'graphql-tag';
import IntegrationSetup from "@/domain/Property/Integrations/Setup";
import PropertyIntegration from "@/domain/Property/Components/PropertyIntegration.vue";

export default {
    name: "MailgunIntegration",
    components: {PropertyIntegration, IntegrationSetup },
    data(){
        return {
            open: false,
            mailgun: {},
            getQuery: {}
        }
    },
    props: {
        property: Object,
    },
    methods: {
      mailgunFetched(response) {
        this.mailgun = response.getPropertyById?.integrations?.mailgun || {};
        this.setForm();
      },
      setForm() {
        const mailgun = this.mailgun || {};
        this.form = {
          integration_id: mailgun.integration_id
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
                    mailgun {
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