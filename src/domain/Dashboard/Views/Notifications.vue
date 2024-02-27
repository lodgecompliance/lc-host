<template>
  <dashboard class="white">
    <template #header>
      <div class="pb-5 pb-md-0">
        <h4 class="headline">Notifications</h4>
      </div>
    </template>
    <v-row justify="start">
      <v-col cols="12" md="10" lg="8">
        <v-card flat class="mt-n8 mt-md-0 transparent">
          <v-row class="py-0" justify="space-between">
              <v-col cols="12" md="6"  class="py-0">
                <v-row>
                  <v-col cols="7" class="py-0">
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
                  <v-col cols="5" class="py-0">
                    <period-filter v-model="period" default-filter="Today" outlined dense class="white" />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="6" class="py-0">
                <v-row justify="end">
                  <v-col cols="12" md="8" class="py-0">
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
                  <v-col cols="12" md="4" class="py-0 mt-n5 mt-md-0 text-right d-none d-md-block" >
                    <create-notification
                    :activator="{elevation: 0, color: 'primary', 'class': 'mx-1', small: !$vuetify.breakpoint.mdAndUp}"
                    >
                      <v-icon small>mdi-plus</v-icon> Create New
                    </create-notification>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          <v-card-text>
            <data-container :loading="loading">
              <v-list v-if="notifications.length">
                <template v-for="(notification, index) in notifications">
                  <v-list-item :key="`notification-${index}`" three-line>
                    <v-list-item-avatar>
                      <v-img :src="notification.receiver.image"></v-img>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{ notification.title }}</v-list-item-title>
                      <v-list-item-subtitle>{{ notification.description }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <dashboard-notification-options :notification="notification" />
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider v-if="index < (notifications.length - 1)" :key="`notification-${index}-divider`"></v-divider>
                </template>
              </v-list>
              <div class="py-5 text-center">
                <h4 class="grey--text headline">No notification available</h4>
              </div>
            </data-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </dashboard>
</template>
<script>
import Dashboard from "@/views/Dashboard";
import PeriodFilter from "@/components/PeriodFilter";
import DashboardNotificationOptions from "@/domain/Dashboard/Components/NotificationOptions";
import DataContainer from "@/components/DataContainer";
import CreateNotification from "@/domain/Dashboard/Widgets/CreateNotification";
export default {
  name: "DashboardNotifications",
  components: {CreateNotification, DataContainer, DashboardNotificationOptions, PeriodFilter, Dashboard },
  data() {
    return {
      loading: false,
      search: null,
      filter: null,
      period: null,
      filters: [
        {label: "All Notifications", value: "all"},
        {label: "Received Notifications", value: "received"},
        {label: "Sent Notifications", value: "sent"},
      ],
      notifications: []
    }
  },
  computed: {},
  methods: {
    getNotifications() {

    }
  },
  mounted() {
    this.filter = this.filters[0].value;
  },
  watch: {
    filter: {
      immediate: true,
      handler()  {
        this.getNotifications()
      }
    },
    period: {
      immediate: true,
      handler()  {
        this.getNotifications()
      }
    }
  }
}
</script>