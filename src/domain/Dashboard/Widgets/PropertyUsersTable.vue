<template>
  <v-card>
    <v-card-title class="py-0">
    </v-card-title>
    <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        multi-sort
        v-on="$listeners"
    >
      <template v-slot:item.user.full_name="{ item }">
        <router-link
            v-if="item.user"
            :to="{name: 'dashboard.user.show', params: {id: item.user.id}}"
            class="text-decoration-none"
        >
          <v-avatar size="30" class="mr-1">
            <img :alt="item.user.name"
                 :src="item.user.image"
            >
          </v-avatar>
          {{ item.user.full_name }}
        </router-link>
        <span v-else>{{ item.email | nullable }}</span>
      </template>

      <template v-slot:item.phone="{ item }">
        {{ (item.user ? item.user.phone  : null) | nullable }}
      </template>

      <template v-slot:item.confirmed_at="{ item }">
        {{ (item.confirmed_at ? momentFromTimestamp(item.confirmed_at).format('YYYY-MM-DD') : null) | nullable }}
      </template>

    </v-data-table>
  </v-card>
</template>
<script>

import moment from 'moment';

export default {
  name: "PropertyUsersTable",
  components: {},
  data(){
    return {
      search: null,
      headers: [
        { text: 'Name', align: 'left', value: 'user.full_name' },
        { text: 'Role', align: 'left', value: 'role' },
        { text: 'Email', align: 'left', value: 'email' },
        { text: 'Phone', align: 'left', value: 'phone' },
        { text: 'Confirmed', value: 'confirmed_at' },
      ],
    }
  },
  props: {
    users: Array,
  },

  methods: {
    momentFromTimestamp(timestamp) {
      return moment.unix(timestamp);
    },

  },
}
</script>