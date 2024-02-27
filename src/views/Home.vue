<template>
  <host-home v-if="mode === 'host'" />
  <dashboard-home v-else-if="mode === 'admin'" />
</template>

<script>
import { mapGetters } from 'vuex';
import DashboardHome from "@/domain/Dashboard/Views/Home";
import HostHome from "@/views/HostHome";
export default {
  name: 'Home',
  components: {
    HostHome,
    DashboardHome,
  },
  computed: {
    ...mapGetters([
      'current_user',
      'mode'
    ])
  }
}
</script>
