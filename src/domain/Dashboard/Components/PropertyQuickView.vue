<template>
    <v-card v-if="property">
      <v-img
          :src="property.image"
          class="white--text align-end"
          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
          height="200px"
      >
        <v-card-title>
          <h4 class="text-h4">{{ property.name }}</h4>
          <v-btn
              icon
              :to="{ name: 'dashboard.property.show', params: { id: property.id } }"
              class="ml-auto white--text"
              title="Go to full details"
          >
            <v-icon>mdi-open-in-new</v-icon>
          </v-btn>
        </v-card-title>
      </v-img>
      <v-card-subtitle>
        <route-url :route="{ name: 'property.show', params: { property: property.id } }" target="_blank" />
      </v-card-subtitle>

      <v-tabs v-model="tab" icons-and-text>
        <v-tabs-slider></v-tabs-slider>
        <v-tab href="#info">
          Info
          <v-icon>mdi-information</v-icon>
        </v-tab>
        <v-tab href="#reservations">
          Reservations ({{ propertyReservations.length }})
          <v-icon>mdi-domain</v-icon>
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item value="info">
          <v-list height="500">
            <v-list-item v-for="(info, i) in listInfo" :key="i">
              <v-list-item-icon>
                <v-icon v-html="info.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-subtitle>{{ info.label }}</v-list-item-subtitle>
                {{ info.content }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-tab-item>
        <v-tab-item value="reservations">
          <v-virtual-scroll
              :items="propertyReservations"
              height="500"
              item-height="80"
          >
            <template #default="{ item: reservation }">
              <v-list-item :to="{name: 'dashboard.reservation.show', params: { id: reservation.id } }">
                <v-list-item-avatar>
                  <v-img :src="property.image"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-html="reservation.name"></v-list-item-title>
                  <v-list-item-subtitle>{{ reservation.checkin_date }} to {{ reservation.checkout_date }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-virtual-scroll>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
    <v-card v-else>
      <v-card-title> Property </v-card-title>
      <v-card-text>
        No property selected
      </v-card-text>
    </v-card>
</template>

<script>
import RouteUrl from "@/components/RouteUrl";

export default {
  name: "PropertyAdminQuickView",
  components: {RouteUrl },
  data() {
    return {
      tab: null
    }
  },
  props: {
    property: Object
  },
  computed: {
    listInfo() {
      if(!this.property) return [];
      return [
        {
          icon: "mdi-pound",
          label: "ID",
          content: this.$options.filters.nullable(this.property.id)
        },
        {
          icon: "mdi-map-marker",
          label: "Address",
          content: this.property.full_address
        },
        {
          icon: "mdi-phone",
          label: "Phone",
          content: this.property.phone
        },
        {
          icon: "mdi-email",
          label: "Email",
          content: this.property.email
        },
        {
          icon: "mdi-cog",
          label: "Integrations",
          content: this.property.integrations.length ? this.property.integrations.join(",") : 'None'
        },
        {
          icon: "mdi-cash-sync",
          label: "Subscription status",
          content: this.property.subscription?.status || 'N/A'
        },
      ]
    },
    propertyReservations() {
      return this.property && this.property.reservations ? this.property.reservations : [];
    }
  },
  methods: {

  },
  watch: {

  }
}

</script>