<template>
  <v-dialog
      v-model="dialog"
      width="400"
      scrollable
      persistent
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
          v-bind="$attrs.activator"
          v-on="on"
      >
        <slot><v-icon>mdi-plus</v-icon> Buy Points </slot>
      </v-btn>
    </template>

    <data-container :loading="loading" :error="rateError" @retry="getApplicableRate">
      <template #loading>
        <v-skeleton-loader
            type="article, actions"
        ></v-skeleton-loader>
      </template>

      <template #error="{ error }">
        <v-card>
          <v-card-text>
            <error-handler :error="error" @retry="getApplicableRate" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="red" @click="close" text>Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </template>

      <v-card v-if="step === 'init'">
        <v-card-title>
          <h4 class="headline">Buy Check-in Points</h4>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div v-if="rate" class="text-center">
            <h4 class="my-2">{{ (rate.amount * 100) | money_value(rate.currency) }}/point</h4>
            <h2>{{ (totalAmount * 100)  | money_value(rate.currency)}}</h2>
            <small class="grey--text">Total</small>
          </div>
          <v-form ref="form" class="pt-5" @submit.prevent>
            <user-properties-select
                outlined
                dense
                return-object
                label="Select property"
                v-model="property"
                :rules="[(value) => !!value  || 'Select a property']"
            >
              <template #item="{ item: property, disabled, on }">
                <v-list-item v-on="on" :disabled="disabled">
                  <v-list-item-avatar>
                    <v-img :src="property.image"></v-img>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{property.name}}</v-list-item-title>
                    <v-list-item-subtitle>Balance: {{ property.checkin_points }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </user-properties-select>
            <v-text-field
                outlined dense
                label="Credit Amount"
                :rules="[(value) => value !== '' && value > 0 || 'Enter a valid credit amount']"
                type="number"
                v-model="amount"
                placeholder="Enter credit amount"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="close" text>Cancel</v-btn>
          <v-btn @click.prevent="submitDetails" color="primary" elevation="0" >Buy Points</v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-else-if="rate && step === 'payment'">
        <v-card-title class="align-center">
          <h4  class="headline">Complete Payment</h4>
          <v-spacer></v-spacer>
          <h4 class="grey--text">{{ (totalAmount * 100) | money_value(rate.currency)}}</h4>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text >
          <property-credit-card-select :property="property" v-model="card" />
          <error-handler :error="purchaseError" @retry="completePurchase" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="step = 'init'" text>Cancel</v-btn>
          <v-btn @click.prevent="completePurchase" color="primary" depressed :loading="purchasing" :disabled="!card">Make Payment</v-btn>
        </v-card-actions>
      </v-card>
    </data-container>
  </v-dialog>
</template>

<script>
import UserPropertiesSelect from "@/domain/User/Components/UserPropertiesSelect";
import PropertyCreditCardSelect from "@/domain/Property/Components/PropertyCreditCardSelect";
import {mapActions} from "vuex";
import gql from "graphql-tag";
import DataContainer from "@/components/DataContainer";
import ErrorHandler from "@/components/ErrorHandler";
export default {
  name: "BuyPropertyCredit",
  components: {
    ErrorHandler,
    DataContainer,
    PropertyCreditCardSelect,
    UserPropertiesSelect},
  data() {
    return {
      dialog: false,
      height: 500,
      loading: false,
      purchasing: false,
      step: "init",
      rate: null,
      property: null,
      card: null,
      amount: null,
      rateError: null,
      purchaseError: null,
    }
  },
  computed: {
    totalAmount() {
      if(this.rate) return this.rate.amount * (this.amount || 0);
      return 0;
    }
  },
  methods: {
    ...mapActions([
        'mutate', 'query'
    ]),
    getApplicableRate() {
      this.reteError = null;
      this.loading = true;
      this.rate = null;
      this.query({
        query: gql `query getPropertyById($id: ID!) {
          getPropertyById(id: $id) {
            applicable_checkin_point_rate {
              rate
              amount
              currency
            }
          }
        }`,
        variables: {
          id: this.property.id
        }
      })
      .then(response => {
        this.rate = response.data.getPropertyById?.applicable_checkin_point_rate
      })
      .catch(e => {
        this.rateError = e;
      })
      .finally(() => {
        this.loading = false
      })
    },
    submitDetails() {
      if(!this.$refs.form.validate()) return;
      this.step = "payment";
    },
    close() {
      this.resetForm();
      this.dialog = false;
    },
    resetForm() {
      this.step = 'init';
      this.property = null;
      this.card = null;
      this.amount = null;
    },
    completePurchase() {
      this.purchaseError = null;
      this.purchasing = true;
      this.mutate({
        mutation: gql `
          mutation purchasePropertyCheckinPoint($property_id: ID!, $data: PropertyCheckinPointPurchaseInput!) {
            purchasePropertyCheckinPoint(property_id: $property_id, data: $data) {
              opening_balance
              closing_balance
              reference
              points
              created_at
            }
          }
        `,
        variables: {
          property_id: this.property.id,
          data: {
            points: parseInt(this.amount),
            rate: this.rate.rate,
            card: this.card
          }
        }
      })
      .then(response => {
        this.$emit("purchase", response.data.purchasePropertyCheckinPoint);
        this.$store.commit("SNACKBAR", {
          status: true,
          text: `${this.amount} points purchased`,
          color: "success"
        })
        this.close()
      })
      .catch(e => {
        this.purchaseError = e;
      })
      .finally(() => {
        this.purchasing = false;
      })
    }
  },
  watch: {
    property: {
      immediate: true,
      handler(property) {
        if(property) this.getApplicableRate();
      }
    }
  }
}
</script>