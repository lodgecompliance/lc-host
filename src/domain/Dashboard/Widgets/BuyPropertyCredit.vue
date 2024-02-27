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
      <v-card-text >
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
              v-model="form.property_id"
              :rules="[(value) => !!value || 'Select a property']"
              outlined dense
              clearable
          />
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
import DashboardPropertySelect from "@/domain/Dashboard/Components/PropertySelect";
export default {
  name: "AddPropertyCredit",
  components: {DashboardPropertySelect},
  data() {
    return {
      dialog: false,
      loading: false,
      form: {
        amount: 0,
        property_id: null
      }
    }
  },
  props: {
    property: Object
  },
  methods: {
    submit() {
      if(!this.$refs.form.validate()) return;
      this.$store.commit('SNACKBAR', {
        status: true,
        text: "Not available yet",
        color: "info"
      })
    }
  },
  watch: {
    property: {
      immediate: true,
      handler(property) {
        this.form.property_id = property ? property.id : null;
      }
    }
  }
}
</script>