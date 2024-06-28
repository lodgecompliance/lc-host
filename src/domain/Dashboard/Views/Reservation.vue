<template>
  <dashboard :class="`${!$vuetify.breakpoint.mdAndUp ? 'white' : ''}`">
    <template #header>
      <div class="d-flex justify-space-between">
        <h4 class="headline">Reservations</h4>
        <v-spacer></v-spacer>
        <v-btn icon @click="queryReservation" class="ml-2" title="Refresh"> <v-icon>mdi-refresh</v-icon> </v-btn>
        <reservation-admin-options  v-if="reservation && !$vuetify.breakpoint.mdAndUp" :reservation="reservation" />
      </div>
    </template>
    <v-row justify="center">
      <v-col cols="12" md="11" lg="10">
        <div class="d-flex justify-space-between">
          <v-breadcrumbs v-if="$vuetify.breakpoint.mdAndUp"  :items="breadcrumbs">
            <template v-slot:divider>
              <v-icon>mdi-chevron-right</v-icon>
            </template>
          </v-breadcrumbs>
          <v-spacer></v-spacer>
          <reservation-admin-options  v-if="reservation && $vuetify.breakpoint.mdAndUp" :reservation="reservation" />
        </div>
        <data-container :loading="loading">
          <template v-if="reservation">
            <div class="d-flex justify-space-between">
              <router-link
                  :to="{ name: 'dashboard.property.show', params: { id: property.id }}"
                  class="text-decoration-none"
              >
                <div class="d-flex align-content-center">
                  <v-avatar size="60">
                    <img :alt="property.name"
                         :src="property.image"
                    >
                  </v-avatar>
                  <div class="ml-3">
                    <h4>{{ property.name }}</h4>
                    <p> {{ property.address }} </p>
                  </div>
                </div>
              </router-link>
              <div class="text-right">
                <reservation-status :reservation="reservation" />
                <div> {{ checkinMoment.format("MMM D, YYYY") }} - {{ checkoutMoment.format("MMM D, YYYY") }}  </div>
              </div>
            </div>

            <v-row>
              <v-col cols="12" md="8">
                <v-expansion-panels focusable v-model="panel">
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Reservation Details
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="pt-3">
                      <v-list>
                        <template v-for="(info, i) in listInfo">
                          <v-list-item :key="`info-${i}`">
                            <v-list-item-content>
                              <div class="d-flex justify-space-between">
                                <div>{{ info.label }}</div>
                                <div>
                                  <router-link
                                      v-if="info.route"
                                      :to="info.route"
                                      class="text-decoration-none"
                                  >
                                    <strong>{{info.content}}</strong>
                                  </router-link>
                                  <strong v-else> {{ info.content }} </strong>
                                </div>
                              </div>
                            </v-list-item-content>
                          </v-list-item>
                          <v-divider :key="`divider-${i}`" v-if="i < (listInfo.length - 1)"></v-divider>
                        </template>
                      </v-list>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Agreements
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="pt-3">
                      <v-list v-if="reservationAgreements.length">
                        <template v-for="(agreement, i) in reservationAgreements">
                          <property-agreement
                              :key="`agreement-${i}`"
                              :agreement="agreement"
                          />
                          <v-divider :key="`divider-${i}`" v-if="i < (reservationAgreements.length - 1)"></v-divider>
                        </template>
                      </v-list>
                      <div v-else class="py-5 text-center grey--text">
                        No agreement
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Questions
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="pt-3">
                      <v-list v-if="reservationQuestions.length">
                        <template v-for="(question, i) in reservationQuestions">
                          <v-list-item :key="`question-${i}`">
                            <v-list-item-content>
                              <v-list-item-title>{{ question.question }}</v-list-item-title>
                              <v-list-item-subtitle>{{ question.response_type }}</v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                          <v-divider :key="`divider-${i}`" v-if="i < (reservationQuestions.length - 1)"></v-divider>
                        </template>
                      </v-list>
                      <div v-else class="py-5 text-center grey--text">
                        No question
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Charges
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="pt-3">
                      <v-list v-if="reservationCharges.length">
                        <template v-for="(charge, i) in reservationCharges">
                          <v-list-item :key="`charge-${i}`">
                            <v-list-item-content>
                              <v-list-item-title>{{ charge.title }} ({{ charge.type }})</v-list-item-title>
                              <v-list-item-subtitle>{{ charge.description }}</v-list-item-subtitle>
                              <v-list-item-subtitle>{{ charge.amount * 100 | money_value(charge.currency) }}</v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                          <v-divider :key="`divider-${i}`" v-if="i < (reservationCharges.length - 1)"></v-divider>
                        </template>
                      </v-list>
                      <div v-else class="py-5 text-center grey--text">
                        No charge
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Payments
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="pt-3">
                      <reservation-payments
                          :reservation="reservation"
                          :header="false"
                          :all-payments="true"
                      />
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      ID Verification
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="pt-3">
                      <user-identity-verification
                          :user-id="reservation.user_id"
                      />
                    </v-expansion-panel-content>
                  </v-expansion-panel>

                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Damages
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="pt-3">
                      <reservation-damages :reservation="reservation" />
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Signature
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="pt-3">
                      <signature-pad
                          v-if="checkinSignature"
                          :signature="checkinSignature"
                          :editable="false"
                      />
                      <div v-else class="py-5 text-center grey--text">
                        Not available
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
              <v-col cols="12" md="4">
                <reservation-timeline :reservation="reservation" :dense="true" />
                <reservation-sessions
                    :reservation="reservation"
                    display-type="list"
                />
              </v-col>
            </v-row>
          </template>
          <div v-else class="py-5 text-center grey--text">
            <h5 class="headline">{{id}}</h5>
            <p>Reservation not found</p>
          </div>
        </data-container>
      </v-col>
    </v-row>
  </dashboard>
