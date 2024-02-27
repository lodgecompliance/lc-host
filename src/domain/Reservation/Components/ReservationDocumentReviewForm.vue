<template>
  <v-dialog width="350" v-model="dialog">
    <v-card :loading="submitting" flat>
      <slot name="header">
        <v-card-title>{{ status === 'rejected' ? 'Reject' : 'Review' }} Document</v-card-title>
      </slot>
      <v-card-text class="pt-3">
        <v-form ref="form" @submit.prevent>
          <v-textarea
              outlined
              label="Reason (optional)"
              placeholder="Add a reason here..."
              v-model="form.comment"
              dense
              :rules="[]"
          ></v-textarea>
          <error-handler :error="formError" :can-retry="false" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="dialog = false">Cancel</v-btn>
        <v-btn
            color="primary"
            @click.prevent="submit"
            :loading="submitting"
            depressed
        >
          Reject Document
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';
import form from '@/mixins/form';
import gql from "graphql-tag";
import ErrorHandler from "@/components/ErrorHandler";

export default {
  name: "ReservationDocumentReviewForm",
  components: { ErrorHandler },
  mixins: [form],
  data(){
      return {
        dialog: false
      }
  },
  props: {
      reservation: Object,
      request: Object,
      status: String
  },
  methods: {

    ...mapActions([
        'query',
        'mutate'
    ]),

    setForm() {
      this.form = {
        status: this.status,
        comment: null,
      }
    },

    resetForm() {
      this.$refs.form.reset();
      this.setForm();
    },

    submission() {
      if(!this.$refs.form.validate()) return Promise.reject(new Error("Fill all necessary fields correctly"));
      return this.reviewDocument();
    },

    reviewDocument() {
        return new Promise((resolve, reject) => {
          this.mutate({
            mutation: gql `mutation reviewReservationDocumentRequest($reservation_id: ID!, $request_id: ID!, $data: ReservationDocumentRequestReviewInput!) {
              reviewReservationDocumentRequest(reservation_id: $reservation_id, request_id: $request_id, data: $data) {
                id
                review {
                  status
                  comment
                  reviewed_at
                }
              }
            }`,
            variables: {
              request_id: this.request.id,
              reservation_id: this.reservation.id,
              data: this.form
            }
          }).then(response => {
            const request = response.data.reviewReservationDocumentRequest;
            this.$store.commit("SNACKBAR", {
              status: true,
              text: `${this.request.title} updated`,
              color: "success"
            })
            this.dialog = false;
            this.$emit('document-request-updated', request);
            resolve(request)
          })
          .catch(e => reject(e))
        })
      }
   },

  watch: {
    status: {
      immediate: true,
      handler(status) {
        this.setForm();
        if(status === "rejected") {
          this.dialog = true;
          return;
        }
        this.reviewDocument()
      }
    }
  }
}
</script>