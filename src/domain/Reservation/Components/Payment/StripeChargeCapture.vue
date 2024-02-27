<template>
<div>
    <confirmation-dialog ref="confirmation" @confirmed="capture">
        <div class="mt-5">
            <p>Are you sure you want to capture {{ amountCapturing }} from this authorization ?</p>
            <v-alert
            class="mt-4"
            v-if="refund > 0"
            border="left"
            colored-border
            type="warning"
            >
                {{ `${stripe_charge.currency.toUpperCase()} ${(refund/100)}` }} will be voided
            </v-alert>
        </div>
    </confirmation-dialog>

    <v-dialog
        v-if="stripe_charge && !stripe_charge.captured && !stripe_charge.refunded"
        v-model="dialog"
        width="400"
        scrollable
        persistent
        >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
            color="primary"
            dark
            v-bind="attrs"
            v-on="on" text
            :disabled="payment.captured"
            small
            >
              <v-icon class="mr-2">mdi-check</v-icon>
              Capture charge
            </v-btn>
        </template>
        <v-card>
            <v-card-title class="headline">
                <span>Capture authorized charge</span>
            </v-card-title>
            <v-card-text >
                <h4 class="grey--text">Amount Authorized: {{ amountAuthorized }}</h4>
                <v-form ref="form" class="pt-5" @submit.prevent>
                    <v-text-field
                        outlined dense
                        :label="`Amount to capture for ${charge.title}`"
                        :rules="[(value) => value !== '' || 'Enter an amount', (value) => value <= (stripe_charge.amount/100) || `You cannot capture more than ${amountAuthorized}`]"
                        type="number"
                        :prefix="stripe_charge.currency.toUpperCase()"
                        v-model="amount"
                    ></v-text-field>
                </v-form>
                <error-handler :error="error" @retry="capture" />
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red" @click="dialog = false" text>Cancel</v-btn>
                <v-btn @click.prevent="submit" color="primary" :loading="loading" depressed>Capture</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</div>
</template>

<script>
import { mapActions } from 'vuex';
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog';
import CAPTURE_RESERVATION_CHARGE from '../../Mutations/captureReservationCharge';
import CAPTURE_RESERVATION_PAYMENT_INTENT from '../../Mutations/captureReservationPaymentIntent';
import ErrorHandler from "@/components/ErrorHandler.vue";

export default {
    name: "ReservationChargeCapture",
    components: {
      ErrorHandler,
        ConfirmationDialog
    },
    props: {
        property: Object,
        reservation: Object,
        charge:Object,
        payment: Object
    },

    data(){
        return {
            dialog: false,
            loading: false,
            amount: 0,
            stripe_charge: null,
            error: null
        }
    },

    computed: {
        amountAuthorized(){
            if(!this.stripe_charge) return 0;
            return `${this.stripe_charge.currency.toUpperCase()}${(this.stripe_charge.amount/100)}`
        },

        amountCapturing(){
            return `${this.stripe_charge.currency.toUpperCase()}${(this.amount)}`
        },

        refund(){
            if(!this.stripe_charge) return 0;
            return this.stripe_charge.amount - this.amount*100
        }
    },

    methods: {
        ...mapActions([
            'mutate'
        ]),

        submit(){
            if(!this.$refs.form.validate()){
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: "Cannot capture charge",
                    color: "red"
                })
                return;
            }
            this.$refs.confirmation.open();
        },

      capture() {
          if(this.payment.payment_intent) this.capturePaymentIntent()
          else this.captureCharge();
      },

      captureCharge(){
          this.loading = true;
          this.error = null;
          this.mutate({
              mutation: CAPTURE_RESERVATION_CHARGE,
              variables: {
                  property_id: this.property.id,
                  charge_id: this.stripe_charge.id,
                  amount: this.amount*100
              }
          })
          .then(response => {
              const payment = response.data.captureReservationCharge;
              if(payment.captured){
                  this.$store.commit('SNACKBAR', {
                      status: true,
                      text: `Captured ${payment.currency.toUpperCase()}${payment.amount_captured/100} for ${this.charge.title}`,
                      color: "success"
                  })
                  this.stripe_charge = payment;
                  this.$emit('captured', payment)
                  this.dialog = false;
              }else{
                  this.$store.commit('SNACKBAR', {
                      status: true,
                      text: `${this.amountCapturing} not captured yet`,
                      color: "info"
                  })
              }
          })
          .catch(e => {
              this.error = e
          })
          .finally(() => {
              this.loading = false
          })
      },

      capturePaymentIntent() {
        this.loading = true;
        this.error = null;
        this.mutate({
          mutation: CAPTURE_RESERVATION_PAYMENT_INTENT,
          variables: {
            property_id: this.property.id,
            intent_id: this.stripe_charge.payment_intent,
            amount: this.amount*100
          }
        })
        .then(response => {
          const payment = response.data.captureReservationPaymentIntent;
          if(payment.captured){
            this.$store.commit('SNACKBAR', {
              status: true,
              text: `Captured ${payment.currency.toUpperCase()}${payment.amount_captured/100} for ${this.charge.title}`,
              color: "success"
            })
            this.stripe_charge = payment;
            this.$emit('captured', payment)
            this.dialog = false;
          }else{
            this.$store.commit('SNACKBAR', {
              status: true,
              text: `${this.amountCapturing} not captured yet`,
              color: "info"
            })
          }
        })
        .catch(e => {
          this.error = e
        })
        .finally(() => {
          this.loading = false
        })
      }
    },
    watch: {
        payment: {
            immediate: true,
            handler(payment){
                this.stripe_charge = payment;
                this.amount = payment.amount/100;
            }
        }
    }
}
</script>