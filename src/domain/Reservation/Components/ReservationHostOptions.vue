<template>
  <div>
    <confirmation-dialog ref="actionConfirmation" @confirmed="confirmation.confirmed()">
      <div class="text-center">
        <p>{{confirmation.text}}</p>
      </div>
    </confirmation-dialog>
    <v-menu origin="center center"  transition="scale-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-bind="$attrs.activator" icon v-on="on">
          <v-icon v-bind="$attrs.activatorIcon">mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
            v-if="hasPermissionToEdit"
            @click="$router.replace({ name:'property.reservation.show', params: { property: reservation.property_id, reservation: reservation.id }, query: {edit: 1}})">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-pen</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Edit Reservation</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
            v-if="hasPermissionToEdit"
            @click="(e) => {
                confirmation = {
                  text: 'Are you sure you want to cancel the reservation',
                  confirmed: cancelReservation
                }
                $refs.actionConfirmation.open()
            }"
            :disabled="reservation.cancelled || reservation.approved">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-close</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Cancel Reservation</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item  v-if="hasPermissionToDelete"
                      :disabled="reservation.already_checkedin" @click="(e) => {
                        confirmation = {
                          text: 'Are you sure you want to delete the reservation',
                          confirmed: deleteReservation
                        }
                        $refs.actionConfirmation.open()
                      }">
          <v-list-item-icon class="mr-2">
            <v-icon color="red">mdi-delete</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Delete Reservation</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
  import ConfirmationDialog from '../../../components/Utilities/ConfirmationDialog.vue';
  import reservationMixin from '../Mixins/reservation';

  export default {
      name: "ReservationHostOptions",
      mixins: [reservationMixin],
      components: { ConfirmationDialog },
      data() {
          return {
            confirmation: {
              text: null,
              confirmed: () => {}
            }
          }
      },
      props: {
        reservation: Object
      },
    }
</script>

<style scoped>

</style>
