<template>
  <spark-line
    v-bind="$attrs"
    :data="chartData"
    :radius="5"
    :fill="false"
    group-by="date_created"
  />
</template>

<script>

import moment from "moment";
import SparkLine from "@/components/SparkLine";
export default {
  name: "ReservationsSparkLine",
  components: {SparkLine},
  data() {
    return { }
  },
  props: {
    reservations: Array
  },
  computed: {
    chartData() {
      return this.sortDataAsc(this.reservations.map(reservation => {
        return {
          timestamp: reservation.timestamp.created_at,
          date_created: moment.unix(reservation.timestamp.created_at).format("L")
        }
      }), "timestamp");
    }
  }
}
</script>

