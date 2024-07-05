<template>
  <section>
    <confirmation-dialog ref="confirmation" @confirmed="confirmSession">
      <div class="text-center">
        <p>Are you sure you want to confirm this checkin session</p>
      </div>
    </confirmation-dialog>
    <error-handler :error="error" @retry="$refs.confirmation.open()" />
    <slot v-bind="{ loading, confirmSession }">
      <v-btn color="primary"
             @click="$refs.confirmation.open()"
             :loading="loading"
             depressed
      >Confirm Session
      </v-btn>
    </slot>
  </section>
</template>

<script>
import gql from "graphql-tag";
import {mapActions, mapMutations} from "vuex";
import ErrorHandler from "@/components/ErrorHandler.vue";
import ConfirmationDialog from "@/components/Utilities/ConfirmationDialog.vue";

export default {
  name: "ConfirmCheckinSession",
  components: {ConfirmationDialog, ErrorHandler },
  data(){
    return {
      loading: false,
      error: null,
    }
  },
  props: {
    reservation: Object,
    session: Object,
  },
  computed: {
  },
  methods: {
    ...mapActions(['mutate']),
    ...mapMutations(['SNACKBAR']),

    confirmSession() {
      this.loading = true;
      this.error = null;
      this.mutate({
        mutation: gql`
        mutation confirmReservationCheckinSession($reservation_id: ID!, $session_id: ID!) {
          confirmReservationCheckinSession(reservation_id: $reservation_id, session_id: $session_id) {
            id
          }
        }
        `,
        variables: {
          reservation_id: this.reservation.id,
          session_id: this.session.id
        }
      }).then(response => {
        this.SNACKBAR({
          status: true,
          text: `Checkin session confirmed`,
          color: "success"
        })
        this.$emit('session-confirmed', response.data.confirmReservationCheckinSession)
      })
      .catch(e => this.error = e)
      .finally(() => this.loading = false)
    }
  }
}
</script>

