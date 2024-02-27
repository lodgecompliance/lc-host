<template>
    <v-card flat>
        <v-card-title v-if="header" class="headline">
            <span>Payments</span>
        </v-card-title>
        <v-card-text class="px-1">
            <data-container :loading="loading">
                <template #loading>
                    <v-skeleton-loader
                    v-for="i in 4" :key="i"
                        type="list-item-three-line, divider"
                        ></v-skeleton-loader>
                </template>
                <virtual-scroll
                  v-if="stripePayments.length"
                  :height="500"
                  :item-height="150"
                  :items="stripePayments"
                  >
                    <template #default="{ item: payment, index: i }">
                      <stripe-payment
                          :payment="payment"
                          :credit-card="payment.source"
                          :can-refund="canRefund"
                          :charge="getCharge(payment)"
                          :dialog="selected === i"
                          @dialog-closed="selected = null"
                          three-line >
                        <template #list-action>
                          <v-btn icon @click="selected = i" title="view payment">
                            <v-icon>mdi-eye</v-icon>
                          </v-btn>
                        </template>

                        <template #item-subtitles="{ payment }">
                          <v-list-item-subtitle v-if="!payment.metadata.charge_id">
                            <v-icon color="warning" small>
                              mdi-information
                            </v-icon>
                            <small>This charge was not set for the reservation initially</small>
                          </v-list-item-subtitle>
                          <v-list-item-subtitle v-if="payment.metadata.refundable == 'true'">
                            <v-icon color="warning" small>
                              mdi-information
                            </v-icon>
                            <small>Charge refundable</small>
                          </v-list-item-subtitle>
                        </template>

                        <template v-if="reservation.approved && reservation.active" #dialog-actions>
                          <div class="d-flex">
                            <stripe-refund
                                v-if="canRefund"
                                :property="property"
                                :reservation="reservation"
                                :payment="payment"
                                @refunded="stripePaymentRefunded"
                            />
                            <stripe-capture
                                v-if="canCapture"
                                :property="property"
                                :reservation="reservation"
                                :charge="getCharge(payment) || { title: `Custom charge` }"
                                :payment="payment"
                                @captured="(charge) => updateStripePayment(charge)" />
                          </div>
                        </template>
                      </stripe-payment>
                      <v-divider></v-divider>
                    </template>
                  </virtual-scroll>
                <virtual-scroll
                    v-else-if="paystackChargePayments.length"
                    :height="500"
                    :item-height="150"
                    :items="paystackChargePayments"
                >
                  <template #default="{ item: payment, index: i }">
                    <paystack-payment
                        :payment="payment"
                        three-line >
                      <!--                    <template #list-action>-->
                      <!--                        <v-btn icon @click="selected = i" title="view payment">-->
                      <!--                            <v-icon>mdi-eye</v-icon>-->
                      <!--                        </v-btn>-->
                      <!--                    </template>-->

                      <!-- <template v-if="!payment.metadata.charge_id" #list-action="{ payment }">
                          <v-list-item-action-text>Extra charge</v-list-item-action-text>
                          <v-tooltip bottom>
                              <template v-slot:activator="{ on }">
                                  <v-icon  v-on="on" color="warning">
                                      mdi-information
                                  </v-icon>
                              </template>
                              This charge was not set for the reservation initially
                          </v-tooltip>
                      </template> -->
                    </paystack-payment>
                  </template>
                </virtual-scroll>
                <div v-else class="py-5 grey--text text-center">
                    No payment for the reservation with the card
                </div>
            </data-container>
        </v-card-text>
        <v-card-actions
            v-if="reservation.approved && reservation.active"
        >
          <v-btn
              :loading="refunding"
              v-if="canRefund && outstandingStripeCharges.length && outstandingStripeChargesTotal > 0"
              color="primary" text depressed
              @click="refundOutstandingCharges">
            Refund all outstanding charges - {{ outstandingStripeCharges[0].currency.toUpperCase() }}
            {{ outstandingStripeChargesTotal / 100 }}
          </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import DataContainer from '@/components/DataContainer.vue';
import StripePayment from './StripeChargePayment.vue';
import StripeRefund from './StripeChargeRefund.vue';
import StripeCapture from './StripeChargeCapture.vue';
import PaystackPayment from './PaystackChargePayment.vue';
import REFUND_RESERVATION_CHARGE from '../../Mutations/refundReservationCharge';
import GET_RESERVATION_PAYMENTS from '../../Queries/getReservationPayments';
import {mapActions} from "vuex";
import VirtualScroll from "@/components/VirtualScroll";
import CANCEL_RESERVATION_PAYMENT_INTENT from "@/domain/Reservation/Mutations/cancelReservationPaymentIntent";

