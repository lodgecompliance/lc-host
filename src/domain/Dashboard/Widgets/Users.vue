<template>
  <v-card v-bind="$attrs.card">
    <v-row class="py-0" justify="space-between">
        <v-col cols="4" md="3" lg="2" class="py-0">
          <v-select
              v-model="filter"
              :items="filters"
              item-text="label"
              item-value="value"
              outlined
              dense
              class="white"
          >
          </v-select>
        </v-col>
        <v-col cols="8" md="6" lg="4" class="py-0">
          <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search"
              dense
              outlined
              class="white"
          >
            <template #append>
              <v-btn text small color="primary">
                <v-icon>mdi-filter-outline</v-icon>
                <span class="d-none d-md-inline">Filter</span>
              </v-btn>
            </template>
          </v-text-field>
        </v-col>
      </v-row>
    <users-table
        :users="filteredUsers"
        :search="search"
        v-bind="$attrs.table"
        v-on="$listeners"
    />
  </v-card>
</template>
<script>
import UsersTable from "./UsersTable";
export default {
  name: "Users",
  components: {UsersTable},
  data() {
    return {
      search: null,
      filter: null,
      filters: [
        {label: "All Users", value: "all"},
        {label: "Active", value: "active"},
        {label: "Inactive", value: "inactive"},
        {label: "Incomplete", value: "incomplete"}
      ],
      filteredUsers: []
    }
  },
  props: {
    users: Array
  },
  mounted() {
    this.filter = this.filters[0].value;
  },
  watch: {
    filter: {
      immediate: true,
      handler(filter) {
        if(!filter) return;
        if(filter === "all") {
          this.filteredUsers = this.users;
        } else {
          this.filteredUsers = this.users.filter(user => user.status.toLowerCase() == filter.toLowerCase())
        }
      }
    }
  }
}
</script>

<style lang="sass">

</style>