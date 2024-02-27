<template>
  <div>
    <reservation-status-filter
        v-model="reservationStatusFilter"
        :chip="{small: true}"
        display="tile"
    />
    <v-data-table
        :headers="headers"
        :items="filteredHistory"
        :search="search"
        v-on="$listeners"
        v-bind="$attrs"
        height="410"
    >
      <template v-slot:item.booking.name="{ item }">
        <div v-if="item.reservation" class="d-flex align-center">
          <v-avatar color="primary" size="30">
            <span class="white--text">{{ item.reservation.name.substring(0,1) }}</span>
          </v-avatar>
          <div class="ml-2">{{ item.reservation.name }}</div>
        </div>
        <span v-else>{{ null | nullable }}</span>
      </template>
      <template v-slot:item.checkin="{ item }">
        {{( item.reservation ? item.reservation.checkin_date : null) | nullable }}
      </template>
      <template v-slot:item.points="{ item }">
        {{Math.abs(item.points) | nullable }}
      </template>
      <template v-slot:item.options="{ item }">
        <div v-if="item.reservation" class="d-flex">
          <v-btn color="primary" icon :to="{name: 'property.reservation.show', params: { property: item.reservation.property_id, reservation: item.reservation.id }, query: { edit: 1 }}">
            <v-icon small>mdi-pen</v-icon>
          </v-btn>
          <v-btn color="primary" icon :to="{name: 'property.reservation.show', params: { property: item.reservation.property_id, reservation: item.reservation.id }}">
            <v-icon small>mdi-eye</v-icon>
          </v-btn>
<!--          <reservation-host-options-->
<!--              :activator="{-->
<!--                      color: 'primary'-->
<!--                    }"-->
<!--              :activator-icon="{-->
<!--                      small: true,-->
<!--                    }"-->
<!--              :reservation="item.reservation" />-->
        </div>
      </template>
      <template v-slot:item.status="{ item }">
        <reservation-status v-if="item.reservation" :reservation="item.reservation" />
        <span v-else>{{ null | nullable }}</span>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import ReservationStatusFilter from "@/domain/Reservation/Components/ReservationStatusFilter";
import ReservationStatus from "@/domain/Reservation/Components/ReservationStatus";
// import ReservationHostOptions from "@/domain/Reservation/Components/ReservationHostOptions";

export default {
  name: "PropertyCheckinPointHistoryForCheckin",
  components: {
    ReservationStatusFilter, ReservationStatus,
    // ReservationHostOptions
  },
  data() {
    return {
      loading: false,
      headers: [
        { text: 'Booking Name', align: 'start', value: 'booking.name', sortable: false },
        { text: 'Check in', align: 'left', value: 'checkin' },
        { text: 'Check-in point', align: 'center', value: 'points' },
        { text: 'Options', value: 'options', sortable: false  },
        { text: 'Status', value: 'status', sortable: false  },
      ],
      reservationStatusFilter: [],
    }
  },
  props: {
    history: Array,
    search: String,
  },
  computed: {
    filteredHistory() {
      return this.history.
      filter(h => h.reservation && this.reservationStatusFilter.length ? this.reservationStatusFilter.includes(h.reservation.status) : true);
    }
  },
}
</script>