<template>
  <v-dialog
      v-model="dialog"
      width="400"
      scrollable
      persistent
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
          v-bind="$attrs.activator"
          v-on="on"
      >
        <slot><v-icon>mdi-plus</v-icon> Add Credit </slot>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline">
        <span>Credit</span>
      </v-card-title>
      <v-card-subtitle>Add credit to property</v-card-subtitle>
      <v-card-text>
        <confirmation-dialog ref="confirmation" @confirmed="completeCredit">
          <p v-if="form.property" class="text-center">Are you sure you want to send {{ form.amount }} points to {{ form.property.name }}</p>
        </confirmation-dialog>
        <v-form ref="form" class="pt-5" @submit.prevent>
          <v-text-field
              outlined dense
              label="Credit Amount"
              :rules="[(value) => value !== '' && value > 0 || 'Enter a valid credit amount']"
              type="number"
              v-model="form.amount"
              placeholder="Enter credit amount"
          ></v-text-field>
          <dashboard-property-select
              v-if="!property"
              label="Property"
              v-model="form.property"
              :rules="[(value) => !!value || 'Select a property']"
              outlined dense
              clearable
              return-object
          />
          <v-text-field
              outlined dense
              label="Comment (optional)"
              type="text"
              v-model="form.comment"
              placeholder="Optional comment"
          ></v-text-field>
          <error-handler :error="error" @retry="completeCredit" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" @click="dialog = false" text>Cancel</v-btn>
        <v-btn @click.prevent="submit" color="primary" elevation="0" :loading="loading">Send Credit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import ConfirmationDialog from "@/components/Utilities/ConfirmationDialog";
import DashboardPropertySelect from "@/domain/Dashboard/Components/PropertySelect";
import {mapActions} from "vuex";
import gql from "graphql-tag";
import ErrorHandler from "@/components/ErrorHandler";
export default {
  name: "AddPropertyCredit",
  components: {ErrorHandler, DashboardPropertySelect, ConfirmationDialog},
  data() {
    return {
      dialog: false,
      loading: false,
      error: null,
      form: {
        amount: null,
        property: null,
        comment: null
      }
    }
  },
  props: {
    property: Object
  },
  methods: {
    ...mapActions(['mutate']),
    submit() {
      if(!this.$refs.form.validate()) return;
      this.$refs.confirmation.open();
    },
    completeCredit() {
      this.loading = true;
      this.error = null;
      this.mutate({
        mutation: gql`
          mutation adminCreditPropertyCheckinPoint($property_id: ID!, $points: Int!, $comment: String) {
              adminCreditPropertyCheckinPoint(property_id: $property_id, points: $points, comment: $comment) {
                property_id
                opening_balance
                closing_balance
                reference
                points
                created_at
              }
            }
        `,
        variables: {
          property_id: this.form.property.id,
          points: parseInt(this.form.amount),
          comment: this.form.comment
        }
      })
      .then(response => {
        this.$emit("credited", response.data.adminCreditPropertyCheckinPoint)
        this.dialog = false;
        this.$store.commit('SNACKBAR', {
          status: true,
          text: "Property credited successfully!",
          color: "success"
        })
      })
      .catch(e => {
        this.error = e
      })
      .finally(() => {
        this.loading = false
      })
    }
  },
  watch: {
    property: {
      immediate: true,
      handler(property) {
        this.form.property = property ? property : null;
      }
    }
  }
}
</script>