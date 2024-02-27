<template>
    <div>
        <confirmation-dialog ref="confirmation" @confirmed="charge">
            <div class="mt-5 text-center">
              <p v-if="form.capture">Are you sure you want to charge the guest's card {{ form.currency }}{{ form.amount }} ?</p>
              <p v-else>Are you sure you want to authorize {{ form.currency }}{{ form.amount }} on the guest's card?</p>
            </div>
        </confirmation-dialog>

        <v-dialog
            v-model="dialog"
            width="400"
            scrollable
            persistent
            >
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                color="primary"
                text
                v-bind="attrs"
                v-on="on"
                :disabled="!creditCardAvailable"
                >
                <slot>Charge Card</slot>
                </v-btn>
            </template>
            <v-card>
                <v-card-title class="headline">
                    <span>Charge Card</span>
                </v-card-title>
                <v-card-text >
                    <stripe-credit-card :card="card" class="my-2"/>
                    <v-form v-if="reservation.approved_at" ref="form" class="pt-5" @submit.prevent>
                        <v-text-field
                            outlined dense
                            :label="`Amount to charge`"
                            :rules="[(value) => (value !== '' && value > 0) || 'Enter a valid amount']"
                            type="number"
                            :prefix="form.currency"
                            v-model="form.amount"
                        >
                        </v-text-field>

                        <v-textarea
                        label="What charge is for"
                        no-resize
                        clearable
                        v-model="form.description"
                        counter="60"
                        outlined dense
                        height="100"
                        :rules="[(value) => (value != null && value != '') || 'Give reason for the charge', (value) => (!value || value.length <= 60) || 'Not more than 60 characters allowed' ]"
                        ></v-textarea>
                      <div class="d-flex justify-end">
                        <v-switch
                            v-model="form.capture"
                            inset dense
                            label="Charge instantly"
                            class="mt-n2"
                        />
                      </div>
                      <error-handler :error="error" @retry="charge">
                        <template #actions>
                          <v-dialog
                              v-model="paymentRequestDialog"
                              width="350"
                              scrollable
                              persistent
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                  color="primary"
                                  text
                                  v-bind="attrs"
                                  v-on="on"
                              >
                                Request Payment
                              </v-btn>
                            </template>
                            <reservation-payment-request-form
                                :reservation="reservation"
                                :prefill="form"
                                @cancel="paymentRequestDialog = false"
                                @payment-request-created="paymentRequestCreated"
                            />
                          </v-dialog>
                        </template>
                      </error-handler>
                    </v-form>
                    <v-alert v-else colored-border border="left" type="warning">
                      Reservation checkin not approved yet, can not charge guest card.
                    </v-alert>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red" @click="dialog = false" text>Cancel</v-btn>
                    <v-btn v-if="reservation.approved_at" @click.prevent="submit" color="primary" :loading="loading" depressed>
                      {{ form.capture ? 'Charge' : 'Authorize' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog';
import StripeCreditCard from '@/components/Utilities/StripeCreditCard';
import CREATE_RESERVATION_CHARGE from '../../Mutations/createReservationCharge';
import GET_RESERVATION_PAYMENT_INTENT from '../../Queries/getReservationPaymentFromIntent';
import CREATE_RESERVATION_PAYMENT_INTENT from '../../Mutations/createReservationPaymentIntent';
import ErrorHandler from "@/components/ErrorHandler.vue";
import gql from "graphql-tag";
import ReservationPaymentRequestForm from "@/domain/Reservation/Components/ReservationPaymentRequestForm.vue";

export default {
    name: "ReservationExtraCharge",
    components: {
      ReservationPaymentRequestForm,
      ErrorHandler,
        ConfirmationDialog,
        StripeCreditCard,
    },
    props: {
        reservation: Object,
        source: Object,
        user: Object,
        property: Object
    },

    data(){
        return {
            dialog: false,
            loading: false,
            form: {
                currency: this.reservation.currency,
                amount: null,
                description: null,
                capture: true,
            },
            error: null,
            paymentRequestDialog: false,
            intent: null,
        }
    },

    computed: {
        creditCard() {
          return this.source.card;
        },
        paymentMethod() {
          return this.source.payment_method;
        },
        card() {
          return this.creditCard || this.paymentMethod?.card
        },
        creditCardAvailable(){
            return !!this.card
        }
    },

    methods: {
      submit(){

          if(!this.$refs.form.validate()){
              this.$store.commit('SNACKBAR', {
                  status: true,
                  text: "Can not perform charge",
                  color: "error"
              })
              return;
          }
          this.$refs.confirmation.open();
      },

      charge(){
          if(!this.creditCardAvailable) {
              this.$store.commit('SNACKBAR', {
                  status: true,
                  color: 'error',
                  text: `No credit card to charge`,
              })
              return;
          }
          this.loading = true;
          this.error = null;
          if(this.creditCard) {
            this.createCharge().then(charge => {
              this.$store.commit('SNACKBAR', {
                status: true,
                color: 'success',
                text: `${charge.currency.toUpperCase()}${charge.amount/100} charged on card`
              })
              this.resetForm();
              this.$emit('charged', charge)
              this.dialog = false;
            })
            .catch(e => { this.error = e; })
            .finally(() => {
              this.loading = false;
            })
          } else if(this.paymentMethod) {
            this.createPaymentIntent()
            .then(intent => {
              this.intent = intent;
              if(['requires_capture', 'succeeded'].includes(intent.status)) return this.getPaymentFromIntent(intent);
              else if(intent.status === 'requires_action') {
                throw new Error("The card requires further action to complete a transaction, you can request the payment from guest instead.")
              }
              else throw new Error("Failed to charge card with status "+intent.status)
            })
            .then(charge => {
              this.$store.commit('SNACKBAR', {
                status: true,
                color: 'success',
                text: `${charge.currency.toUpperCase()}${charge.amount/100} ${charge.captured ? 'charged' : 'authorized'} on card`
              })
              this.resetForm();
              this.$emit('charged', charge)
              this.dialog = false;
            })
            .catch(e => { this.error = e; })
            .finally(() => {
              this.loading = false;
            })
          }
      },

      createCharge() {
          return new Promise((resolve, reject) => {
            const variables = {
              property_id: this.property.id,
              amount: this.form.amount * 100,
              currency: this.form.currency,
              source: this.creditCard.id,
              customer: this.source.customer,
              description: this.form.description,
              capture: this.form.capture,
              metadata: {
                user_id: this.user.id,
                property_id: this.property.id,
                reservation_id: this.reservation.id,
              }
            }
            if(this.user.email){
              variables.receipt_email = this.user.email
            }
            this.$store.dispatch('mutate', {
              mutation: CREATE_RESERVATION_CHARGE,
              variables
            })
            .then(response => {
              const charge = response.data.createReservationCharge
              resolve(charge)
            })
            .catch(e => reject(e))
          })
      },

      createPaymentIntent() {
        return new Promise((resolve, reject) => {
          const variables = {
            property_id: this.property.id,
            amount: this.form.amount * 100,
            currency: this.form.currency,
            source: this.paymentMethod.id,
            customer: this.source.customer,
            description: this.form.description,
            capture: this.form.capture,
            metadata: {
              user_id: this.user.id,
              property_id: this.property.id,
              reservation_id: this.reservation.id,
            }
          }
          if(this.user.email){
            variables.receipt_email = this.user.email
          }
          this.$store.dispatch('mutate', {
            mutation: CREATE_RESERVATION_PAYMENT_INTENT,
            variables
          })
          .then(response => {
            const intent = response.data.createReservationPaymentIntent
            resolve(intent);
          })
          .catch(e => reject(e))
        })
      },

      getPaymentFromIntent(intent) {
        return new Promise((resolve, reject) => {
          return this.$store.dispatch('query', {
            query: GET_RESERVATION_PAYMENT_INTENT,
            variables: {
              intent_id: intent.id,
              property_id: this.property.id,
            }
          }).then(response => {
            const charge = response.data.getReservationPaymentFromIntent
            resolve(charge)
          }).catch(e => reject(e));
        })
      },

      resetForm() {
        this.error = null;
        this.$refs.form.reset();
        this.form.currency = this.reservation.currency;
        this.form.capture = true;
      },

      paymentRequestCreated() {
        this.resetForm();
        this.paymentRequestDialog = false;
        this.dialog = false;
      }
    }
}
</script>