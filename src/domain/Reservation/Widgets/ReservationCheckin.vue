<template>
    <section>

      <section class="my-2">
        <h4 class="grey--text">Reservation Details</h4>
        <reservation-details :reservation="reservation" />
      </section>

      <section class="my-2" >
        <h4>Agreements</h4>
        <template v-if="agreements && agreements.length">
          <v-list>
            <v-list-item v-for="(agreement, i) in agreements" :key="i">
              <v-list-item-icon>
                <v-icon>mdi-handshake</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  {{ agreement.agreement }}
                </v-list-item-title>
                <div  v-if="agreement.text">{{ agreement.text }}</div>
                <div  v-if="agreement.link && agreement.link !== ''">
                  <a :href="agreement.link" target="_blank">{{agreement.link}}</a>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </template>
        <template v-else>
          <p class="grey--text py-3">No agreement</p>
        </template>
      </section>

      <section class="my-2">

        <h4>Questions</h4>
        <v-list v-if="questions && questions.length">
          <v-list-item v-for="(question, q) in questions" :key="q">
            <v-list-item-icon>
              <v-icon>mdi-account-question</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ question.question }}
              </v-list-item-title>
              <v-list-item-subtitle v-if="question.response">
                Ans: {{ question.response.option  }}
                <span class="ml-3" v-if="question.response.agreement">
                                        <v-icon>mdi-attachment</v-icon> <strong>{{ question.response.agreement.agreement }}</strong>
                                        <a class="ml-2" v-if="question.response.agreement.link" :href="question.response.agreement.link" target="_blank">Read agreement</a>
                                    </span>
              </v-list-item-subtitle>
              <v-list-item-subtitle v-else>
                No response
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <div v-else class="my-5 grey--text text-center">
          No question responded to for this reservation
        </div>
      </section>

      <section v-if="reservation.require_credit_card" class="my-2">
        <h4>Credit card</h4>
        <div v-if="!credit_card" class="text-center">No credit card</div>
        <template v-if="credit_card && credit_card.stripe">
          <stripe-credit-card
              v-if="credit_card.stripe.card"
              outlined
              :card="credit_card.stripe.card" class="my-1" />
          <stripe-payment-method
              v-else-if="credit_card.stripe.payment_method"
              outlined
              :method="credit_card.stripe.payment_method" class="my-1" />
        </template>
        <paystack-credit-card
            v-if="credit_card && credit_card.paystack"
            outlined
            :card="credit_card.paystack" class="my-1"
        />
      </section>

      <section class="my-2">
        <h4>Payments</h4>
        <reservation-payments
            outlined
            :property="property"
            :reservation="reservation"
            :user-id="user.id"
            :can-refund="hasPermissionToManageCharge"
            :can-capture="hasPermissionToManageCharge"
        />
      </section>

      <section v-if="reservation.require_id_verification" class="my-2">
        <h4>ID Verification</h4>
        <user-identity-verification
            :user-id="user.id"
            flat
        />
      </section>
      <section class="my-2">
        <h4>Signature</h4>
        <signature-pad
            :signature="signature"
            :editable="false"
            :activate="true"
        />
      </section>
    </section>
</template>

<script>
    import ReservationDetails from '../Components/ReservationDetails.vue';
    import StripeCreditCard from '../../../components/Utilities/StripeCreditCard.vue';
    import StripePaymentMethod from '../../../components/Utilities/StripePaymentMethod.vue';
    import UserIdentityVerification from '../../User/Components/IdentityVerification.vue';
    import SignaturePad from '../../../components/Utilities/SignaturePad.vue';
    import PaystackCreditCard from '../../../components/Utilities/PaystackCreditCard.vue';
    import ReservationPayments from "@/domain/Reservation/Components/Payment/ReservationPayments.vue";
    import reservationMixin from "@/domain/Reservation/Mixins/reservation";
    export default {
      name: "ReservationCheckin",
      mixins: [reservationMixin],
      components: {
          ReservationPayments,
          ReservationDetails,
          StripeCreditCard, UserIdentityVerification,
          SignaturePad, PaystackCreditCard, StripePaymentMethod,
        },
        props: {
            reservation: Object,
            checkin: Object,
            user: Object
        },
        computed: {

            agreements(){
                return this.checkin?.agreements || []
            },

            questions(){
                return this.checkin?.questions || []
            },

            charges(){
                return this.reservation?.charges || []
            },

            credit_card() {
                return this.checkin?.credit_card
            },

            verification(){
                return this.checkin?.verification
            },

            guests(){
                return this.checkin?.guests || []
            },

            signature(){
              return this.checkin?.signature
            },
        },
    }
</script>