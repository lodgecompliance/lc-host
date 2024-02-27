<template>
  <dashboard class="white">
    <template #header>
      <div class="pb-5 pb-md-0">
        <h4 class="headline">Reservations</h4>
      </div>
    </template>
    <v-row justify="center">
      <v-col cols="12" md="11" lg="10">
        <reservations
            :reservations="reservations"
            :table="{'class': 'striped', 'show-select': true}"
            :card="{flat: true, 'class': 'mt-n8 mt-md-0 transparent'}"
        />
      </v-col>
    </v-row>
  </dashboard>
</template>

<script>
import Dashboard from "@/views/Dashboard";
import Reservations from "@/domain/Dashboard/Widgets/Reservations";
import {mapGetters} from "vuex";

export default {
  name: "DashboardReservations",
  components: {Reservations, Dashboard },
  data() {
    return {
      quickView: null
    }
  },
  computed: {
    ...mapGetters(['dashboard']),
    breadcrumbs() {
      return [
        {
          text: "Reservations",
          to: { name: 'dashboard.reservations' }
        }
      ]
    },
    reservations() {
      return this.dashboard?.reservations || [];
    }
  }
}

</script>