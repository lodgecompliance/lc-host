<template>
  <v-card :loading="submitting" flat>
          <slot name="header">
            <v-card-title>{{ request ? request.title : 'Payment Request' }}</v-card-title>
          </slot>
          <v-card-text class="pt-3">
            <v-form ref="form" @submit.prevent>
              <v-text-field
                  outlined
                  label="Title"
                  placeholder="Enter payment title"
                  :rules="[rules.required]"
                  type="text"
                  v-model="form.title"
                  class="required"
                  dense
              ></v-text-field>
              <v-textarea
                  outlined
                  label="Description"
                  placeholder="Enter payment description"
                  class="required"
                  v-model="form.description"
                  dense
                  :rules="[rules.required]"
              ></v-textarea>
              <v-text-field
                outlined
                label="Amount"
                placeholder="Enter Amount"
                :rules="[rules.required]"
                type="number"
                v-model="form.amount"
                dense
            >
              <template #append>
                <span class="mt-1">{{ reservation.currency }}</span>
              </template>
            </v-text-field>
              <error-handler :error="formError" :can-retry="false" />
            </v-form>
          </v-card-text>
          <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="$emit('cancel')">Cancel</v-btn>
                <v-btn
                    color="primary"
                    @click.prevent="submit"
                    :loading="submitting"
                    depressed
                >
                  {{ request ? 'Save Changes' : 'Submit' }}
                </v-btn>
            </v-card-actions>
        </v-card>
</template>

<script>
import { mapActions } from 'vuex';
import form from '@/mixins/form';
import gql from "graphql-tag";
import ErrorHandler from "@/components/ErrorHandler";
const QLFields = `
id
title
description
amount
timestamp {
  created_at
  updated_at
}
`
export default {
  name: "ReservationPaymentRequestForm",
  components: { ErrorHandler },
  mixins: [form],
  data(){
      return {}
  },
  props: {
      reservation: Object,
      request: Object,
      prefill: Object,
      role: { type: String, default: () => 'create' }
  },
  methods: {

    ...mapActions([
        'query',
        'mutate'
    ]),

    setForm() {
      const request = this.request || this.prefill || {};
      this.form = {
        title: request.title || null,
        description: request.description || null,
        amount: request.amount || null
      }
    },

    resetForm() {
      this.$refs.form.reset();
      this.setForm();
    },

    submission() {
      if(!this.$refs.form.validate()) return Promise.reject(new Error("Fill all necessary fields correctly"));
      this.form.amount = parseFloat(this.form.amount);
      return this.request ? this.updateRequest() : this.createRequest();
    },

    createRequest() {
      return new Promise((resolve, reject) => {
        this.mutate({
          mutation: gql `mutation createReservationPaymentRequest($reservation_id: ID!, $data: ReservationPaymentRequestInput!) {
            createReservationPaymentRequest(reservation_id: $reservation_id, data: $data) {
              ${QLFields}
            }
          }`,
          variables: {
            reservation_id: this.reservation.id,
            data: this.form
          }
        }).then(response => {
          this.resetForm();
          const request = response.data.createReservationPaymentRequest;
          this.$store.commit("SNACKBAR", {
            status: true,
            text: `${request.title} requested`,
            color: "success"
          })
          this.$emit('payment-request-created', request);
          resolve(request)
        }).catch(e => reject(e))
      })
    },

    updateRequest() {
        return new Promise((resolve, reject) => {
          this.mutate({
            mutation: gql `mutation updateReservationPaymentRequest($reservation_id: ID!, $request_id: ID!, $data: ReservationPaymentRequestInput!) {
              updateReservationPaymentRequest(reservation_id: $reservation_id, request_id: $request_id, data: $data) {
                ${QLFields}
              }
            }`,
            variables: {
              request_id: this.request.id,
              reservation_id: this.reservation.id,
              data: this.form
            }
          }).then(response => {
            const request = response.data.updateReservationPaymentRequest;
            this.$store.commit("SNACKBAR", {
              status: true,
              text: `${request.title} updated`,
              color: "success"
            })
            this.$emit('payment-request-updated', request);
            resolve(request)
          })
          .catch(e => reject(e))
        })
      }

  },

  watch: {
    request: {
      immediate: true,
      handler() {
        this.setForm()
      }
    }
  }
}
</script>