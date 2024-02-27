<template>
  <v-card>
    <v-card-text>
      <v-row justify="space-between">
        <v-col cols="4">
          <h4 class="headline">Summary</h4>
        </v-col>
        <v-col cols="4" md="3">
          <period-filter v-model="filter" outlined dense />
<!--          <chart-type-select v-model="type" outlined dense />-->
        </v-col>
      </v-row>
      <chart
          id="dashboard-chart"
          :type="type"
          :labels="labels"
          :datasets="chartData"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
import Chart from "@/components/Chart";
import PeriodFilter from "@/components/PeriodFilter";
// import ChartTypeSelect from "@/components/ChartTypeSelect";
export default {
  name: "DashboardSummaryChart",
  components: {
    // ChartTypeSelect,
    PeriodFilter, Chart },
  data() {
    return {
      filter: null,
      type: "bar",
    }
  },
  computed: {
    ...mapGetters([ 'dashboard' ]),
    users(){
      return this.dashboard?.users || [];
    },
    properties() {
      return this.dashboard?.properties || [];
    },
    reservations() {
      return this.dashboard?.reservations || [];
    },
    periods() {
      return this.filter?.periods || []
    },

    labels() {
      return this.filter?.labels || []
    },

    dataInThePeriod() {
      const data = {
        properties: [],
        reservations: [],
        users: [],
      }
      this.periods.forEach(period => {
        data.users.push(this.users.filter(user => {
          const createdAtMoment = moment.unix(user.timestamp.created_at)
          return createdAtMoment.format(this.filter.comparisonFormat) === period
        }).length)

        data.properties.push(this.properties.filter(property => {
          const createdAtMoment = moment.unix(property.timestamp.created_at)
          return createdAtMoment.format(this.filter.comparisonFormat) === period
        }).length)

        data.reservations.push(this.reservations.filter(reservation => {
          const createdAtMoment = moment.unix(reservation.timestamp.created_at)
          return createdAtMoment.format(this.filter.comparisonFormat) === period
        }).length)

      })
      return data;
    },
    chartData() {
      return [
        {
          label: "Properties",
          data: this.dataInThePeriod.properties,
          backgroundColor: "#FB8C00",
          borderWidth: 2
        },
        {
          label: "Users",
          data: this.dataInThePeriod.users,
          backgroundColor: "#004D95",
          borderWidth: 2
        },
        {
          label: "Reservations",
          data: this.dataInThePeriod.reservations,
          backgroundColor: "#00B388",
          borderWidth: 2
        }
      ]
    }
  }
}
</script>

