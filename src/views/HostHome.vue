<template>
  <app-layer  ref="app">
    <template #notice>
      <property-low-checkin-point-notice />
    </template>
    <template #header>
      <v-row justify="center">
        <v-col cols="12" md="10">
          <div class="d-flex flex-wrap">
            <h4 class="headline">Reservations</h4>
          </div>
        </v-col>
      </v-row>
    </template>
    <v-row justify="center">
      <v-col cols="12" md="10" class="py-0">
        <property-reservations  />
      </v-col>
    </v-row>
  </app-layer>
</template>

<script>
import { mapGetters } from 'vuex';
import AppLayer from '@/AppLayer.vue';
import PropertyReservations from "@/domain/Reservation/Widgets/PropertyReservations";
import PropertyLowCheckinPointNotice from "@/domain/Property/Components/LowCheckinPointNotice.vue";

export default {
  name: 'HostHome',
  components: {
    PropertyLowCheckinPointNotice,
    PropertyReservations,
    AppLayer
  },
  computed: {
    ...mapGetters([
      'current_user'
    ])
  }
}
</script>
