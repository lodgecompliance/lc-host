<template>
  <section>
    <div class="d-flex align-center my-3">
      <h3 class="">Checkin Information</h3>
      <v-spacer></v-spacer>
      <v-btn
          v-if="checkin && $refs.contract"
          color="primary"
          class="mx-2"
          small outlined
          @click="$refs.contract.open()">Checkin Contract</v-btn>
    </div>

    <data-container :loading="loading" :error="error">
        <template v-if="checkin">
            <confirmation-dialog ref="approvalConfirmation" @confirmed="approveCheckin">
                <div class="mt-5">
                    <p>Are you sure you want to approve the checkin?</p>
                </div>
            </confirmation-dialog>

            <confirmation-dialog ref="checkoutConfirmation" @confirmed="checkoutReservation">
              <div class="mt-5">
                <p>Are you sure you want to checkout the reservation?</p>
              </div>
            </confirmation-dialog>

            <reservation-checkin-contract
                ref="contract"
                :checkin="checkin"
                :property="property"
                :reservation="reservation"
                :pdfable="true"
            />

          <v-expansion-panels focusable flat v-model="panel">
            <v-expansion-panel  v-if="reservation.guests.length">
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Guests</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-3">
                <v-subheader>Primary Guest</v-subheader>
                <v-card outlined>
                  <v-card-text>
                    <v-list v-if="user">
                      <v-list-item >
                        <v-list-item-content class="py-0">
                          <small class="grey--text mb-1">Booking Name</small>
                          <p>{{ reservation.name }}</p>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content class="py-0">
                          <small class="grey--text mb-1">Account Name</small>
                          <p>{{ [ user.first_name, user.last_name ].join(' ') }}</p>
                          <user-identity-verification :user-id="user.id" />
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <v-alert v-else
                             border="left"
                             colored-border
                             type="error"
                             class="mt-5">
                      User not found
                    </v-alert>
                    <v-alert v-if="!reservation.guests.find(g => g.user_id === reservation.user_id)"
                             border="left"
                             colored-border
                             type="error"
                             class="mt-5">
                      {{ reservation.name }} is not expected to stay in the property
                    </v-alert>
                  </v-card-text>
                </v-card>
                <template v-if="reservation.guests.length">
                  <v-subheader>Other Staying Guests</v-subheader>
                  <reservation-guests
                      :reservation="reservation"
                      @guests="guests => reservation.guests = guests"
                  />
                </template>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Credit card</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-3">
                <template v-if="checkin.checkin.credit_card">

                  <template v-if="creditCard.stripe" >
                    <stripe-credit-card v-if="creditCard.stripe.card"
                                        :card="creditCard.stripe.card">
                      <template v-if="reservation.approved && reservation.active && hasPermissionToManageCharge" #actions="{ card }">
                        <stripe-extra-charge
                            :reservation="reservation"
                            :user="user"
                            :property="property"
                            :source="creditCard.stripe"
                            @charged="(payment) => checkin.payments && checkin.payments.stripe ? checkin.payments.stripe.push(payment) : null"
                        />
                      </template>
                    </stripe-credit-card>

                    <stripe-payment-method
                        v-if="creditCard.stripe.payment_method"
                        :method="creditCard.stripe.payment_method">
                      <template v-if="reservation.approved && reservation.active && hasPermissionToManageCharge" #actions="{ method }">
                        <stripe-extra-charge
                            :reservation="reservation"
                            :user="user"
                            :property="property"
                            :source="creditCard.stripe"
                            @charged="(payment) => checkin.payments && checkin.payments.stripe ? checkin.payments.stripe.push(payment) : null"
                        />
                      </template>
                    </stripe-payment-method>
                  </template>

                  <paystack-credit-card v-if="creditCard.paystack"
                                        :card="creditCard.paystack"
                  >
                    <template v-if="reservation.approved && reservation.active && hasPermissionToManageCharge" #actions="{ card }">
                      <paystack-extra-charge
                          :reservation="reservation"
                          :credit-card="card"
                          :user="user"
                          :property="property"
                          @transaction="() => $refs.payments.getPayments()"
                      />
                    </template>
                  </paystack-credit-card>
                  <reservation-payments
                      class="mt-3"
                      outlined
                      :property="property"
                      :reservation="reservation"
                      :payments="checkin.payments"
                      :can-refund="hasPermissionToManageCharge"
                      :can-capture="hasPermissionToManageCharge"
                      ref="payments"
                  />
                </template>
                <template v-else>
                  <p class="text-center grey--text py-5">No credit card</p>
                </template>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Charges</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-3">
                <reservation-charges
                    :reservation="reservation"
                    :property="property"
                    :_payments="checkin.payments"
                    :refresh="refreshCharges">
                  <template v-if="reservation.approved && reservation.active && hasPermissionToManageCharge" v-slot:options="props" >
                    <stripe-charge-refund
                        :property="property"
                        :reservation="reservation"
                        v-bind="props"
                        @refunded="(refund) => props.updateStripePayment(refund.charge)" />
                    <stripe-charge-capture
                        :property="property"
                        :reservation="reservation"
                        v-bind="props"
                        @captured="(charge) => props.updateStripePayment(charge)" />
                  </template>
                </reservation-charges>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Questions</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content v-if="checkin" class="pt-3">
                <v-list v-if="questions.length" dense>
                  <v-list-item v-for="(question, q) in questions" :key="q">
                    <v-list-item-icon>
                      <v-icon>mdi-account-question</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ question.question }}
                      </v-list-item-title>
                      <template v-if="question.response">
                        <v-list-item-subtitle>
                          Ans: {{ question.response.option  }}
                          <span class="ml-3" v-if="question.response.agreement">
                              <v-icon>mdi-attachment</v-icon> <strong>{{ question.response.agreement.agreement }}</strong>
                              <a class="ml-2" v-if="question.response.agreement.link" :href="question.response.agreement.link" target="_blank">Read agreement</a>
                        </span>
                        </v-list-item-subtitle>
                        <template v-if="question.response.attachments">
                          <template v-if="question.response.attachments.questions && question.response.attachments.questions.length">
                            <div class="ml-5">
                              <template v-for="(followUpQuestion, fq) in question.response.attachments.questions">
                                <v-list-item-title :key="`follow-up-${fq}`">
                                  {{ followUpQuestion.question }}
                                </v-list-item-title>
                                <v-list-item-subtitle :key="`follow-up-response-${fq}`">
                                  Ans: {{ followUpQuestion.response.option  }}
                                </v-list-item-subtitle>
                              </template>
                            </div>
                          </template>
                        </template>
                      </template>

                      <v-list-item-subtitle v-else>
                        No response
                      </v-list-item-subtitle>

                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <div v-else class="my-5 grey--text text-center">
                  No question responded to for this reservation
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Agreements</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content v-if="checkin" class="pt-3">
                <v-list v-if="agreements.length">
                  <property-agreement
                      v-for="(agreement, i) in agreements"
                      :key="i" :agreement="agreement" />
                </v-list>
                <div v-else class="my-5 grey--text text-center">
                  No agreement for the reservation
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Instruction</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div class="text-center mt-5" v-if="reservation.instruction">
                  {{reservation.instruction}}
                </div>
                <div class="text-center mt-5 grey--text" v-else>
                  No checkin instruction
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Damages</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content v-if="checkin" class="pt-3 pt-3">
                <reservation-damages
                    :reservation="reservation"
                    :is-host="true"
                    class="mx-n6"
                    ref="damages"
                >
                  <template #options="{ damage, damageUpdated, damageDeleted }">
                    <reservation-damage-host-options
                        v-if="!damage.resolution"
                        :reservation="reservation"
                        :damage="damage"
                        @damage-updated="dmg => damageUpdated(dmg)"
                        @damage-deleted="dmg_id => damageDeleted(dmg_id)"
                    />
                  </template>
                  <template #footer-actions="{ createDamageReport }">
                    <v-card-actions class="mt-2">
                      <v-spacer></v-spacer>
                      <v-btn
                          color="primary"
                          @click="createDamageReport"
                          small depressed>
                        <v-icon>mdi-plus</v-icon>
                        New Damage Report
                      </v-btn>
                    </v-card-actions>
                  </template>
                </reservation-damages>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Payment Requests</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content v-if="checkin" class="pt-3 pt-3">
                <reservation-payment-requests
                    :reservation="reservation"
                    :is-host="true"
                    class="mx-n6"
                    ref="paymentRequests"
                >
                  <template #options="{ request, requestUpdated, requestDeleted }">
                    <reservation-payment-request-host-options
                      :reservation="reservation"
                      :request="request"
                      @payment-request-updated="req => requestUpdated(req)"
                      @payment-request-deleted="req => requestDeleted(req)"
                    />
                  </template>
                  <template #footer-actions="{ createRequest }">
                    <v-card-actions class="mt-2">
                      <v-spacer></v-spacer>
                      <v-btn
                          color="primary"
                          @click="createRequest"
                          small depressed>
                        <v-icon>mdi-plus</v-icon>
                        New Payment Request
                      </v-btn>
                    </v-card-actions>
                  </template>
                </reservation-payment-requests>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Document Requests</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content v-if="checkin" class="pt-3 pt-3">
                <reservation-document-requests
                    :reservation="reservation"
                    class="mx-n6"
                    ref="documentRequests"
                >
                  <template #options="{ request, requestUpdated, requestDeleted }">
                    <reservation-document-request-host-options
                        :property="property"
                        :reservation="reservation"
                        :request="request"
                        @document-request-updated="req => requestUpdated(req)"
                        @document-request-deleted="req => requestDeleted(req)"
                    />
                  </template>
                  <template #footer-actions="{ createRequest }">
                    <v-card-actions class="mt-2">
                      <v-spacer></v-spacer>
                      <v-btn
                          color="primary"
                          @click="createRequest"
                          small depressed>
                        <v-icon>mdi-plus</v-icon>
                        New Document Request
                      </v-btn>
                    </v-card-actions>
                  </template>
                </reservation-document-requests>
              </v-expansion-panel-content>
            </v-expansion-panel>

          </v-expansion-panels>

          <div class="mt-3" v-if="reservation.active">
              <template v-if="!reservation.approved && hasPermissionToApprove">
                <reservation-checkin-approval-rule-check
                    :reservation="reservation"
                    :checkin="checkin"
                    @rules="checkinApprovalRulesCheckResult"
                />
                <v-btn
                    color="success"
                    @click="$refs.approvalConfirmation.open()"
                    :loading="approval.loading"
                    :disabled="!canApprove"
                    class="mx-2 mt-5"
                >
                  <v-icon class="mr-2">mdi-check-circle</v-icon>  Approve checkin
                </v-btn>
              </template>
              <template v-if="reservation.approved && checkoutPassed && !reservation.checkedout && hasPermissionToUpdate">
                <v-btn
                    color="success"
                    @click="$refs.checkoutConfirmation.open()"
                    :loading="checkout.loading"
                    class="mx-2"
                >
                  <v-icon class="mr-2">mdi-check-circle</v-icon> Checkout
                </v-btn>
            </template>
            </div>

        </template>
    </data-container>
  </section>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';

