<template>
  <v-card v-bind="$attrs">
    <v-row justify="space-between" align="center" class="mx-2">
      <v-col cols="6" md="6">
        <h6 class="text-h6 headline">{{ title }}</h6>
      </v-col>
      <v-col cols="6" md="4" lg="3">
        <period-filter v-model="filter" outlined dense />
      </v-col>
    </v-row>
    <v-card-text>
      <chart
          id="users-monthly-chart"
          type="bar"
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
export default {
  name: "UsersChart",
  components: {PeriodFilter, Chart },
  data() {
    return {
      filter: null,
    }
  },
  props: {
    title: { type: String, default: () => "Users" },
    users: { type: Array, default: () => [] },
  },
  computed: {

    periods() {
      return this.filter?.periods || []
    },

    labels() {
      return this.filter?.labels || []
    },

    usersInThePeriod() {
      const users = [];
      this.periods.forEach(period => {
        users.push(this.users.filter(user => {
          const createdAtMoment = moment.unix(user.timestamp.created_at)
          return createdAtMoment.format(this.filter.comparisonFormat) === period
        }).length)
      })
      return users;
    },
    chartData() {
      return [
        {
          label: "Users",
          data: this.usersInThePeriod,
          backgroundColor: this.$vuetify.theme.currentTheme.primary,
          borderWidth:1
        }
      ]
    }
  }
}
</script>