</template>

<script>
import gql from "graphql-tag";
import Dashboard from "@/views/Dashboard";
import {mapActions, mapGetters, mapMutations} from "vuex";
import ReservationStatus from "@/domain/Reservation/Components/ReservationStatus";
import DataContainer from "@/components/DataContainer";
import reservationMixin from "@/domain/Reservation/Mixins/reservation";
import PropertyAgreement from "@/domain/Property/Components/PropertyAgreement";
import ReservationTimeline from "@/domain/Reservation/Components/ReservationTimeline";
import ReservationPayments from "@/domain/Reservation/Components/Payment/ReservationPayments";
import UserIdentityVerification from "@/domain/User/Components/IdentityVerification";
import SignaturePad from "@/components/Utilities/SignaturePad";
import ReservationAdminOptions from "@/domain/Dashboard/Components/ReservationOptions";
import ReservationDamages from "@/domain/Reservation/Widgets/ReservationDamages";
import ReservationSessions from "@/domain/Reservation/Widgets/ReservationSessions.vue";

export default {
  name: "DashboardReservation",
  mixins: [reservationMixin],
  components: {
    ReservationSessions,
    ReservationDamages,
    ReservationAdminOptions,
    SignaturePad,
    UserIdentityVerification,
    ReservationPayments, ReservationTimeline, PropertyAgreement, DataContainer, ReservationStatus, Dashboard },
  data() {
    return {
      loading: false,
      reservation: null,
      panel: 0
    }
  },
  computed: {
    ...mapGetters(['dashboard']),
    breadcrumbs() {
      return [
        {
          text: "Home",
          to: { name: 'home' }
        },
        {
          text: "Reservations",
          to: { name: 'dashboard.reservations' }
        },
        {
          text: this.reservation ? this.reservation.name: this.id,
          to: this.$route
        }
      ]
    },
    id() {
      return this.$route.params.id;
    },
    property() {
      return this.reservation?.property
    },
    listInfo() {
      if(!this.reservation) return [];
      return [
        {
          label: "ID",
          content: this.$options.filters.nullable(this.reservation.id)
        },
        {
          label: "Booking Name",
          content: this.reservation.name
        },
        {
          label: "Checkin Date",
          content: this.reservation.checkin_date
        },
        {
          label: "Checkout Date",
          content: this.reservation.checkout_date
        },
        {
          label: "Booking Reference",
          content: this.$options.filters.nullable(this.reservation.booking_reference)
        },
        {
          label: "Phone",
          content: this.$options.filters.nullable(this.reservation.phone)
        },
        {
          label: "Email",
          content: this.$options.filters.nullable(this.reservation.email)
        },
        {
          label: "Booking Channel",
          content: this.reservation.booking_channel
              ? this.$options.filters.nullable(
                  this.reservation.booking_channel[this.reservation.booking_channel.label == 'Other' ? 'id' : 'label']
              ) : this.$options.filters.nullable(null)
        },
        {
          label: "Balance",
          content: this.$options.filters.nullable(this.reservation.balance)
        },
        {
          label: "Required ID verification",
          content: this.reservation.require_id_verification ? "YES" : "NO"
        },
        {
          label: "Created",
          content: this.createdAtMoment.format("MMM D, YYYY")
        },
        {
          label: "Checkin URL",
          content: this.reservation.checkin_url
        },
        {
          label: "Created by",
          content: this.$options.filters.nullable(this.reservation.created_by ? this.reservation.created_by.full_name : null),
          route: this.reservation.created_by ? { name: 'dashboard.user.show', params: { id: this.reservation.created_by.id } } : null
        },
        {
          label: "Checked in by",
          content: this.$options.filters.nullable(this.reservation.user ? this.reservation.user.full_name : null),
          route: this.reservation.user ? { name: 'dashboard.user.show', params: { id: this.reservation.user.id } } : null
        }
      ]
    },
    reservationAgreements() {
      return this.reservation?.agreements || [];
    },
    reservationCharges() {
      return this.reservation?.charges || [];
    },
    reservationQuestions() {
      return this.reservation?.questions || [];
    },
    checkinIdVerification() {
      return this.reservation?.checkin?.verification
    },
    checkinSignature() {
      return this.reservation?.checkin?.signature
    }
  },
  methods: {
    ...mapActions(['query']),
    ...mapMutations(['TOAST_ERROR']),
    queryReservation() {
      this.loading = true;
      this.query({
        query: gql`
          query getReservation($id: ID!){
              getReservation(id: $id){
                id
                user_id
                name
                balance
                currency
                room
                booking_reference
                booking_channel {
                    id
                    label
                }
                active
                status
                checkedin
                already_checkedin
                checkedin_at
                approved
                approved_at
                checkin_date
                checkout_date
                cancelled
                cancelled_at
                checkedout
                checkedout_at
                instruction
                checkin_url
                property_id
                property{
                    id
                    name
                    address
                    image
                }
                user {
                    id
                    email
                    full_name
                }
                created_by {
                    id
                    email
                    first_name
                    last_name
                    full_name
                }
                require_id_verification
                timestamp {
                  created_at
                  updated_at
                }

                # Agreements start
                agreements {
                    id
                    agreement
                    link
                    text
                }
                #Agreements ends

                #Charges start
                charges {
                    id
                    title
                    amount
                    description
                    type
                    enable
                    optional
                    currency
                    unit

                }
                #Charges end

                #Question start
                questions {
                    id
                    question
                    response_type
                    required
                    options {
                        option
                    }
                }
              # Question end

              #checkin start
                checkin {
                  signature
                }
              }
           }
        `,
        variables: {
          id: this.id
        }
      }).then(response => {
        this.reservation = response.data.getReservation;
      })
      .catch(e => {
        this.TOAST_ERROR({
          show: true,
          message: "Couldn't get reservation.",
          retry: () => this.queryReservation(),
          exception: e
        })
      }).finally(() => {
        this.loading = false
      })
    },
    getReservationFromSystemData() {
      if(this.dashboard) {
        this.reservation = this.dashboard.reservations.find(r => r.id === this.id);
      }
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.queryReservation()
      }
    }
  }
}

</script>