<template>
  <data-container :loading="loading" :error="error" @retry="getPropertyBusinessCards">
    <div v-if="cards.length" >
      <v-radio-group
          v-model="creditCard"
          :rules="[(value) => !value ? 'Select a credit card' : true]"
      >
        <v-radio
            v-for="(card, c) in cards" :key="c"
            :value="card"
        >
          <template #label>
            <div class="pr-2" style="width: 100%">
              <stripe-credit-card class="my-1" :card="card" />
            </div>
          </template>
        </v-radio>
      </v-radio-group>
      <div class="text-center">
        <account-link :path="`/${property.business_id}/credit-cards`">
          Add another card
        </account-link>
      </div>
    </div>
  </data-container>
</template>
<script>
import GET_PROPERTY_AS_CUSTOMER from "@/domain/Property/Queries/getPropertyAsCustomer";
import DataContainer from "@/components/DataContainer";
import StripeCreditCard from '@/components/Utilities/StripeCreditCard.vue';
import {mapActions} from "vuex";
import config from "@/config";
import AccountLink from "@/components/AccountLink.vue";

export default {
  name: "PropertyCreditCardSelect",
  components: { AccountLink, DataContainer, StripeCreditCard },
  data() {
    return {
      loading: false,
      error: null,
      creditCard: null,
      customer: null,
    }
  },
  props: {
    property: Object
  },
  computed: {
    stripePublishableKey(){
      return process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY
    },
    cards(){
      return this.customer && this.customer.sources ? this.customer.sources.data : []
    },
  },
  methods: {
    ...mapActions([
      'query'
    ]),

    getPropertyBusinessCards() {
      this.loading = true;
      this.error = null;
      this.$store.dispatch('query', {
        domain: config.apollo.account,
        query: GET_PROPERTY_AS_CUSTOMER,
        variables: {
          id: this.property.business_id
        }
      }).then(response => {
        this.customer = response.data.getBusinessById?.stripe_customer;
      })
      .catch(e => {
        this.error = e
      })
      .finally(() => {
        this.loading = false;
      })
    }
  },
  watch: {
    property: {
      immediate: true,
      handler() {
        this.getPropertyBusinessCards()
      }
    },
    creditCard: {
      immediate: true,
      handler(card) {
        this.$emit("input", card);
      }
    }
  }
}
</script>