<template>
  <v-data-table
      :headers="tableHeaders"
      :items="users"
      :search="search"
      v-on="$listeners"
      v-bind="$attrs"
  >

    <template v-slot:item.id="{ item }">
      <router-link
          :to="{name: 'dashboard.user.show', params:{ id: item.id }}"
          class="text-decoration-none"
      >
        {{item.id}}
      </router-link>
    </template>

    <template v-slot:item.full_name="{ item }">
      <v-avatar size="20" class="mr-1">
        <img :alt="item.name"
             :src="item.image"
        >
      </v-avatar>
      {{ item.full_name }}
    </template>

    <template v-slot:item.contact="{ item }">
      {{ item.email | nullable }}
    </template>

    <template v-slot:item.role="{ item }">
      {{ (item.properties.length ? 'Host' : 'Guest') | nullable }}
    </template>

    <template v-slot:item.property="{ item }">
      {{ item.properties.length }}
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
      <users-table-admin-options :user="item" />
    </template>

    <template v-slot:item.roles="{ item }">
      {{ item.roles.map(role => $options.filters.ucfirst(role)).join(', ') | nullable }}
    </template>

  </v-data-table>
</template>
<script>

import UsersTableAdminOptions from "@/domain/Dashboard/Components/UsersOptions";
import table from "@/mixins/table";
export default {
  name: "UsersTable",
  mixins: [table],
  components: {UsersTableAdminOptions},
  data(){
    return {
      headers: [
        { text: 'Name', align: 'left', value: 'full_name' },
        { text: 'User ID', align: 'left', value: 'id', sortable: false },
        { text: 'Contact', align: 'left', value: 'contact' },
        { text: 'Date Created', value: 'timestamp.created_at' },
        { text: 'Role', value: 'roles', sortable: false },
        { text: 'Property', value: 'property', align: 'center', sortable: false },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      statusColor: {
        active: "success"
      }
    }
  },
  props: {
    search: String,
    users: Array,
    columns: { type: Array, default: () => ["full_name","id","contact","timestamp.created_at", "roles", "property", "status", "actions"] },
  },

  watch: {
    users: {
      immediate: true,
      handler(users) {
        this.data = users || []
      }
    }
  }

}
</script>
