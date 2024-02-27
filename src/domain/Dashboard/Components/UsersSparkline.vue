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
  name: "UsersSparkLine",
  components: {SparkLine},
  data() {
    return { }
  },
  props: {
    users: Array
  },
  computed: {
    chartData() {
      return this.sortDataAsc(this.users.map(user => {
        return {
          timestamp: user.timestamp.created_at,
          date_created: moment.unix(user.timestamp.created_at).format("L")
        }
      }), "timestamp");
    }
  }
}
</script>

