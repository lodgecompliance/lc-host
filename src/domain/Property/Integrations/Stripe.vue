<template>          
    <integration-setup
        :open="open"
        title="Stripe"
        :subtitle="`Stripe for ${ property.name }`"
        :fetch-query="getQuery"
        @fetched="stripeFetched"
        @close="open = false"
    >
      <property-integration
          :property="property"
          :integration-id="stripe.integration_id"
      />
      <error-handler :error="error" :can-retry="false" />
      <v-form ref="form">
        <v-switch
            label="Always use 3D secure"
            inset dense
            v-model="form.payment.always_use_3d_secure"
        >
        </v-switch>
      </v-form>

      <template #actions>
        <v-btn @click="save" color="primary" :loading="saving" depressed>Save changes</v-btn>
      </template>
    </integration-setup>
</template>

<script>
import gql from 'graphql-tag';
import IntegrationSetup from "@/domain/Property/Integrations/Setup";
import ErrorHandler from "@/components/ErrorHandler.vue";
import PropertyIntegration from "@/domain/Property/Components/PropertyIntegration.vue";

export default {
    name: "PropertyStripeGateway",
    components: {
      PropertyIntegration,
      ErrorHandler,
      IntegrationSetup
    },
    props: {
        property: Object,
    },
    data(){
        return {
            open: false,
            getQuery: {},
            stripe: {},
            form: {
              payment: {
                always_use_3d_secure: false,
              },
            },
            saving: false,
            error: null,
        }
    },

    methods: {
      stripeFetched(response) {
        this.stripe = response.getPropertyById?.integrations?.stripe || {};
        this.setForm();
      },

      setForm() {
        const stripe = this.stripe || {}
        this.form = {
          payment: {
            always_use_3d_secure: stripe?.payment?.always_use_3d_secure || false
          }
        }
      },

      save() {
          this.saving = true;
          this.error = null;
          this.$store.dispatch('mutate', {
              mutation: gql`
              mutation setPropertyStripeIntegration($property_id: ID!, $data: PropertyStripeIntegrationSettingInput!) {
                  setPropertyStripeIntegration(property_id: $property_id, data: $data) {
                      payment {
                          always_use_3d_secure
                      }
                  }
              }
              `,
              variables: {
                  property_id: this.property.id,
                  data: this.form
              }
          })
          .then(response => {
              const stripe = response.data.setPropertyStripeIntegration;
              if(stripe) {
                  Object.assign(this.stripe, stripe)
                  this.$store.commit("SNACKBAR", {
                      status: true,
                      text: "Stripe updated",
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
                    stripe {
                      integration_id
                      payment {
                          always_use_3d_secure
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