export default
{
    name: "ReservationPayments",
    components: {VirtualScroll, DataContainer, StripePayment, PaystackPayment, StripeRefund, StripeCapture },
    data(){
        return {
            dialog: false,
            selectedPaymentDialog: false,
            loading: false,
            selected: null,
            dataPayment: {},
            refunding: false,
        }
    },
    computed: {
        stripePayments() {
            let payments =  (this.dataPayment && this.dataPayment.stripe ? this.dataPayment.stripe : [])
            .filter(payment => payment.status == 'succeeded');
          return payments;
        },
        outstandingStripeCharges() {
          return this.stripePayments.filter(charge => {
            if(!charge.captured && !charge.refunded) return true;
            return !charge.refunded && charge.metadata.refundable == "true";
          })
        },
        outstandingStripeChargesTotal() {
            return this.outstandingStripeCharges.map(charge => charge.net_captured)
                .reduce((a,b) => a+b, 0);
        },

        paystackTransactions() {
            return this.dataPayment && this.dataPayment.paystack ? this.dataPayment.paystack : []
        },

        paystackChargePayments() {
            let payments = [];
            this.paystackTransactions.forEach(transaction => {
                payments = payments.concat(transaction.charges.map(charge => {
                    return {
                        charge, transaction
                    }
                }))
            })
            return payments;
        }
    },
    props: {
        reservation: Object,
        property: Object,
        creditCard: Object,
        payments: Object,
        canRefund: {
            type: Boolean,
            default: () => false
        },
        canCapture: {
          type: Boolean,
          default: () => false
        },
        header: {
          type: Boolean,
          default: () => true
        },
        allPayments: {
          type: Boolean,
          default: () => false
        },
        userId: String,
    },

    methods: {
        ...mapActions([
            'mutate'
        ]),
        getPayments(){
            this.loading = true;
            this.$store.dispatch('query', {
                query: GET_RESERVATION_PAYMENTS,
                variables: {
                    id: this.reservation.id,
                    user_id: this.userId,
                    all_payments: this.allPayments
                }
            })
            .then(response => {
                this.dataPayment = response.data.getReservationPayments;
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    message: `Could not get payments.`,
                    retry: () => this.getPayments(),
                    exception: e
                });
            })
            .finally(() => {
                this.loading = false;
            })
        },
        getCharge(payment) {
            return [
                {
                    id: this.reservation.id,
                    currency: this.reservation.currency,
                    amount: this.reservation.balance,
                    description: "Reservation balance",
                    type: 'instant',
                    optional: false,
                    enable: true,
                    unit: 'Stay',
                    title: "Reservation Balance"
                }
            ].concat(this.reservation.charges).find(charge => charge.id === payment.metadata.charge_id)
        },
        stripePaymentRefunded(refund){
            this.dataPayment.stripe = this.dataPayment.stripe.map(payment => {
                if(payment.id === refund.charge.id) return refund.charge
                return payment;
            })
        },
        updateStripePayment(updatedPayment) {
          this.dataPayment.stripe = this.dataPayment.stripe.map(payment => {
            if(payment.id === updatedPayment.id) return Object.assign(payment, updatedPayment)
            return payment;
          })
        },
        refundOutstandingCharges() {
          this.refunding = true;
          Promise.all(this.outstandingStripeCharges.map(charge => {
            return !charge.captured && charge.payment_intent
                ? this.mutate({
                  mutation: CANCEL_RESERVATION_PAYMENT_INTENT,
                  variables: {
                    property_id: this.property.id,
                    intent_id: charge.payment_intent,
                  }
                })
                : this.mutate({
                  mutation: REFUND_RESERVATION_CHARGE,
                  variables: {
                    property_id: this.property.id,
                    charge_id: charge.id,
                    amount: charge.net_captured,
                  }
              })
          })).then(refunds => {
            refunds.map(refund => {
              if(refund.data.refundReservationCharge) {
                return this.stripePaymentRefunded(refund.data.refundReservationCharge)
              }
              if(refund.data.cancelReservationPaymentIntent) {
                return this.stripePaymentRefunded({ charge: refund.data.cancelReservationPaymentIntent })
              }
            })
            this.$emit("charges-refunded");
          })
          .finally(() => {
            this.refunding = false;
          })
        }
    },

    watch: {
        payments: {
            immediate: true,
            handler(payments) {
              if(!payments) this.getPayments();
              else this.dataPayment = payments
            }
        }
    }
}
</script>