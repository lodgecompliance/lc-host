<template>
  <dashboard class="white">
    <template #header>
      <div class="pb-5 pb-md-0">
        <h4 class="headline">Users</h4>
      </div>
    </template>
    <v-row justify="center">
      <v-col cols="12" md="11" lg="10">
        <users
            :users="users"
            :table="{'class': 'striped', 'show-select': true}"
            :card="{flat: true, 'class': 'mt-n8 mt-md-0 transparent'}"
        />
      </v-col>
    </v-row>
  </dashboard>
</template>

<script>
import Dashboard from "@/views/Dashboard";
import Users from "@/domain/Dashboard/Widgets/Users";
import {mapGetters} from "vuex";
import UserAdminQuickView from "@/domain/Dashboard/Components/UserQuickView";

export default {
  name: "DashboardUsers",
  components: {Users, Dashboard },
  data() {
    return {
      quickView: null
    }
  },
  computed: {
    ...mapGetters(['dashboard']),
    breadcrumbs() {
      return [
        {
          text: "Users",
          to: { name: 'dashboard.users' }
        }
      ]
    },
    users() {
      return this.dashboard?.users || [];
    }
  }
}

</script>
