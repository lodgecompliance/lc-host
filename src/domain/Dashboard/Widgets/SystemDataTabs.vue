<template>
  <v-card>
    <v-tabs
        v-model="tab"
        icons-and-text
    >
      <v-tabs-slider></v-tabs-slider>

      <v-tab href="#properties">
        Properties
        <v-icon>mdi-domain</v-icon>
      </v-tab>

      <v-tab href="#reservations">
        Reservations
        <v-icon>mdi-key-chain</v-icon>
      </v-tab>

      <v-tab href="#users">
        Users
        <v-icon>mdi-account</v-icon>
      </v-tab>
      <v-tab href="#config">
        Config
        <v-icon>mdi-cog</v-icon>
      </v-tab>
    </v-tabs>
    <v-text-field
        v-if="tab != 'config'"
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        dense
        class="mx-3 mt-6"
    ></v-text-field>
    <v-tabs-items v-model="tab">

      <v-tab-item value="properties">
        <properties-table
            dense
            min-height="500"
            :properties="properties"
            :search="search"
        />
      </v-tab-item>

      <v-tab-item value="reservations">
        <reservations-table
            dense
            min-height="500"
            :reservations="reservations"
            :search="search"
        />
      </v-tab-item>

      <v-tab-item value="users">
        <users-table
            dense
            min-height="500"
            :users="users"
            :search="search"
        />
      </v-tab-item>

      <v-tab-item value="config">
        <system-config
            min-height="500"
            :config="systemConfig"
        />
      </v-tab-item>

    </v-tabs-items>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import UsersTable from "@/domain/Dashboard/Widgets/UsersTable";
import ReservationsTable from "@/domain/Dashboard/Widgets/ReservationsTable";
import PropertiesTable from "@/domain/Dashboard/Widgets/PropertiesTable";
import SystemConfig from "@/domain/Dashboard/Widgets/SystemConfig";
import moment from "moment";

export default {
  name: 'SystemDataTabs',
  components: { SystemConfig, UsersTable, ReservationsTable, PropertiesTable },
  data(){
    return {
      tab: null,
      search: null,
      loading: false,
    }
  },
  props: {
    activateTab: String,
  },
  computed: {
    ...mapGetters([ 'dashboard']),
    users(){
      return this.dashboard?.users || [];
    },
    properties() {
      return this.dashboard?.properties || [];
    },
    reservations() {
      return this.dashboard?.reservations || [];
    },
    systemConfig() {
      return this.dashboard?.system
    },
  },
  methods: {
    ...mapActions(['getDashboardData']),
    navigateToRoute(route) {
      this.$router.push(route).catch(e => {
        if(e.name == 'NavigationDuplicated') {
          //already in the route
        }
      })
    },
    momentFromTimestamp(timestamp) {
      return moment.unix(timestamp);
    },
  },
  watch: {
    activateTab: {
      immediate: true,
      handler(tab) {
        if(tab) this.tab = tab
      }
    }
  }
}
</script>
