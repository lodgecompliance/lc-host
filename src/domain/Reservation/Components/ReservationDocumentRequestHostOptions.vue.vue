<template>
    <div>
      <confirmation-dialog ref="actionConfirmation" @confirmed="confirmation.confirmed()">
        <div class="text-center" v-html="confirmation.text"></div>
      </confirmation-dialog>
      <v-dialog v-model="requestFormDialog" width="400">
        <reservation-document-request-form
          :reservation="reservation"
          :request="request"
          :role="requestFormRole"
          @cancel="requestFormDialog = false"
          @document-request-updated="requestFormDialog = false"
          v-on="$listeners"
        >
        </reservation-document-request-form>
      </v-dialog>

      <reservation-document-review-form
      :reservation="reservation"
      :request="request"
      :status="status"
      ref="documentReview"
      v-on="$listeners"
      />

      <v-menu origin="center center"  transition="scale-transition">
        <template v-slot:activator="{ on }">
          <v-btn v-bind="$attrs.activator" icon v-on="on">
            <v-icon v-bind="$attrs.activatorIcon">mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
              v-if="!request.submission"
              @click="() => { requestFormRole = 'update'; requestFormDialog = true }"
          >
            <v-list-item-icon class="mr-2">
              <v-icon small>mdi-pen</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Edit Request</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
              v-if="request.submission && !(request.review && request.review.status === 'accepted')"
              @click="() => { status = 'accepted' }">
            <v-list-item-icon class="mr-2">
              <v-icon small>mdi-check</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Accept Document</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
              v-if="request.submission && !(request.review && request.review.status === 'accepted')"
              @click="() => { status = 'rejected' }" >
            <v-list-item-icon class="mr-2">
              <v-icon small>mdi-close</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Reject Document</v-list-item-title>
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
  import ReservationDocumentRequestForm from "@/domain/Reservation/Components/ReservationDocumentRequestForm.vue";
  import ReservationDocumentReviewForm from "@/domain/Reservation/Components/ReservationDocumentReviewForm.vue";

  export default {
    name: "ReservationDocumentRequestHostOptions",
    mixins: [reservationMixin],
    components: {ReservationDocumentReviewForm, ReservationDocumentRequestForm, ConfirmationDialog },
    data() {
      return {
        requestFormDialog: false,
        requestFormRole: 'update',
        confirmation: {
          text: null,
          confirmed: () => {}
        },
        status: null
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
          mutation: gql `mutation deleteReservationDocumentRequest($reservation_id: ID!, $request_id: ID!) {
            deleteReservationDocumentRequest(reservation_id: $reservation_id, request_id: $request_id)
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
          this.$emit('document-request-deleted', response.data.deleteReservationDocumentRequest)
        })
      }
    }
  }
</script>

