<template>
    <integration-setup
        :open="open"
        title="Ezee"
        :subtitle="`Ezee integration for ${ property.name }`"
        :fetch-query="getQuery"
        @fetched="ezeeFetched"
        @close="open = false"
    >
      <property-integration
          :property="property"
          :integration-id="ezee.integration_id"
      />
      <error-handler :error="pollError" />
      <template v-if="ezee && ezee.last_report">
          <small class="grey--text">Last Report</small>
          <div>
            <span v-if="lastPoll">{{ lastPoll.format('MMMM Do YYYY, hh:mm a') }}, {{ lastPoll.fromNow() }}</span>
            <span v-else>Never polled</span>
          </div>
          <v-alert
              color="primary"
              border="left"
              colored-border
              icon="mdi-information"
          >
            {{ ezee.last_report }}
          </v-alert>
        </template>
      <template #actions>
        <v-btn color="primary" text @click="poll" :loading="polling" :disabled="!ezee.integration_id">
         <v-icon>mdi-sync</v-icon> Poll Now
        </v-btn>
      </template>
    </integration-setup>
</template>

<script>
import gql from 'graphql-tag';
import moment from 'moment';
import helper from '@/helper';
import IntegrationSetup from "@/domain/Property/Integrations/Setup";
import PropertyIntegration from "@/domain/Property/Components/PropertyIntegration.vue";
import ErrorHandler from "@/components/ErrorHandler.vue";

export default {
    name: "Ezee",
    components: {ErrorHandler, PropertyIntegration, IntegrationSetup },
    data(){
        return {
            open: false,
            getQuery: {},
            polling: false,
            pollAlert: false,
            pollReport: null,
            ezee: {},
            form: {},
            pollError: null
        }
    },
    computed: {
        lastPoll() {
            if(!this.ezee.last_poll) return null;
            return moment.unix(this.ezee.last_poll);
        }
    },

    props: {
        property: Object,
    },

    methods: {

      setForm() {
        const ezee = this.ezee || {}
        this.form = {
          integration_id: ezee.integration_id
        }
      },
      ezeeFetched(response) {
        this.ezee = response.getPropertyById?.integrations?.ezee || {};
        this.setForm();
      },

      poll() {
            this.polling = true;
            this.$store.dispatch('mutate', {
                mutation: gql`
                    mutation ezeePoll($property_id: ID!) {
                        ezeePoll(property_id: $property_id) {
                            poll {
                                report
                            }
                        }
                    }
                `,
                variables: {
                    property_id: this.property.id,
                }
            })
            .then(response => {
                if(response.data.ezeePoll) {
                    this.$store.commit("SNACKBAR", {
                        status: true,
                        text: response.data.ezeePoll.poll.report,
                        color: "info"
                    });
                    this.ezee.last_report = response.data.ezeePoll.poll.report;
                    this.ezee.last_poll = helper.nowTimestamp()
                }
            })
            .catch(e => {
                this.pollError = e
            })
            .finally(() => {
                this.polling = false;
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
                    ezee {
                        integration_id
                        last_poll
                        last_report
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