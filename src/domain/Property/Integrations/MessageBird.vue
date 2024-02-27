<template>
    <integration-setup
        :open="open"
        title="MessageBird"
        :subtitle="`MessageBird integration for ${ property.name }`"
        :fetch-query="getQuery"
        @fetched="messageBirdFetched"
        @close="open = false"
    >
      <error-handler :error="error" />
      <property-integration
          :property="property"
          :integration-id="messageBird.integration_id"
      />
      <v-form ref="form" >
          <h6 class="headline text-h6">Channels</h6>
          <v-checkbox
              v-for="channel in channels" :key="channel"
              v-model="form.channels"
              :value="channel"
              dense
              class="my-0"
          >
            <template #label>
              {{ channel.charAt(0).toUpperCase()+channel.slice(1) }}
            </template>
          </v-checkbox>
      </v-form>
        <template #actions >
            <v-btn color="primary" :loading="saving" @click="updateIntegration" depressed>Save changes</v-btn>
        </template>
    </integration-setup>
</template>

<script>
import { mapActions } from 'vuex';
import gql from 'graphql-tag';
import IntegrationSetup from "@/domain/Property/Integrations/Setup";
import ErrorHandler from "@/components/ErrorHandler.vue";
import PropertyIntegration from "@/domain/Property/Components/PropertyIntegration.vue";

export default {
    name: "MessageBird",
  components: {PropertyIntegration, ErrorHandler, IntegrationSetup},
  data() {
        return {
            open: false,
            getQuery: {},
            messageBird: {},
            form: {},
            channels: ['sms', 'whatsapp'],
            saving: false,
            error: null,
        }
    },
    props: {
        property: Object,
        credentials: Object
    },

    methods: {
      ...mapActions([
          'mutate'
      ]),

      messageBirdFetched(response) {
          this.messageBird = response.getPropertyById?.integrations?.message_bird || {};
          this.setForm();
      },

      setForm() {
        const integration = this.messageBird || {};
        this.form = {
          channels: integration.channels
        }
      },

      updateIntegration() {
            this.error = null;
            this.saving = true;
            this.mutate({
                mutation: gql`
                mutation setPropertyMessageBirdIntegration($property_id: ID!, $data: PropertyMessageBirdIntegrationInput!) {
                    setPropertyMessageBirdIntegration(property_id: $property_id, data: $data) {
                        channels
                    }
                }`,
                variables: {
                    property_id: this.property.id,
                    data: this.form
                }
            })
            .then(response => {
                const update = response.data.setPropertyMessageBirdIntegration
                if(update) {
                    Object.assign(this.messageBird, update);
                    this.$store.commit("SNACKBAR", {
                        status: true,
                        text: "Message Bird updated",
                        color: "success"
                    });
                }
            })
            .catch(e => {
                this.error = e;
            })
            .finally(() => {
                this.saving = false;
            })
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
                    message_bird {
                        integration_id
                        channels
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