<template>
  <v-virtual-scroll
      :items="history"
      height="500"
      item-height="80"
      v-if="history.length"
  >
    <template #default="{ item: transaction, index }">
      <v-list-item>
        <v-list-item-avatar>
          <v-avatar :color="`${ transaction.points < 0 ?  '#FCECEC' : '#ECF8EF' }`">
            <v-icon v-if="transaction.points < 0" color="#FF5252">mdi-arrow-up</v-icon>
            <v-icon v-else color="#00B388">mdi-arrow-down</v-icon>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content >
          <div class="d-flex justify-space-between mb-2"
               :style="`color:${ transaction.points < 0 ?  '#FF5252' : '#00B388' }`"
          >
            <h4>{{ transaction.title }}</h4>
            <h4>{{ transaction.points }}</h4>
          </div>
          <v-list-item-subtitle>{{ transaction.description }}</v-list-item-subtitle>
          <v-list-item-subtitle>
            <small class="grey--text">
              {{ momentFromTimestamp(transaction.created_at).format("lll") }},
              {{ momentFromTimestamp(transaction.created_at).fromNow() }}
            </small>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider v-if="index < (history.length - 1)" inset></v-divider>
    </template>
  </v-virtual-scroll>
  <div v-else class="py-5 grey--text text-center">No history yet</div>
</template>

<script>
export default {
  name: "PropertyCheckinPointHistoryList",
  components: {},
  data() {
    return {}
  },
  props: {
    search: String,
    history: Array,
  },
  watch: {

  }
}
</script>