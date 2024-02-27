<template>
  <v-card v-bind="$attrs.card">
    <v-row class="py-0" justify="space-between">
      <v-col cols="4" md="3" lg="2" class="py-0">
        <v-select
            v-model="filter"
            :items="filters"
            item-text="label"
            item-value="value"
            outlined
            dense
            class="white"
        >
        </v-select>
      </v-col>
      <v-col cols="8" md="8" lg="6" class="py-0">
        <v-row justify="end">
          <v-col cols="12" md="8" class="py-0">
            <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Search"
                dense
                outlined
                class="white"
            >
              <template #append>
                <v-btn text small color="primary">
                  <v-icon>mdi-filter-outline</v-icon>
                  <span class="d-none d-md-inline">Filter</span>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" md="4" class="py-0 mt-n5 mt-md-0 text-right" >
            <v-btn color="primary" class="mx-1" elevation="0" :small="!$vuetify.breakpoint.mdAndUp">
              <v-icon small>mdi-plus</v-icon> Create Reservation
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <reservations-table
        :reservations="filteredReservations"
        :search="search"
        v-bind="$attrs.table"
        v-on="$listeners"
    />
  </v-card>
</template>

<script>

import ReservationsTable from "./ReservationsTable";
export default {
  name: "Reservations",
  components: {ReservationsTable},
  data() {
    return {
      search: null,
      filter: null,
      filters: [
        {label: "All Reservations", value: "all"},
        {label: "Pending", value: "pending"},
        {label: "Checked in", value: "checked_in"},
        {label: "Approved", value: "checkin_approved"},
        {label: "Checked out", value: "checked_out"},
        {label: "Cancelled", value: "cancelled"},
        {label: "Expired", value: "expired"},
      ],
      filteredReservations: []
    }
  },
  props: {
    reservations: Array
  },
  mounted() {
    this.filter = this.filters[0].value;
  },
  watch: {
    filter: {
      immediate: true,
      handler(filter) {
        if(!filter) return;
        if(filter === "all") {
          this.filteredReservations = this.reservations;
        } else {
          this.filteredReservations = this.reservations.filter(reservation => reservation.status == filter)
        }
      }
    }
  }
}
</script>