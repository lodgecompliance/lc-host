<template>
  <v-card>
    <v-row justify="space-between" align="center" class="mx-2">
        <v-col cols="6">
          <h6 class="text-h6 headline mt-n5">{{ title }}</h6>
        </v-col>
        <v-col cols="6" md="4" lg="3">
          <period-filter v-model="filter" outlined dense />
        </v-col>
<!--        <v-col cols="4" md="3">-->
<!--          <chart-type-select v-model="type" />-->
<!--        </v-col>-->
      </v-row>
    <v-card-text>
      <chart
          id="reservations-chart"
          :type="type"
          :labels="labels"
          :datasets="chartData"
      />
    </v-card-text>
  </v-card>
</template>

<script>

import moment from "moment";
import Chart from "@/components/Chart";
import PeriodFilter from "@/components/PeriodFilter";
// import ChartTypeSelect from "@/components/ChartTypeSelect";
export default {
  name: "ReservationsChart",
  components: {
    // ChartTypeSelect,
    PeriodFilter, Chart },
  data() {
    return {
      filter: null,
      type: 'bar',
    }
  },
  props: {
    title: { type: String, default: () => "Reservations" },
    reservations: { type: Array, default: () => [] },
  },
  computed: {
    periods() {
      return this.filter?.periods || []
    },

    labels() {
      return this.filter?.labels || []
    },

    reservationsInThePeriod() {
      const data = {
        checkedin: [],
        notCheckedin: [],
      };
      this.periods.forEach(period => {
        const reservationsInPeriod = this.reservations.filter(reservation => {
          const createdAtMoment = moment.unix(reservation.timestamp.created_at)
          return createdAtMoment.format(this.filter.comparisonFormat) === period
        });
        data.checkedin.push(reservationsInPeriod.filter(reservation => reservation.checkedin).length);
        data.notCheckedin.push(reservationsInPeriod.filter(reservation => !reservation.checkedin).length);
      })
      return data;
    },
    chartData() {
      return [
        {
          label: "Checked in",
          data: this.reservationsInThePeriod.checkedin,
          backgroundColor: this.$vuetify.theme.currentTheme.primary,
          borderWidth:2
        },
        {
          label: "Not checked in",
          data: this.reservationsInThePeriod.notCheckedin,
          backgroundColor: this.$vuetify.theme.currentTheme.accent,
          borderWidth:2
        }
      ]
    }
  }
}
</script>