import GET_RESERVATION_CHECKIN from '../Queries/getReservationCheckin';
import APPROVE_RESERVATION_CHECKIN from '../Mutations/approveReservationCheckin';

import DataContainer from '../../../components/DataContainer'

import StripeChargeCapture from '../Components/Payment/StripeChargeCapture.vue';
import StripeChargeRefund from '../Components/Payment/StripeChargeRefund.vue';
import StripeExtraCharge from '../Components/Payment/StripeExtraCharge.vue'

import PaystackExtraCharge from '../Components/Payment/PaystackExtraCharge.vue'

import ReservationCharges from './ReservationCharges.vue';
import StripeCreditCard from '../../../components/Utilities/StripeCreditCard.vue';
import PaystackCreditCard from '../../../components/Utilities/PaystackCreditCard.vue'
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog.vue';
import ReservationPayments from '../Components/Payment/ReservationPayments.vue'
import ReservationCheckinContract from './ReservationCheckinContract.vue';
import ReservationGuests from './ReservationGuests.vue';
import PropertyAgreement from '../../Property/Components/PropertyAgreement.vue'
import ReservationCheckinApprovalRuleCheck from "@/domain/Reservation/Components/ReservationCheckinApprovalRuleCheck";
import reservationMixin from '../../Reservation/Mixins/reservation';
import ReservationDamages from "@/domain/Reservation/Widgets/ReservationDamages";
import ReservationDamageHostOptions from "@/domain/Reservation/Components/ReservationDamageHostOptions";
import StripePaymentMethod from "@/components/Utilities/StripePaymentMethod.vue";
import ReservationPaymentRequests from "@/domain/Reservation/Widgets/ReservationPaymentRequests.vue";
import ReservationPaymentRequestHostOptions
  from "@/domain/Reservation/Components/ReservationPaymentRequestHostOptions.vue";
