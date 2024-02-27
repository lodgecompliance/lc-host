<template>
    <v-card v-if="user">
      <v-card-title class="align-content-center">
        <v-avatar size="60">
          <img :alt="name"
              :src="user.image"
          >
        </v-avatar>
        <p class="ml-3"> {{ name }} </p>
        <v-btn
            icon
            :to="{ name: 'dashboard.user.show', params: { id: user.id } }"
            class="ml-auto"
            title="Go to full details"
        >
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
      </v-card-title>
      <v-tabs v-model="tab" icons-and-text>
        <v-tabs-slider></v-tabs-slider>
        <v-tab href="#info">
          Info
          <v-icon>mdi-information</v-icon>
        </v-tab>
        <v-tab href="#properties">
          Properties ({{ userProperties.length }})
          <v-icon>mdi-domain</v-icon>
        </v-tab>
        <v-tab href="#reservations">
          Reservations ({{ userReservations.length }})
          <v-icon>mdi-clock</v-icon>
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
        <v-tab-item value="properties">
          <v-virtual-scroll
              :items="userProperties"
              height="500"
              item-height="80"
          >
            <template #default="{ item: property }">
              <v-list-item :to="{name: 'dashboard.property.show', params: { id: property.id } }">
                <v-list-item-avatar>
                  <v-img :src="property.image"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-html="property.name"></v-list-item-title>
                  <v-list-item-subtitle v-html="property.address"></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-virtual-scroll>
        </v-tab-item>
        <v-tab-item value="reservations">
          <v-virtual-scroll
              :items="userReservations"
              height="500"
              item-height="80"
          >
            <template #default="{ item: reservation }">
              <v-list-item :to="{name: 'dashboard.reservation.show', params: { id: reservation.id } }">
              <v-list-item-avatar>
                <v-img :src="reservation.property_image"></v-img>
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
      <v-card-title> User </v-card-title>
      <v-card-text>
        No user selected
      </v-card-text>
    </v-card>
</template>

<script>
export default {
  name: "UserAdminQuickView",
  components: { },
  data() {
    return {
      tab: null
    }
  },
  props: {
    user: Object
  },
  computed: {
    name() {
      return this.user
          ? [this.user.first_name, this.name.last_name ].join(" ")
          : ""
    },
    listInfo() {
      if(!this.user) return [];
      return [
        {
          icon: "mdi-pound",
          label: "ID",
          content: this.$options.filters.nullable(this.user.id)
        },
        {
          icon: "mdi-phone",
          label: "Phone",
          content: this.$options.filters.nullable(this.user.phone)
        },
        {
          icon: "mdi-email",
          label: "Email",
          content: this.$options.filters.nullable(this.user.email)
        }
      ]
    },
    userProperties() {
      return this.user && this.user.properties ? this.user.properties : []
    },
    userReservations() {
      return this.user && this.user.reservations ? this.user.reservations : []
    },
  },
  methods: {

  },
  watch: {

  }
}

</script>