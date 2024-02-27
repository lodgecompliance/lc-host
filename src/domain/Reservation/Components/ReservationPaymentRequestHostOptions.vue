<template>
    <div>
      <confirmation-dialog ref="actionConfirmation" @confirmed="confirmation.confirmed()">
        <div class="text-center" v-html="confirmation.text"></div>
      </confirmation-dialog>
      <v-dialog v-model="requestFormDialog" width="400">
        <reservation-payment-request-form
          :reservation="reservation"
          :request="request"
          :is-host="true"
          :role="requestFormRole"
          @cancel="requestFormDialog = false"
          @payment-request-updated="requestFormDialog = false"
          v-on="$listeners"
        >
        </reservation-payment-request-form>
      </v-dialog>
      <v-menu origin="center center"  transition="scale-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-bind="$attrs.activator" icon v-on="on">
          <v-icon v-bind="$attrs.activatorIcon">mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
            v-if="!request.payment"
            @click="() => { requestFormRole = 'update'; requestFormDialog = true }"
        >
          <v-list-item-icon class="mr-2">
            <v-icon small>mdi-pen</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Edit Request</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="(e) => {
                        confirmation = {
                          text: `Are you sure you want to delete the request <br/> <strong>${request.title}</strong>`,
                          confirmed: deleteRequest
                        }
                        $refs.actionConfirmation.open()
                      }">
          <v-list-item-icon class="mr-2">
            <v-icon color="red" small>mdi-delete</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Delete Request</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    </div>
</template>

<script>
  import reservationMixin from '../Mixins/reservation';
  import ConfirmationDialog from "@/components/Utilities/ConfirmationDialog";
  import {mapActions} from "vuex";
  import gql from "graphql-tag";
  import ReservationPaymentRequestForm from "@/domain/Reservation/Components/ReservationPaymentRequestForm.vue";

  export default {
    name: "ReservationPaymentRequestHostOptions",
    mixins: [reservationMixin],
    components: {ReservationPaymentRequestForm, ConfirmationDialog },
    data() {
      return {
        requestFormDialog: false,
        requestFormRole: 'update',
        confirmation: {
          text: null,
          confirmed: () => {}
        }
      }
    },
    props: {
        reservation: Object,
        request: Object
      },
    methods: {
      ...mapActions(['mutate']),
      deleteRequest() {
        this.mutate({
          mutation: gql `mutation deleteReservationPaymentRequest($reservation_id: ID!, $request_id: ID!) {
            deleteReservationPaymentRequest(reservation_id: $reservation_id, request_id: $request_id)
          }`,
          variables: {
            reservation_id: this.reservation.id,
            request_id: this.request.id
          }
        }).then(response => {
          this.$store.commit("SNACKBAR", {
            status: true,
            text: `${this.request.title} deleted`,
            color: 'success'
          })
          this.$emit('payment-request-deleted', response.data.deleteReservationPaymentRequest)
        })
      }
    }
  }
</script>

