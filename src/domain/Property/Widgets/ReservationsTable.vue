<template>
    <v-data-table
        :headers="headers"
        :items="reservations"
        :search="search"
        multi-sort
    >
        <template v-slot:item.id="{ item }">
          <router-link
              :to="{ name: 'property.reservation.show', params: { property: item.property_id, reservation: item.id, _reservation: item }}"
              class="text-decoration-none"
          >
            {{ item.id }}
          </router-link>
        </template>
        <template v-slot:item.status="{ item }">
            <reservation-status :reservation="item" />
        </template>

        <template v-slot:item.guests="{ item }">
          {{ item.guests.length }}
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <reservation-host-options
                :reservation="item"
                v-on="$listeners"
            />
            <reservation-host-actions
                :reservation="item"
                v-on="$listeners"
            />
          </div>
        </template>

        <template v-slot:item.timestamp.created_at="{ item }">
            {{ momentFromTimestamp(item.timestamp.created_at).format('YYYY-MM-DD hh:mm a') }}
        </template>
    </v-data-table>                
</template>
<script>

import moment from 'moment';
import ReservationStatus from '../../Reservation/Components/ReservationStatus.vue';
import ReservationHostActions from '../../Reservation/Components/ReservationHostActions';
import ReservationHostOptions from "@/domain/Reservation/Components/ReservationHostOptions";

export default {
    name: "PropertyReservationsTable",
    components: {
      ReservationHostOptions,
        ReservationStatus, ReservationHostActions
    },
    data(){
  
        return {
            headers: [
                { text: 'ID', align: 'start', value: 'id', sortable: false },
                { text: 'Booking Name', align: 'left', value: 'name' },
                { text: 'Guests', align: 'center', value: 'guests' },
                { text: 'Checkin Date', value: 'checkin_date' },
                { text: 'Checkout Date', value: 'checkout_date' },
                { text: 'Status', value: 'status', sortable: false },
                { text: 'Created', value: 'timestamp.created_at' },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
        }
    },
    props: {
        reservations: Array,
        search: String,
    },

    methods: {
        momentFromTimestamp(timestamp) {
            return moment.unix(timestamp);
        },

     },
}
</script>