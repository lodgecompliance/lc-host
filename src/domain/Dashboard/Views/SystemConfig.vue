<template>
  <dashboard>
    <template #header>
      <h4 class="headline">System Config</h4>
    </template>
    <v-row justify="center">
      <v-col md="6">
        <template v-if="current_user.profile.auth.admin && current_user.profile.auth.admin.level === 1">
          <system-config :config="dashboard ? dashboard.system : {}" />
        </template>
        <template v-else>
          <div class="text-center grey--text">
            <h4>Oops!</h4>
            <p>You don't have access to this resource</p>
          </div>
        </template>
      </v-col>
    </v-row>
  </dashboard>
</template>
<script>
import {mapGetters} from "vuex";
import Dashboard from "@/views/Dashboard";
import SystemConfig from "@/domain/Dashboard/Widgets/SystemConfig";
export default {
  name: "SystemConfiguration",
  components: { SystemConfig, Dashboard },
  computed: {
    ...mapGetters(['dashboard', 'current_user']),
    breadcrumbs() {
      return [
        {
          text: "System Config",
          to: this.$route
        }
      ]
    }
  }
}
</script>