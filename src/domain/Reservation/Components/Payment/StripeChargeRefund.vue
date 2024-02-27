<template>
<div>
    <confirmation-dialog ref="confirmation" @confirmed="refund">
        <div class="mt-5">
            <p>Are you sure you want to refund {{ amountRefunding }} ?</p>
        </div>
    </confirmation-dialog>

    <v-dialog
        v-if="stripe_charge && !stripe_charge.refunded"
        v-model="dialog"
        width="400"
        scrollable
        persistent
        >
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator">
                 <v-btn
                    color="primary"
                    dark text
                    v-bind="attrs"
                    v-on="on"
                    :disabled="stripe_charge.net_captured <= 0"
                    small
                    >
                    <v-icon class="mr-2">mdi-credit-card-refund</v-icon>
                   {{ stripe_charge.captured ? 'Refund' : 'Cancel Authorization' }}
            </v-btn>
            </slot>
           
        </template>
        <v-card>
            <v-card-title class="headline">
                <span>Refund charge</span>
            </v-card-title>
            <v-card-text >
              <div class="d-flex justify-space-between">
                <h4 class="primary--text">Authorized: {{ stripe_charge.amount | money_value(stripe_charge.currency) }}</h4>
                <h4 class="primary--text">Net Captured: {{ (stripe_charge.captured ? stripe_charge.net_captured : stripe_charge.amount_captured) | money_value(stripe_charge.currency)  }}</h4>
              </div>
                <v-form ref="form" class="pt-5" @submit.prevent>
                    <v-text-field
                        v-if="stripe_charge.captured"
                        outlined dense
                        :label="`Amount to refund${this.charge ? ` for ${this.charge.title}`: ''}`"
                        :rules="[(value) => value !== '' || 'Enter an amount', (value) => value <= (stripe_charge.net_captured/100) || `You cannot refund more than ${amountCharged}`]"
                        type="number"
                        :prefix="stripe_charge.currency.toUpperCase()"
                        v-model="form.amount"
                    ></v-text-field>

                    <v-select
                    :items="reasons"
                    item-text="title"
                    item-value="value"
                    label="Reason"
                    v-model="form.reason"
                    outlined dense
                    clearable
                    ></v-select>

                    <v-textarea
                        label="Guest note"
                        no-resize
                        clearable
                        v-model="form.customer_note"
                        counter="60"
                        outlined dense
                        height="100"
                        :rules="[(value) => (!value || value.length <= 60) || 'Not more than 60 characters allowed' ]"
                        ></v-textarea>

                </v-form>
                <error-handler :error="error" @retry="refund" />
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red" @click="dialog = false" text>Cancel</v-btn>
                <v-btn @click.prevent="submit" color="primary" :loading="loading" depressed>Refund</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</div>
</template>

<script>
import { mapActions } from 'vuex';
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog';
import REFUND_RESERVATION_CHARGE from '../../Mutations/refundReservationCharge';
import CANCEL_RESERVATION_PAYMENT_INTENT from '../../Mutations/cancelReservationPaymentIntent';
import ErrorHandler from "@/components/ErrorHandler.vue";

export default {
    name: "ReservationChargeRefund",
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
            form: {
                amount: 0,
                reason: null,
                customer_note: null
            },
            reasons: [
                {
                    title: 'Duplicate transaction',
                    value: 'duplicate'
                },
                {
                    title: 'Fraudulent transaction',
                    value: 'fraudulent'
                },
                {
                    title: 'Requested by guest',
                    value: 'requested_by_customer'
                },

            ],
            stripe_charge: null,
            error: null,
        }
    },

    computed: {

        amountCharged(){
            return `${this.stripe_charge.currency.toUpperCase()}${(this.stripe_charge.net_captured/100)}`
        },

        amountRefunding(){
            return `${this.stripe_charge.currency.toUpperCase()}${(this.form.amount)}`
        },

    },

    methods: {
        ...mapActions([
            'mutate'
        ]),

        submit(){
            if(!this.$refs.form.validate()){
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: "Cannot refund charge",
                    color: "red"
                })
                return;
            }
            this.$refs.confirmation.open();
        },

        refund(){
          if(this.payment.captured) this.refundCharge()
          else if(this.payment.payment_intent) this.cancelPaymentIntent();
        },

        refundCharge(){
          this.loading = true;
          this.error = null;
          this.mutate({
            mutation: REFUND_RESERVATION_CHARGE,
            variables: {
              property_id: this.property.id,
              charge_id: this.stripe_charge.id,
              amount: this.form.amount*100,
              reason: this.form.reason,
              customer_note: this.form.customer_note
            }
          })
          .then(response => {
            const refund = response.data.refundReservationCharge;
            if(refund){
              this.$store.commit('SNACKBAR', {
                status: true,
                text: `${refund.currency.toUpperCase()}${refund.amount/100}${this.charge ? ` for ${this.charge.title}`: ''} refunded`,
                color: "success"
              })
              this.stripe_charge = refund.charge;
              this.$emit('refunded', refund)
              this.dialog = false;
            }else throw new Error("Refund Failed")
          })
          .catch(e => {
            this.error = e
          })
          .finally(() => {
            this.loading = false
          })
      },

        cancelPaymentIntent(){
          this.loading = true;
          this.error = null;
          this.mutate({
            mutation: CANCEL_RESERVATION_PAYMENT_INTENT,
            variables: {
              property_id: this.property.id,
              intent_id: this.stripe_charge.payment_intent,
              reason: this.form.reason,
            }
          })
          .then(response => {
            const charge = response.data.cancelReservationPaymentIntent;
            if(charge){
              this.$store.commit('SNACKBAR', {
                status: true,
                text: "Authorization cancelled",
                color: "success"
              })
              this.stripe_charge = charge;
              this.$emit('refunded', { charge })
              this.dialog = false;
            } else  throw new Error(`Authorization failed to cancel.`)
          })
          .catch(e => {
            this.error = e;
          })
          .finally(() => {
            this.loading = false
          })
      },

        setForm() {
          this.form = {
            amount: this.payment.captured ? (this.payment.net_captured/100) : this.payment.amount/100,
            reason: null,
            customer_note: null
          }
      }
    },
    watch: {
        payment: {
            immediate: true,
            handler(payment){
                this.stripe_charge = payment;
                this.setForm();
            }
        },
        dialog: {
            handler() {
              this.setForm()
            }
        }
    }
}
</script>