<template>
    <div>
        <confirmation-dialog ref="confirmation" @confirmed="charge">
            <div class="mt-5">
                <h4>Are you sure you want to charge the guest's card {{ form.currency }}{{ form.amount }} ?</h4>
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
                text dark
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
                    <credit-card :card="creditCard" class="my-2"/>
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
                    </v-form>
                    <v-alert v-else colored-border border="left" type="warning">
                        Reservation checkin not approved yet, can not charge guest card.
                    </v-alert>
                    <v-alert v-if="charging" 
                    border="left"
                    colored-border
                    type="info"
                    class="my-2"
                    >
                        Charging card...
                    </v-alert>
                    <v-alert v-if="verifying" 
                    border="left"
                    colored-border
                    type="info"
                    class="my-2"
                    >
                        Verifying transaction..
                    </v-alert>
                    <v-alert v-if="error" 
                    border="left"
                    colored-border
                    type="error"
                    class="my-2"
                    >
                        {{ error }}
                    </v-alert>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red" @click="dialog = false" text>Cancel</v-btn>
                    <v-btn v-if="reservation.approved_at" @click.prevent="submit" color="primary" :loading="charging || verifying">Charge</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import gql from 'graphql-tag';
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog';
import CreditCard from '@/components/Utilities/PaystackCreditCard';

export default {
    name: "ReservationExtraCharge",
    components: {
        ConfirmationDialog,
        CreditCard,
    },
    props: {
        reservation: Object,
        creditCard: Object,
        user: Object,
        property: Object
    },

    data(){
        return {
            dialog: false,
            charging: false,
            verifying: false,
            form: {
                currency: this.reservation.currency,
                amount: null,
                description: null
            },
            error: null,
        }
    },

    computed: {
        creditCardAvailable(){
            return this.creditCard ? true : false
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

        charge() {
            this.error= null;
            this.charging = true;

            const variables = {
                property_id: this.property.id,
                reservation_id: this.reservation.id,
                authorization_code: this.creditCard.authorization_code,
                charge: {
                    property_id: this.property.id,
                    amount: this.form.amount * 100,
                    currency: this.form.currency,
                    description: this.form.description,
                    receipt_email: this.user.email,
                    capture: true,
                    metadata: {
                        user_id: this.user.id,
                        property_id: this.property.id,
                        reservation_id: this.reservation.id,
                    }
                }
            }

            this.$store.dispatch('mutate', {
                mutation: gql `
                    mutation chargeReservationPaystackAuthorization($property_id: ID!, $reservation_id: ID!, $authorization_code: ID!,  $charge: ReservationPaystackPaymentChargeInput!) {
                        chargeReservationPaystackAuthorization(property_id: $property_id, reservation_id: $reservation_id, authorization_code: $authorization_code, charge: $charge) {
                            status
                            message 
                            data {
                                reference
                            }
                        }
                    }
                `,
                variables
            })
            .then(response => {
                const charge = response.data.chargeReservationPaystackAuthorization;
                if(charge && charge.status) {
                    const reference = charge.data.reference
                    this.charging = false;
                    this.verifying = true;
                    return this.$store.dispatch('mutate', {
                        mutation: gql ` 
                            mutation  verifyReservationPaystackTransaction($property_id: ID!, $reservation_id: ID!, $reference: ID!) {
                                verifyReservationPaystackTransaction(property_id: $property_id, reservation_id: $reservation_id, reference: $reference) {
                                    status
                                    message
                                    data {
                                        amount
                                        currency
                                        transaction_date
                                        status
                                        reference
                                        domain
                                        amount
                                        currency
                                        reference
                                        status
                                        metadata {
                                            user_id
                                            property_id
                                        }
                                        charges {
                                            property_id
                                            amount
                                            currency
                                            description
                                            receipt_email
                                            capture
                                            metadata {
                                                user_id
                                                reservation_id
                                                charge_id
                                                property_id
                                                base_multiplier {
                                                    unit
                                                    quantity
                                                }
                                                custom_multipliers {
                                                    unit
                                                    quantity
                                                }
                                            }
                                        }
                                        authorization {
                                            card_type
                                            last4
                                            exp_month
                                            exp_year
                                            reusable
                                            bank
                                        }
                                    }
                                }
                            }
                        `,
                        variables: {
                            reference,
                            property_id: this.property.id,
                            reservation_id: this.reservation.id,
                        }
                    })
                }
                else {
                    this.error = `Charge was not successfull. ${charge ? charge.message : ''}`;
                    return Promise.resolve(null);
                }
            })
            .then(response => {
                const transaction = response.data.verifyReservationPaystackTransaction;
                if(transaction && transaction.status) {
                    this.$emit('transaction', transaction.data);
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        color: 'success',
                        text: `${transaction.data.currency.toUpperCase()}${transaction.data.amount/100} charged on card`
                    })
                    this.$refs.form.reset();
                    this.$emit('tranasction', transaction.data)
                    this.dialog = false;
                }
                
            })
            .catch(e => {
                this.error = `charge could not be completed ${e.message}`;
            })
            .finally(() => {
                this.charging = false;
                this.verifying = false;
            })
        },
    }
}
</script>