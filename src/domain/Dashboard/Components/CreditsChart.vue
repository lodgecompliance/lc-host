<template>
  <v-card>
    <v-row justify="space-between" align="center" class="mx-2">
      <v-col cols="6">
        <h6 class="text-h6 headline mt-n5">{{ title }}</h6>
      </v-col>
      <v-col cols="6" md="4" lg="3">
        <period-filter v-model="filter" outlined dense />
      </v-col>
    </v-row>
    <v-card-text>
      <chart
          id="payments-chart"
          :type="type"
          :labels="labels"
          :datasets="chartData"
      />
    </v-card-text>
  </v-card>
</template>

<script>

import Chart from "@/components/Chart";
import PeriodFilter from "@/components/PeriodFilter";
import moment from "moment";
export default {
  name: "CreditsChart",
  components: { PeriodFilter, Chart },
  data() {
    return {
      filter: null,
      type: 'bar',
    }
  },
  props: {
    title: { type: String, default: () => "Credit" },
    credits: { type: Array, default: () => [] },
  },
  computed: {
    periods() {
      return this.filter?.periods || []
    },

    labels() {
      return this.filter?.labels || []
    },

    creditsInThePeriod() {
      const data = {
        usedCredit: [],
        purchasedCredit: [],
      };
      this.periods.forEach(period => {
        const creditsInThePeriod = this.credits.filter(credit => {
          const createdAtMoment = this.momentFromTimestamp(credit.created_at);
          return createdAtMoment.format(this.filter.comparisonFormat) === period
        });
        data.usedCredit.push(this.sumArray(creditsInThePeriod
            .filter(credit => credit.type === 'checkin')
            .map(credit => Math.abs(credit.points))
        ));
        data.purchasedCredit.push(this.sumArray(creditsInThePeriod
            .filter(credit => credit.type === 'purchase')
            .map(credit => Math.abs(credit.points))
        ));
      })
      return data;
    },
    chartData() {
      return [
        {
          label: "Credit Used",
          data: this.creditsInThePeriod.usedCredit,
          backgroundColor: this.$vuetify.theme.currentTheme.accent,
          borderWidth:2
        },
        {
          label: "Credit Purchased",
          data: this.creditsInThePeriod.purchasedCredit,
          backgroundColor: this.$vuetify.theme.currentTheme.primary,
          borderWidth:2
        }
      ]
    }
  }
}
</script>

