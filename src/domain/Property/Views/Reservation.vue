<template>
    <property :breadcrumbs="breadcrumbs">
      <template #header>
        <v-row justify="center">
          <v-col cols="12" :md="reservation ? 9 : 6">
            <div class="d-flex align-center justify-space-between">
              <h2>{{ reservation ? reservation.name : "" }}</h2>
              <v-btn v-if="edit" color="red" text @click="$router.replace({...$route, query: {edit: undefined}})">
                <v-icon>mdi-close</v-icon> <span class="d-none d-sm-inline"> Cancel Edit</span>
              </v-btn>
              <reservation-host-options v-else-if="reservation"
                  :reservation="reservation"
                  @reservation-updated="reservationUpdated"
                  @reservation-deleted="reservationDeleted"
              />
            </div>
          </v-col>
        </v-row>
      </template>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-card rounded flat>
            <v-card-text>
              <data-container :loading="loading">

<!--                <template v-slot:loading>-->
<!--                    <reservation-skeleton />-->
<!--                </template>-->

                <template v-if="property">
                  <div class="d-flex align-center pb-3">
                    <v-avatar color="primary" size="50">
                      <v-img
                          :src="property.image"
                      ></v-img>
                    </v-avatar>
                    <router-link v-if="property"
                                 :to="{ name: 'property.show', params: { property: property.id} }"
                                 class="text-decoration-none ml-2">
                      <h3 class="black--text">{{ property.name}}</h3>
                      <div class="grey--text">{{ property.full_address }}</div>
                    </router-link>
                  </div>
                </template>

                <!-- resource no longer loading but it not found -->
                <template v-if="reservation == null">
                    <v-sheet class="pa-3" rounded>
                        <div class="text-center">
                            <h1>We could not find that reservation</h1>
                            <p class="grey--text">check that the url is valid</p>
                        </div>
                    </v-sheet>
                </template>

                <!-- the resource is found -->
                <template v-else-if="reservation">
                  <section v-if="edit">
                    <reservation-form
                    v-if="hasPermissionToEdit"
                    :property="property"
                    :reservation="reservation"
                    @reservation-updated="refreshReservation">
                      <template #header>
                        <p class="grey--text">Update reservation created for {{reservation.name}} at {{property.name}}</p>
                      </template>
                    </reservation-form>
                    <v-alert v-else type="warning" colored-border border="left">
                        You do not have permission to update reservation in {{ property.name }}
                    </v-alert>
                  </section>
                  <section v-else>
                    <reservation-timeline
                        :reservation="reservation"
                        :dense="true"
                        class="ml-n6 mt-n3"
                    />

                    <v-divider></v-divider>

                    <div class="py-3">
                      <div class="d-flex flex-wrap justify-space-between align-center">
                        <div class="flex-grow-1">
                          <p class="grey--text">Guest Checkin URL</p>
                          <clip-board v-model="reservation.checkin_url" class="w-100" />
                        </div>
                        <convert-to-pdf v-bind="reservationPDF" class="mt-10" />
                      </div>
                      <div class="mt-2">
                        <p class="grey--text">Created {{ createdAtMoment.format('MMMM Do YYYY, hh:mm a') }}, {{ createdAtMoment.fromNow() }} </p>
                        <p v-if="updatedAtMoment" class="grey--text">Updated {{ updatedAtMoment.format('MMMM Do YYYY, hh:mm a') }}, {{ updatedAtMoment.fromNow() }} </p>
                      </div>
                  </div>
                  <v-divider></v-divider>
                  <div class="py-3">
                    <h3>Reservation Details</h3>
                    <v-list dense>
                      <metadata-list-item
                          v-for="meta in details"
                          :metadata="meta"
                          type="edge"
                          :key="meta.key" />
                      <metadata-list-item
                        :metadata="{}"
                        type="edge"
                      >
                        <template #content>
                          <div class="d-flex justify-space-between">
                            <v-list-item-subtitle class="grey--text">Status</v-list-item-subtitle>
                            <reservation-status :reservation="reservation" />
                          </div>
                        </template>
                      </metadata-list-item>
                    </v-list>
                 </div>
                  <send-message v-if="reservation.active && hasPermissionToManageGuest" :reservation="reservation"> Send Guest Message </send-message>

                  </section>
              </template>
            </data-container>
            </v-card-text>
          </v-card>
          <div v-if="reservation && reservation.checkedin">
            <property-reservation-checkin
                v-if="property"
                :reservation="reservation"
                @approved="reservationApproved"
                @reservation-updated="reservationUpdated"
            />
          </div>
        </v-col>
        <v-col cols="12" v-if="reservation" md="3">
          <reservation-sessions :reservation="reservation" />
        </v-col>
      </v-row>
    </property>
</template>

<script>
import { mapActions } from 'vuex';
import gql from 'graphql-tag';

