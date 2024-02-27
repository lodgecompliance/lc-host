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
        <slot><v-icon>mdi-swap-horizontal</v-icon> Transfer Points </slot>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <h4 class="headline">Transfer Check-in Points</h4>
      </v-card-title>
      <v-card-text class="pt-5">
        <confirmation-dialog ref="confirmation" @confirmed="completeTransfer">
          <p v-if="form.to_property" class="text-center">Are you sure you want to transfer {{ form.points }} points to {{ form.to_property.name }}</p>
        </confirmation-dialog>
        <v-form ref="form">
          <user-properties-select
              outlined
              dense
              label="Send From"
              return-object
              v-model="form.from_property"
          >
            <template #item="{ item: property, on }">
              <v-list-item v-on="on">
                <v-list-item-avatar>
                  <v-img :src="property.image"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{property.name}}</v-list-item-title>
                  <v-list-item-subtitle>Checkin Points: {{ property.checkin_points }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </user-properties-select>

          <user-properties-select
              outlined
              dense
              label="Send To"
              return-object
              v-model="form.to_property"
              :rules="[(value) => !!value || 'Select property to transfer to', (value) => value && form.from_property && value.id !== form.from_property.id || 'Recipient property can not be same as sender property' ]"
          >
            <template #item="{ item: property, disabled, on }">
              <v-list-item v-on="on" :disabled="disabled">
                <v-list-item-avatar>
                  <v-img :src="property.image"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{property.name}}</v-list-item-title>
                  <v-list-item-subtitle>Checkin Points: {{ property.checkin_points }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </user-properties-select>

          <v-text-field
              outlined dense
              label="Credit Amount"
              :rules="[
                  (value) => !!value && value > 0 || 'Enter a valid credit amount',
                  (value) => form.from_property && form.from_property.checkin_points >= value || 'Points more that sender balance' ]"
              type="number"
              v-model="form.points"
              placeholder="Enter credit amount"
          ></v-text-field>
        </v-form>
        <error-handler :error="error" @retry="completeTransfer" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" @click="close" text>Cancel</v-btn>
        <v-btn @click.prevent="submit" color="primary" elevation="0" :loading="transferring" depressed>Transfer Points</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import UserPropertiesSelect from "@/domain/User/Components/UserPropertiesSelect";
import {mapActions} from "vuex";
import gql from "graphql-tag";
import ConfirmationDialog from "@/components/Utilities/ConfirmationDialog";
import ErrorHandler from "@/components/ErrorHandler";
export default {
  name: "TransferPropertyCredit",
  components: {ErrorHandler, ConfirmationDialog, UserPropertiesSelect },
  data() {
    return {
      dialog: false,
      height: 500,
      transferring: false,
      form: {},
      error: null,
    }
  },
  methods: {
    ...mapActions([
        'mutate', 'query'
    ]),

    close() {
      this.resetForm();
      this.dialog = false;
    },

    resetForm() {
      this.form = {
        from_property: this.$store.getters.current_user.property,
        to_property: null,
        points: null,
      }
    },

    submit() {
        if(this.$refs.form.validate()) {
          this.$refs.confirmation.open();
        }
    },

    completeTransfer() {
      this.error = null;
      this.transferring = true;
      this.mutate({
        mutation: gql `
          mutation transferPropertyCheckinPoint($data: PropertyCheckinPointTransferInput!) {
            transferPropertyCheckinPoint(data: $data) {
              opening_balance
              closing_balance
              reference
              points
              created_at
            }
          }
        `,
        variables: {
          data: {
            from_property: this.form.from_property.id,
            to_property: this.form.to_property.id,
            points: parseInt(this.form.points)
          }
        }
      })
      .then(response => {
        this.$emit("transfer", response.data.transferPropertyCheckinPoint);
        this.$store.commit("SNACKBAR", {
          status: true,
          text: `${this.form.points} points transferred to ${this.form.to_property.name}`,
          color: "success"
        })
        this.close()
      })
      .catch(e => {
        this.error = e;
      })
      .finally(() => {
        this.transferring = false;
      })
    },

  },
  mounted() {
    this.resetForm()
  },
  watch: {
  }
}
</script>