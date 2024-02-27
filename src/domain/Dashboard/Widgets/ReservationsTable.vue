<template>
  <v-data-table
      :headers="tableHeaders"
      :items="reservations"
      :search="search"
      v-on="$listeners"
      v-bind="$attrs"
  >
    <template v-slot:item.id="{ item }">
      <router-link
          :to="{name: 'dashboard.reservation.show', params:{ id: item.id }}"
          class="text-decoration-none"
      >
        {{item.id}}
      </router-link>
    </template>

    <template v-slot:item.channel="{ item }">
      {{ (item.booking_channel ? item.booking_channel.name : null) | nullable }}
    </template>

    <template v-slot:item.guests="{ item }">
      {{ (item.guests ? item.guests.length : null) | nullable }}
    </template>

    <template v-slot:item.property="{ item }">
      <router-link
          v-if="item.property && item.property.id"
          :to="{name: 'dashboard.property.show', params:{id: item.property.id}}"
          class="text-decoration-none"
      >
        {{item.property.name}}
      </router-link>
      <span v-else>
      {{ (item.property ? item.property.name : null) | nullable }}
      </span>
    </template>

    <template v-slot:item.status="{ item }">
      <reservation-status :reservation="item" />
    </template>

    <template v-slot:item.timestamp.created_at="{ item }">
      {{ momentFromTimestamp(item.timestamp.created_at).format('MMM D, YYYY') }}
    </template>

    <template v-slot:item.checkin_date="{ item }">
      {{ momentFromDate(item.checkin_date).format('MMM D, YYYY') }}
    </template>

    <template v-slot:item.checkout_date="{ item }">
      {{ momentFromDate(item.checkout_date).format('MMM D, YYYY') }}
    </template>

    <template v-slot:item.actions="{ item }">
      <reservations-table-admin-options :reservation="item" />
    </template>

  </v-data-table>
</template>
<script>

import ReservationStatus from '@/domain/Reservation/Components/ReservationStatus.vue';
import ReservationsTableAdminOptions from "@/domain/Dashboard/Components/ReservationOptions";
import table from "@/mixins/table";

export default {
  name: "ReservationsTable",
  mixins: [table],
  components: {
    ReservationsTableAdminOptions,
    ReservationStatus,
  },
  data(){
    return {
      headers: [
        { text: 'ID', align: 'start', value: 'id', sortable: false },
        { text: 'User Account', align: 'left', value: 'name' },
        { text: 'Guests', align: 'center', value: 'guests' },
        { text: 'Date Created', value: 'timestamp.created_at' },
        { text: 'Checkin Date', value: 'checkin_date' },
        { text: 'Property', value: 'property' },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false },
      ]
    }
  },
  props: {
    search: String,
    reservations: Array,
    columns: { type: Array, default: () => ["id","name","guests","checkin_date","property","timestamp.created_at","status", "actions"] },
  },
  watch: {
    reservations: {
      immediate: true,
      handler(reservations) {
        this.data = reservations || []
      }
    }
  }
}
</script>