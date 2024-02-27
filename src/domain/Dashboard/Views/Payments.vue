<template>
  <dashboard>
    <template #header>
      <div class="d-flex justify-space-between">
        <h4 class="headline">Payments</h4>
        <v-btn icon @click="getHistory" class="ml-2" title="Refresh"> <v-icon>mdi-refresh</v-icon> </v-btn>
      </div>
    </template>
    <data-container :loading="loading">
      <v-row justify="center">
        <v-col cols="12" md="7">
          <credits-chart
              title="Credit Statistics"
              :credits="(dashboard && dashboard.checkin_points_history) || []"
          />
        </v-col>
        <v-col cols="12" md="3">
          <add-property-credit
              :activator="{block: true, color: 'primary', elevation: 0 }"
          >
            <v-icon small>mdi-plus</v-icon> Send Credit
          </add-property-credit>
          <v-card outlined rounded class="mt-2">
            <v-card-title class="d-flex justify-space-between" >
              <h6 class="text-h6 headline"> Highest Credit Scores </h6>
            </v-card-title>
            <v-virtual-scroll
                v-if="topCheckinPoints.length"
              :items="topCheckinPoints"
              height="300"
              item-height="60"
          >
            <template #default="{ item: property, index }">
              <v-list-item :to="{name: 'dashboard.property.show', params: {id: property.id}}">
                <v-list-item-avatar>
                  <v-img :src="property.image"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-html="property.name"></v-list-item-title>
                  <v-list-item-subtitle><small>#{{ property.id }}</small></v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  {{ property.checkin_points }}
                </v-list-item-action>
              </v-list-item>
              <v-divider v-if="index < (topCheckinPoints.length - 1)"></v-divider>
            </template>
          </v-virtual-scroll>
            <v-card-text v-else class="py-5 text-center">
              <p class="grey--text">No credit</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="10">
          <credit-history :history="checkinPointPurchaseHistory" />
        </v-col>
      </v-row>
    </data-container>
  </dashboard>
</template>
<script>
import Dashboard from "@/views/Dashboard";
import CreditsChart from "@/domain/Dashboard/Components/CreditsChart";
import AddPropertyCredit from "@/domain/Dashboard/Widgets/AddPropertyCredit";
import DataContainer from "@/components/DataContainer";
import CreditHistory from "@/domain/Dashboard/Widgets/CreditHistory";
import gql from "graphql-tag";
import {mapActions, mapGetters, mapMutations} from "vuex";
export default {
  name: "DashboardPayments",
  components: {CreditHistory, DataContainer, AddPropertyCredit, CreditsChart, Dashboard },
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    ...mapGetters(['dashboard']),
    checkinPointPurchaseHistory() {
      return (this.dashboard?.checkin_points_history || []).filter(history => history.type === 'purchase')
    },
    topCheckinPoints() {
      return this.dashboard?.top_checkin_points || []
    }
  },
  methods: {
    ...mapActions(['query']),
    ...mapMutations(['SET_DASHBOARD_DATA']),
    getHistory() {
      this.error = null;
      this.loading = true;
      this.query({
        query: gql `
          query getSystemData {
            getSystemData{
              checkin_points_history {
                points
                opening_balance
                closing_balance
                status
                type
                payment_type
                created_at
                purchased_by {
                  id
                  full_name
                  image
                }
                property {
                  id
                  name
                  image
                  checkin_points
                }
              }
              top_checkin_points {
                id
                name
                image
                checkin_points
              }
            }
          }
 `
      })
      .then(response => {
        this.SET_DASHBOARD_DATA({
          ...this.dashboard,
          top_checkin_points: response.data.getSystemData?.top_checkin_points,
          checkin_points_history: response.data.getSystemData?.checkin_points_history
        })
      })
      .catch(e => {
        this.error = e;
      })
      .finally(() => {
        this.loading = false
      })
    }
  },
  mounted() {
    if(this.dashboard?.top_checkin_points && this.dashboard?.checkin_points_history) {
      return;
    }
    this.getHistory();
  }
}
</script>