import DataContainer from '../../../components/DataContainer.vue';
import ReservationForm from '../../Reservation/Components/ReservationForm.vue';
import PropertyReservationCheckin from '../../Reservation/Widgets/PropertyReservationCheckin';
import ClipBoard from '../../../components/Utilities/ClipBoard';
import SendMessage from '../../Reservation/Components/SendMessage.vue';
import GET_RESERVATION from '../../Reservation/Queries/getReservation';
import reservationMixin from '../../Reservation/Mixins/reservation';
import ConvertToPdf from '../../../components/Utilities/convertToPdf.vue';
import { summary as pdfContent } from '../../Reservation/Helpers/pdf';
import ReservationTimeline from "@/domain/Reservation/Components/ReservationTimeline";
import ReservationHostOptions from "@/domain/Reservation/Components/ReservationHostOptions";
import ReservationSessions from "@/domain/Reservation/Widgets/ReservationSessions.vue";
import MetadataListItem from "@/components/MetadataListItem.vue";
import ReservationStatus from "@/domain/Reservation/Components/ReservationStatus.vue";
import Property from "@/domain/Property/Views/Show.vue";

export default {
  name: 'PropertyReservation',
  mixins: [reservationMixin],
  components: {
    Property,
    ReservationStatus,
    MetadataListItem,
    ReservationSessions,
    ReservationHostOptions,
    ReservationTimeline,
    DataContainer,  ReservationForm,
    PropertyReservationCheckin, ClipBoard, SendMessage,
    ConvertToPdf
  }, 
  data(){
      return {
        loading: false,
        sending_mail: false,
        reservation: null,
        checkin: null,
        refreshCharges: false,
      }
  },

    computed:{
      id(){
            return this.$route.params.reservation
        },

      edit: {
        get: function() {
          return this.$route.query.edit == 1
        },
        set: function(tab){}
      },

      reservationPDF() {
            return {
                fileName: `${this.property.name} - Guest Registration`,
                actions: ['open', 'print', 'download'],
                metadata: {
                    title: `Reservation Summary at ${this.property.name}`,
                    author: `Guest registration (${this.property.name})`,
                    subject: `Reservation at ${this.property.name}`,
                    creator: "Guest Registration via pdfmake",
                    producer: "Guest Registration via pdfmake",

                },
                content: pdfContent(this.reservation),
            }
        },

      breadcrumbs() {
          return [
            {
              text: "Reservations",
              to: { path: '/' }
            },
            {
              text: this.id,
              to: this.$route
            }
          ]
      },

      details() {
        if(!this.reservation) return [];
        return [
          { key: "Booking Name", value: this.reservation.name },
          { key: "Account Name", value: this.$options.filters.nullable(this.reservation.user?.full_name) },
          { key: "Email Address", value: this.$options.filters.nullable(this.reservation.email) },
          { key: "Phone Number", value: this.$options.filters.nullable(this.reservation.phone) },
          { key: "Checkin Date", value: this.checkinMoment.format('ll') },
          { key: "Checkout Date", value: this.checkoutMoment.format('ll') },
          { key: "Booking Channel", value: this.$options.filters.nullable(this.bookingChannel) },
          { key: "Balance", value: this.$options.filters.money(this.reservation.balance,this.reservation.currency) },
        ]
      }
    },

    methods:{
      ...mapActions([
          'query',
          'mutate',
    ]),

    getReservation(){
        this.loading = true;
        this.query({
            query: GET_RESERVATION,
            variables: {
                id: this.id
            }
        })
        .then(response => {
            this.reservation = response.data.getReservation;
        })
        .catch(e => {
            this.$refs.app.toastError({
                message: `Could not get reservation.`,
                retry: () => this.getReservation(),
                exception: e
            });
        })
        .finally(() => {
            this.loading = false;
        })
    },

    reservationApproved(reservation) {
        this.getReservation();
    },

    reservationUpdated(reservation) {
        Object.assign(this.reservation, reservation)
    },

    refreshReservation() {
      this.$router.replace({...this.$route, query: {edit: undefined}})
      this.getReservation();
    },

    reservationDeleted() {
      this.$router.push({ name: 'home' })
    },

    sendCheckinMail() {
        this.sending_mail = true;
        this.mutate({
            mutation: gql`
                mutation sendReservationCheckinMail ($id: ID!) {
                    sendReservationCheckinMail(id: $id) 
                }`,
            variables: {
                id: this.id
            }
        })
        .then(response => {
            const sent = response.data.sendReservationCheckinMail;
            this.$store.commit("SNACKBAR", {
                status: true,
                text: sent ? "Checkin mail sent" : "Checkin mail not sent",
                color: sent ? "success" : "error"
            });
        })
        .catch(e => {
            this.$store.commit('TOAST_ERROR', {
                show: true,
                message: `Could not send checkin mail.`,
                retry: () => this.sendCheckinMail(),
                exception: e
            })
        })
        .finally(() => {
            this.sending_mail = false;
        })
    }
  },

  watch: {
      id: {
          immediate: true,
          handler() {
            this.getReservation();
          }
      }
  }

}
</script>
