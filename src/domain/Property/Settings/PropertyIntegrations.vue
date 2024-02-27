<template>
    <section>
      <div class="d-flex flex-wrap justify-space-between">
        <slot name="heading" />
      </div>
      <data-container :loading="loading">
          <v-row>
            <v-col cols="12" md="6" v-for="integration in integrations" :key="integration.id">
              <v-card flat rounded height="150">
                <v-card-title>
                  <h5>{{ integration.name }}</h5>
                </v-card-title>
                <v-card-text>
                  <v-chip v-for="(tag, t) in integration.tags" :key="t"
                      color="grey" class="mr-1" dark small outlined
                  >{{tag}}
                  </v-chip>
                  {{ integration.description }}
                  <component :is="integration.component"
                      :property="property"
                      :ref="integration.id"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-btn v-if="property.integrations[integration.id] && property.integrations[integration.id].integration_id" color="success" small text>
                     <v-icon small>mdi-check-circle</v-icon> ACTIVE
                  </v-btn>
                  <v-btn v-else color="error" small text>
                    <v-icon small>mdi-close-circle</v-icon> NOT ACTIVE
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text @click="$refs[integration.id][0].open = true" small>
                    {{ integration.openText ? integration.openText : 'Setup' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </data-container>
    </section>
</template>

<script>
import DataContainer from '../../../components/DataContainer.vue';
import ApiKey from '../Integrations/Api.vue';
import Zapier from '../Integrations/Zapier.vue';
import Ezee from '../Integrations/Ezee.vue';
import Stripe from '../Integrations/Stripe.vue';
import Paystack from '../Integrations/Paystack.vue';
import Smile from '../Integrations/Smile.vue';
import Mailgun from '../Integrations/Mailgun.vue';
import MessageBird from '../Integrations/MessageBird.vue';
import RemoteLock from '../Integrations/RemoteLock/RemoteLock.vue';

export default {
    name: "PropertyIntegrations",
    components: {
        DataContainer, ApiKey, Zapier, Ezee,
        Stripe, Paystack, Smile, Mailgun, MessageBird, RemoteLock
    },
    props: {
        property: Object,
    },

    data(){
        return {
            loading: false,
            integrations: [
              {
                id: "api",
                name: "API",
                description: "",
                tags: ["Authentication"],
                component: "api-key",
              },
              {
                id: "zapier",
                name: "Zapier",
                description: "",
                tags: ["Automation"],
                component: "zapier",
                openText: "Check status"
              },
              {
                id: "ezee",
                name: "Ezee",
                description: "",
                tags: ["Booking"],
                component: "ezee",
              },
              {
                id: "stripe",
                name: "Stripe",
                description: "",
                tags: ["Identity", "Payment"],
                component: "stripe",
              },
              {
                id: "paystack",
                name: "Paystack",
                description: "",
                tags: ["Payment"],
                component: "paystack",
              },
              {
                id: "mailgun",
                name: "Mailgun",
                description: "",
                tags: ["Communication"],
                component: "mailgun",
              },
              {
                id: "messageBird",
                name: "MessageBird",
                description: "",
                tags: ["Communication"],
                component: "message-bird",
              },
              {
                id: "remotelock",
                name: "Remotelock/Lockstate",
                description: "",
                tags: ["Access Control"],
                component: "remote-lock",
              }
            ]
        }
    },
}
</script>