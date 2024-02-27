<template>
  <dashboard>
    <template #header>
      <h4 class="text--primary headline">Dashboard</h4>
    </template>
    <v-row justify="center">
      <v-col cols="12" md="8">

        <div class="d-flex justify-left justify-md-space-around align-center overflow-x-auto">
          <v-card
              min-width="250px"
              :to="{ name: 'dashboard.properties' }"
              outlined >
            <v-card-text class="d-flex align-center">
              <v-sheet color="#FFF3E5"
                       class="pa-2 rounded-lg d-flex align-content-center justify-center"
                       style="border: 2px solid #FB8C00"
              >
                <img
                    src="@/assets/img/properties.png"
                    height="40px"
                    width="40px"
                />
              </v-sheet>
              <div class="ml-2">
                <h1>{{ properties.length }}</h1>
                <div class="mt-2">Total Properties</div>
              </div>
            </v-card-text>
          </v-card>
            <v-card
                min-width="250px"
                class="mx-2"
                :to="{ name: 'dashboard.users' }"
                outlined>
              <v-card-text class="d-flex align-center">
                <v-sheet color="#E6F2F8"
                         class="pa-2 rounded-lg d-flex align-content-center justify-center"
                         style="border: 2px solid #004D95"
                >
                  <img
                      src="@/assets/img/users.png"
                      height="40px"
                      width="40px"
                  />
                </v-sheet>
                <div class="ml-2" >
                  <h1>{{ users.length }}</h1>
                  <div class="mt-2">Total Users</div>
                </div>
              </v-card-text>
            </v-card>
            <v-card
                min-width="250px"
                class="mx-2"
                :to="{ name: 'dashboard.reservations' }"
                outlined>
              <v-card-text class="d-flex align-center">
                <v-sheet color="#E5F7F3"
                         class="pa-2 rounded-lg d-flex align-content-center justify-center"
                         style="border: 2px solid #00B388"
                >
                  <img
                      src="@/assets/img/reservations.png"
                      height="40px"
                      width="40px"
                  />
                </v-sheet>
                <div class="ml-2">
                  <h1>{{ reservations.length }}</h1>
                  <div class="mt-2">Reservations</div>
                </div>
              </v-card-text>
            </v-card>
        </div>
        <dashboard-summary-chart
          class="my-3"
          elevation="3"
        />
        <v-card elevation="3" rounded>
          <v-card-title class="d-flex justify-space-between" >
            <h6 class="text-h6 headline">New Reservations </h6>
            <router-link :to="{ name: 'dashboard.reservations' }" class="text-decoration-none" style="font-size: 14px">
              See all
            </router-link>
          </v-card-title>
          <v-sheet color="rgba(0, 0, 0, .12)">
            <reservations-table
                :reservations="newestReservations"
                :columns="['id','name','guests','checkin_date','status','timestamp.created_at']"
                :hide-default-footer="true"
                class="striped"
            />
          </v-sheet>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card elevation="3" rounded>
          <v-card-title class="d-flex justify-space-between" >
            <h6 class="text-h6 headline"> Newest User </h6>
            <v-btn icon :to="{ name: 'dashboard.users' }" color="primary">
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
          </v-card-title>
          <v-virtual-scroll
              :items="newestUser"
              height="300"
              item-height="60"
          >
            <template #default="{ item: user, index }">
              <v-list-item :to="{name: 'dashboard.user.show', params: { id: user.id } }">
                <v-list-item-content>
                  <v-list-item-subtitle class="text-right">
                    <small>{{ momentFromTimestamp(user.timestamp.created_at).fromNow() }}</small>
                  </v-list-item-subtitle>
                  <v-list-item-title
                      v-html="[user.first_name, user.last_name].join(' ')"
                      class="mt-n5"
                  ></v-list-item-title>
                  <v-list-item-subtitle>{{ user.email | nullable }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider v-if="index < (newestUser.length - 1)"></v-divider>
            </template>
          </v-virtual-scroll>
        </v-card>
        <v-card elevation="3" rounded class="mt-5">
          <v-card-title class="d-flex justify-space-between" >
            <h6 class="text-h6 headline"> Top Properties </h6>
            <v-btn icon :to="{ name: 'dashboard.properties' }" color="primary">
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
          </v-card-title>
          <v-virtual-scroll
              :items="topProperties"
              height="500"
              item-height="60"
          >
            <template #default="{ item: property, index }">
              <v-list-item>
                <v-list-item-avatar>
                  <v-img :src="property.image"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-html="property.name"></v-list-item-title>
                  <v-list-item-subtitle><small>#{{ property.id }}</small></v-list-item-subtitle>
<!--                  <v-list-item-subtitle v-html="property.full_address"></v-list-item-subtitle>-->
<!--                  <v-list-item-subtitle><v-icon small>mdi-key-chain</v-icon> {{ property.reservations.length }} reservations</v-list-item-subtitle>-->
                </v-list-item-content>
                <v-list-item-action>
                  <property-admin-options :property="property" />
                </v-list-item-action>
              </v-list-item>
              <v-divider v-if="index < (topProperties.length - 1)"></v-divider>
            </template>
          </v-virtual-scroll>
        </v-card>
      </v-col>
    </v-row>
  </dashboard>
</template>

<script>
import { mapGetters } from 'vuex';
import Dashboard from "@/views/Dashboard";
import ReservationsTable from "@/domain/Dashboard/Widgets/ReservationsTable";
import PropertyAdminOptions from "@/domain/Dashboard/Components/PropertyOptions";
import DashboardSummaryChart from "@/domain/Dashboard/Components/DashboardSummaryChart";

export default {
  name: 'DashboardHome',
  components: {DashboardSummaryChart, PropertyAdminOptions, Dashboard, ReservationsTable},
  data(){
    return { }
  },
  computed: {
    ...mapGetters([ 'dashboard' ]),
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
    newestReservations() {
      return this.reservations.slice(0, 10)
    },
    newestUser() {
      return this.users.slice(0,10);
    },
    topProperties() {
      return this.sortDataDesc(this.properties.map(property => {
        property.total_reservations = property.reservations ? property.reservations.length : 0;
        return property;
      }), "total_reservations").slice(0,10);
    },
  },
}
</script>
