<template>
  <div>
    <v-dialog
        v-model="showPayments"
        width="400"
        scrollable
    >
      <reservation-payments
          ref="payments"
          :reservation="reservation"
          :property="property ? property : reservation.property"
          :can-refund="hasPermissionToManageCharge"
          :can-capture="hasPermissionToManageCharge"
          @charges-refunded="chargesRefunded"
      />
    </v-dialog>
    <v-menu v-if="reservation.host_actions.length"
            origin="center center"
            transition="scale-transition">
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon small>mdi-bell</v-icon>
          <v-badge :content="reservation.host_actions.length" color="warning"/>
        </v-btn>
      </template>
      <v-card>
        <v-card-text class="pa-0">
          <v-list>
            <v-list-item
                v-for="action in actions"
                :key="action.key"
                @click="action.doAction()"
            >
              <v-list-item-content>
                <v-list-item-title>{{ action.value }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script>

  import {mapActions} from "vuex";
  import reservationMixin from '../Mixins/reservation';
  import ReservationPayments from "@/domain/Reservation/Components/Payment/ReservationPayments";

  export default {
    name: "ReservationHostActions",
    components: {ReservationPayments},
    mixins: [reservationMixin],
    props: {
      reservation: Object
    },
    data(){
      return {
        showPayments: false
      }
    },
    computed:{
      actions() {
        return (this.reservation.host_actions ? this.reservation.host_actions : []).map(action => {
          return {
            ...action,
            doAction: typeof this[action.key] == 'function' ? this[action.key] : this.viewReservation
          }
        })
      },
      reservationRoute() {
        return { name: 'property.reservation.show', params: { property: this.reservation.property_id, reservation: this.reservation.id, _reservation: this.reservation},
        }
      }
    },
    methods:{
        ...mapActions([
            'mutate'
        ]),
        viewReservation() {
          this.$router.push(this.reservationRoute)
        },
        reservation_checkout() {
          return this.checkoutReservation()
        },
        reservation_checkin_review() {
          return this.viewReservation()
        },
        refund_outstanding_charge() {
          this.showPayments = true;
        },

        chargesRefunded() {
          const reservation = this.reservation;
          const index = reservation.host_actions.findIndex(a => a.key == 'refund_uncaptured_charge');
          if(index > 0) reservation.host_actions.splice(index, 1);
          this.$emit('reservation-updated', reservation);
          this.showPayments = false;
        }
      },
    }
</script>

<style scoped>

</style>
