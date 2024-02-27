<template>
  <v-data-table
      :headers="tableHeaders"
      :items="data"
      :search="search"
      v-on="$listeners"
      v-bind="$attrs"
  >

    <template v-slot:item.name="{ item }">
      <v-avatar size="40" class="mr-1">
        <img :alt="item.name"
             :src="item.image"
        >
      </v-avatar>
      {{ item.name }}
    </template>

    <template v-slot:item.contact="{ item }">
      <div class="py-2">
        <div>{{ item.phone }}</div>
        <div>{{ item.email }}</div>
      </div>
    </template>

    <template v-slot:item.status="{ item }">
      <v-chip :color="statusColor[item.status.toLowerCase()]" dark small outlined>
        {{ item.status }}
      </v-chip>
    </template>

    <template v-slot:item.timestamp.created_at="{ item }">
      {{ momentFromTimestamp(item.timestamp.created_at).format('MMM D, YYYY') }}
    </template>

    <template v-slot:item.actions="{ item }">
      <properties-table-admin-table-options :property="item" />
    </template>

  </v-data-table>
</template>
<script>

import PropertiesTableAdminTableOptions from "@/domain/Dashboard/Components/PropertyOptions";
import table from "@/mixins/table";
export default {
  name: "PropertiesTable",
  mixins: [table],
  components: {PropertiesTableAdminTableOptions},
  data(){
    return {
      headers: [
        { text: 'Name', align: 'left', value: 'name' },
        { text: 'Contact', align: 'left', value: 'contact', sortable: false },
        { text: 'Checkins', align: 'center', value: 'checkins' },
        { text: 'Pending Bookings', align: 'center', value: 'pending_bookings' },
        { text: 'Created', value: 'timestamp.created_at' },
        { text: 'Credit', align: 'center', value: 'checkin_points' },
        { text: 'Status', align: 'left', value: 'status', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      statusColor: {
        active: "success"
      }
    }
  },
  props: {
    search: String,
    properties: Array,
    columns: { type: Array, default: () => ["name","contact","checkins", "pending_bookings", "checkin_points","timestamp.created_at", "status", "actions"] },
  },
  methods: {
    getPropertyReservations(property) {
      return (this.$store.getters.dashboard?.reservations || []).filter(r => r.property_id === property.id);
    }
  },
  watch: {
    properties: {
      immediate: true,
      handler(properties) {
        this.data = (properties || []).map(property => {
          return {
            ...property,
            checkins: this.getPropertyReservations(property).filter(reservation => !["pending", "expired", "cancelled"].includes(reservation.status)).length,
            pending_bookings: this.getPropertyReservations(property).filter(reservation => reservation.status == 'pending').length
          }
        })
      }
    }
  }
}
</script>