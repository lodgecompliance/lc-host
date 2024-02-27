<template>
  <v-autocomplete
      :items="users"
      item-text="full_name"
      item-value="id"
      v-bind="$attrs"
      v-on="$listeners"
  >
    <template #selection="{ item: user, index, select, parent }">
      <v-chip v-if="parent.multiple" pill class="ma-1" close @click:close="parent.value.splice(index, 1)">
        <v-avatar left>
          <v-img :src="user.image"></v-img>
        </v-avatar>
        {{ user.full_name }}
      </v-chip>
      <template v-else>
        <v-avatar size="30">
          <v-img :src="user.image"></v-img>
        </v-avatar>
        <span class="ml-2">{{ user.full_name }}</span>
      </template>
    </template>
    <template #item="{ item: user, on }">
      <v-list-item v-on="on">
        <v-list-item-avatar>
          <v-img :src="user.image"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{user.full_name}}</v-list-item-title>
          <v-list-item-subtitle>{{ [user.email, user.phone ].filter(c => c && c.trim() !== "").join(", ") }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  name: "DashboardUserSelect",
  computed: {
    users() {
      return this.$store.getters.dashboard?.users || []
    }
  },
}

</script>