<template>
    <v-card v-if="reservation">
      <v-img
          :src="reservation.property.image"
          class="white--text align-end"
          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
          height="200px"
      >
        <v-card-title>
          <h4 class="text-h4">{{reservation.name}}</h4>
          <v-btn
              icon
              :to="{ name: 'dashboard.reservation.show', params: { id: reservation.id } }"
              class="ml-auto white--text"
              title="Go to full details"
          >
            <v-icon>mdi-open-in-new</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle class="white--text" v-text="reservation.property.name"></v-card-subtitle>
      </v-img>
      <v-card-subtitle>
        <route-url :route="{ name: 'reservation.show', params: { id: reservation.id } }" target="_blank" />
      </v-card-subtitle>
      <v-card-text>
        <reservation-status :reservation="reservation" />
        <v-list>
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
      </v-card-text>
<!--      <v-card-actions>-->
<!--        <v-spacer></v-spacer>-->
<!--        <v-btn-->
<!--        :to="{name: 'dashboard.reservation.show', params:{ id: reservation.id }}"-->
<!--        color="primary"-->
<!--        text-->
<!--        >See more about reservation <v-icon>mdi-arrow-right</v-icon></v-btn>-->
<!--      </v-card-actions>-->
    </v-card>
    <v-card v-else>
      <v-card-title> Reservation </v-card-title>
      <v-card-text>
        No reservation selected
      </v-card-text>
    </v-card>
</template>

<script>
import ReservationStatus from "@/domain/Reservation/Components/ReservationStatus";
import RouteUrl from "@/components/RouteUrl";

export default {
  name: "ReservationAdminQuickView",
  components: { ReservationStatus, RouteUrl },
  data() {
    return {
      tab: null
    }
  },
  props: {
    reservation: Object,
  },
  computed: {
    listInfo() {
      if(!this.reservation) return [];
      return [
        {
          icon: "mdi-pound",
          label: "ID",
          content: this.$options.filters.nullable(this.reservation.id)
        },
        {
          icon: "mdi-account",
          label: "Booking Name",
          content: this.reservation.name
        },
        {
          icon: "mdi-calendar-arrow-right",
          label: "Checkin Date",
          content: this.reservation.checkin_date
        },
        {
          icon: "mdi-calendar-arrow-left",
          label: "Checkout Date",
          content: this.reservation.checkout_date
        },
        {
          icon: "mdi-pound",
          label: "Booking Reference",
          content: this.$options.filters.nullable(this.reservation.booking_reference)
        },
        {
          icon: "mdi-phone",
          label: "Phone",
          content: this.$options.filters.nullable(this.reservation.phone)
        },
        {
          icon: "mdi-email",
          label: "Email",
          content: this.$options.filters.nullable(this.reservation.email)
        },
        {
          icon: "mdi-home-import-outline",
          label: "Booking Channel",
          content: this.reservation.booking_channel
              ? this.$options.filters.nullable(
                  this.reservation.booking_channel[this.reservation.booking_channel.label == 'Other' ? 'id' : 'label']
              ) : this.$options.filters.nullable(null)
        }
      ]
    }
  },
  methods: {

  },
  watch: {

  }
}

</script>