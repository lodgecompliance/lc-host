<template>
  <spark-line
    v-bind="$attrs"
    :data="chartData"
    :radius="5"
    :fill="false"
    group-by="date_created"
    color="white"
  />
</template>

<script>
import moment from "moment";
import SparkLine from "@/components/SparkLine";
export default {
  name: "PropertiesSparkLine",
  components: {SparkLine},
  data() {
    return { }
  },
  props: {
    properties: Array
  },
  computed: {
    chartData() {
      return this.sortDataAsc(this.properties.map(property => {
        return {
          timestamp: property.timestamp.created_at,
          date_created: moment.unix(property.timestamp.created_at).format("L")
        }
      }), "timestamp");
    }
  }
}
</script>

