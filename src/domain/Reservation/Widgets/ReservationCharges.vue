<template>
    <data-container :loading="loading" :error="error" @retry="getReservationPayments">
        <template v-slot:loading>
            <div  v-for="i in 4" :key="i">
                <v-skeleton-loader
                    type="heading"
                    class="my-2"
                ></v-skeleton-loader>
                <v-skeleton-loader
                    type="card, button"
                    height="60"
                    class="my-2"
                ></v-skeleton-loader>
                <v-divider></v-divider>
            </div>
        </template>
        <v-form ref="chargePaymentForm" v-if="charges && charges.length">

            <div v-for="charge in allCharges" :key="charge.id" >
                <reservation-charge
                class="my-1"
                :charge="charge"
                :payment="chargePayment(charge)"
                :reservation="reservation"
                :guests="guests"
                :property="property"
                :credit-card="creditCard"
                :listItem="{class: 'px-0'}"
                :capture-pre-authorize="capturePreAuthorize"
                >
                    <template v-slot:options="props">
                        <slot name="options" v-bind="{ ...props, updateStripePayment }" />
                    </template>
                    <template v-slot:default="props">
                      <slot v-bind="props" />
                    </template>
                </reservation-charge>
            </div>
        </v-form>
        <div v-else class="text-center grey--text py-5">
            No charge for the reservation
        </div>
    </data-container>
</template>

<script>
import DataContainer from '../../../components/DataContainer.vue';
import ReservationCharge from '../Components/ReservationCharge.vue';
import GET_RESERVATION_PAYMENTS from '../Queries/getReservationPayments';
import CheckinPayment from '../Helpers/checkin';

export default {
    name: "ReservationCharges",
    components:{
      DataContainer,
      ReservationCharge,
    },
    data(){
        return {
            loading: false,
            charges: [],
            selectedCharges: [],
            totalInstantCharges: 0,
            totalPreauthorizedCharges: 0,
            creditCard: {
                paystack: null,
                stripe: null,
            },
            payments: {
                stripe: [],
                paystack: []
            },
        }
    },

    computed: {
        allCharges() {
            return this.charges.concat(this.attachments)
        },
        currency() {
            return this.reservation.currency ? this.reservation.currency : this.property.currency;
        },
        stripePayments() {
            return this.payments && this.payments.stripe ? this.payments.stripe : [];
        },

        paystackTransactions() {
            return this.payments && this.payments.paystack ? this.payments.paystack : [];
        },

        checkinPayment() {
            return new CheckinPayment( { payments: this.payments } );
        },

    },

    props: {
        reservation: Object,
        property: Object,
        attachments: {
            default: () => []
        },
        _payments: {
            type: Object,
            default: () => {
                return {
                    paystack: [],
                    stripe: []
                }
            }
        },
        fetchPayments: {
            type: Boolean,
            default: () => false
        },
        capturePreAuthorize: Boolean,
        submittedCreditCard: Object,
    },
    
    methods: {


        getCharges(){
            this.charges = [];
            if(this.reservation.balance && this.reservation.currency){
                this.charges.push({
                    id: this.reservation.id,
                    currency: this.reservation.currency,
                    amount: this.reservation.balance,
                    description: "Reservation balance",
                    type: 'instant',
                    optional: false,
                    enable: true,
                    unit: 'Stay',
                    title: "Reservation Balance"
                });
            }
            this.charges = this.charges.concat(this.reservation.charges);
            this.getPaidCharges();
        },

        getReservationPayments() {
            // Get payments for the reservation
            this.loading = true;
            this.error = null;
            this.$store.dispatch('query', {
                query: GET_RESERVATION_PAYMENTS,
                variables: {
                    id: this.reservation.id
                }
            })
            .then(response => {
                if(response.data.getReservationPayments) {
                    this.payments = response.data.getReservationPayments;
                    this.getPaidCharges();
                }
            })
            .catch(e => this.error = e)
            .finally(() => this.loading = false )
        },

        getPaidCharges(){
            const paidCharges = this.allCharges.map(charge => {
                return {
                    ...charge,
                    payment: this.checkinPayment.chargePayment(charge)
                }
            });
            this.$emit('charges-payment', paidCharges);
        },

        chargePayment(charge) {
            return this.checkinPayment.chargePayment(charge)
        },


      updateStripePayment(updatedPayment) {
        this.payments.stripe = this.payments.stripe.map(payment => {
          if(payment.id === updatedPayment.id) {
            Object.assign(payment, updatedPayment);
          }
          return payment;
        })
      },

    },

    mounted() {
        if(this.fetchPayments) this.getReservationPayments();
        if(this.submittedCreditCard) this.creditCard = this.submittedCreditCard;
    },

    watch: {
        reservation: {
            immediate: true,
            handler(){
                this.getCharges()
            }
        },

        refresh: {
            handler(refresh){
                if(refresh) this.getCharges()
            }
        },

        paystackTransactions: {
            immediate: true,
            handler(transactions) {
                if(transactions) this.$emit('paystack-transactions', transactions)
            }
        },

        attachments: {
            immediate: true,
            handler() {
                this.getPaidCharges();
            }
        },

        _payments: {
            immediate: true,
            handler(payments) {
                this.payments = payments
            }
        },

    }
}
</script>