import ReservationDocumentRequests from "@/domain/Reservation/Widgets/ReservationDocumentRequests.vue";
import ReservationDocumentRequestHostOptions
  from "@/domain/Reservation/Components/ReservationDocumentRequestHostOptions.vue.vue";
import UserIdentityVerification from "@/domain/User/Components/IdentityVerification.vue";

export default {
    name: "PropertyReservationCheckin",
    mixins: [reservationMixin],
    components: {
      UserIdentityVerification,
      ReservationDocumentRequestHostOptions,
      ReservationDocumentRequests,
      ReservationPaymentRequestHostOptions,
      ReservationPaymentRequests,
      StripePaymentMethod,
      ReservationDamageHostOptions,
      ReservationDamages,
      DataContainer, ConfirmationDialog,
      ReservationCharges, ReservationPayments,
      ReservationCheckinContract, ReservationGuests, PropertyAgreement,
      StripeCreditCard, StripeChargeCapture, StripeChargeRefund, StripeExtraCharge,
      PaystackCreditCard, PaystackExtraCharge, ReservationCheckinApprovalRuleCheck
    },
    data(){

        return {
            panel: 0,
            checkin: null,
            loading: false,
            approval: {
                loading: false,
                error: null,
            },
            refreshCharges: false,
            error: null,
            approvalRulesPassed: false,
        }
    },

    computed: {

      agreements() {
        return this.checkin?.checkin.agreements || []
      },
      creditCard() {
        return this.checkin?.checkin.credit_card || {}
      },
      questions() {
        return this.checkin?.checkin.questions || []
      },

      user(){
          return this.checkin ? this.checkin.user : null
      },

      canApprove(){
          return this.user !== null && this.approvalRulesPassed;
      },

      checkout() {
        return {
          loading: this.actionsLoading.includes('checkingout'),
        }
      }

    },

    props: {
        reservation: Object,
    },

    methods: {
      ...mapActions([
          'query',
          'mutate'
      ]),
      ...mapMutations([
          'TOAST_ERROR'
      ]),

      getReservationCheckin(){
          this.loading = true;
          this.error = null;
          this.query({
              query: GET_RESERVATION_CHECKIN,
              variables: {
                  id: this.reservation.id
              }
          })
          .then(response => {
              this.checkin = response.data.getReservation?.checkin;
              if(!this.checkin.user){
                  this.$store.commit('SNACKBAR', {
                      status: true,
                      text: "The user account that checked in no longer exist",
                      color: "error"
                  })
              }
          })
          .catch(e => {
              this.error = e
          })
          .finally(() => {
              this.loading = false;
          })
      },

      approveCheckin(){
            this.approval.loading = true;
            this.approval.error = null;

            this.mutate({
                mutation: APPROVE_RESERVATION_CHECKIN,
                variables: { id: this.reservation.id }
            })
            .then(response => {
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: "Checkin Approved",
                    color: "success"
                })
                this.$emit('approved', response.data.approveReservationCheckin);
            })
            .catch(e => {
               this.TOAST_ERROR({
                    show: true,
                    retry: () => this.approveCheckin(),
                    message: 'Could not approve reservation checkin. ',
                    exception: e
                });
                this.$emit('error', e);
            })
            .finally(() => {
                this.approval.loading = false;
            })
        },

      checkinApprovalRulesCheckResult(rules) {
          this.approvalRulesPassed = rules.every(rule => rule.pass);
      },

      reservationIDUploadVerificationVerified(id) {
        this.checkin.verification = {
          ...this.checkin.verification, ...Object.assign(this.checkin.verification.upload, id)
        }
      },

      guestUploadedIDVerified(guest, id) {
          this.reservation.guests = this.reservation.guests.map(g => {
            if(g.id === guest.id)  Object.assign(g.verification.upload, id);
            return g;
          })
      }
    },

    watch: {
        reservation: {
            immediate: true,
            handler(reservation){
                if(reservation) this.getReservationCheckin();
            }
        }
    }
}

</script>