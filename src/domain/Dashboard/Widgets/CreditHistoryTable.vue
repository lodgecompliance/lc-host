<template>
  <v-data-table
      :headers="tableHeaders"
      :items="history"
      :search="search"
      v-on="$listeners"
      v-bind="$attrs"
  >
    <template v-slot:item.created_at="{ item }">
      {{ momentFromTimestamp(item.created_at).format("lll") }}
    </template>
    <template v-slot:item.property.name="{ item }">
      <template v-if="item.property">
        <v-avatar size="40" class="mr-1">
          <img :alt="item.property.name"
               :src="item.property.image"
          >
        </v-avatar>
        <router-link
            :to="{name: 'dashboard.property.show', params: {id: item.property.id}}"
            class="text-decoration-none"
        >
          {{ item.property.name }}
        </router-link>
      </template>
      <span v-else> {{ null | nullable }} </span>
    </template>

    <template v-slot:item.status="{ item }">
      <v-chip :color="statusColor[item.status.toLowerCase()]" small dark outlined>
        {{ item.status }}
      </v-chip>
    </template>

    <template v-slot:item.purchased_by.full_name="{ item }">
      <template v-if="item.purchased_by">
        <v-avatar size="40" class="mr-1">
          <img :alt="item.purchased_by.full_name"
               :src="item.purchased_by.image"
          >
        </v-avatar>
        <router-link
             :to="{name: 'dashboard.user.show', params: {id: item.purchased_by.id}}"
            class="text-decoration-none">
          {{ item.purchased_by.full_name }}
        </router-link>
      </template>
      <span v-else>{{ null | nullable }}</span>
    </template>

    <template v-slot:item.property.checkin_points="{ item }">
      {{ (item.property ? item.property.checkin_points : null) | nullable }}
    </template>

  </v-data-table>
</template>
<script>
import table from "@/mixins/table";
export default {
  name: "CreditHistoryTable",
  mixins: [table],
  components: {},
  data(){
    return {
      headers: [
        { text: 'Date', align: 'left', value: 'created_at' },
        { text: 'Property', align: 'left', value: 'property.name' },
        { text: 'Payment Type', align: 'left', value: 'payment_type', sortable: false },
        { text: 'Name', value: 'purchased_by.full_name', sortable: false },
        { text: 'Credit Purchased', align: 'center', value: 'points' },
        { text: 'Available Credit', align: 'center', value: 'property.checkin_points' },
        { text: 'Last Purchased', align: 'center', value: 'property.credit_last_purchase' },
        { text: 'Status', align: 'left', value: 'status', sortable: false },
      ],
      statusColor: {
        success: "success"
      }
    }
  },
  props: {
    search: String,
    history: Array,
    columns: { type: Array, default: () => {
      return ["created_at", "property.name","payment_type","purchased_by.full_name","points", "property.checkin_points", "status"]
      }
    },
  },
  watch: {
    history: {
      immediate: true,
      handler(history) {
        this.data = history || []
      }
    }
  }
}
</script>