<template>
    <div>
      <confirmation-dialog ref="actionConfirmation" @confirmed="confirmation.confirmed()">
        <div class="text-center" v-html="confirmation.text"></div>
      </confirmation-dialog>
      <v-dialog v-model="damageFormDialog" width="400">
        <reservation-damage-form
          :reservation="reservation"
          :damage="damage"
          :is-host="true"
          :role="damageFormRole"
          @cancel="damageFormDialog = false"
          @damage-updated="damageFormDialog = false"
          v-on="$listeners"
        />
      </v-dialog>
      <v-menu origin="center center"  transition="scale-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-bind="$attrs.activator" icon v-on="on">
          <v-icon v-bind="$attrs.activatorIcon">mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
            v-if="!damage.payment"
            @click="() => { damageFormRole = 'update'; damageFormDialog = true }"
        >
          <v-list-item-icon class="mr-2">
            <v-icon small>mdi-pen</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Edit Damage</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="!damage.resolution" @click="(e) => {
                        confirmation = {
                          text: `Are you sure you want to resolve the damage <br/>  <strong>${damage.title}</strong>`,
                          confirmed: resolveDamage
                        }
                        $refs.actionConfirmation.open()
                      }">
          <v-list-item-icon class="mr-2">
            <v-icon small>mdi-check-circle</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Resolve Damage</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="(e) => {
                        confirmation = {
                          text: `Are you sure you want to delete the damage <br/> <strong>${damage.title}</strong>`,
                          confirmed: deleteDamage
                        }
                        $refs.actionConfirmation.open()
                      }">
          <v-list-item-icon class="mr-2">
            <v-icon color="red" small>mdi-delete</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Delete Damage</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
            v-if="!damage.resolution && !damage.amount"
            @click="() => { damageFormRole = 'attach-charge'; damageFormDialog = true }"
        >
          <v-list-item-icon class="mr-2">
            <v-icon small>mdi-credit-card-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Attach a Charge</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    </div>
</template>

<script>
  import reservationMixin from '../Mixins/reservation';
  import ReservationDamageForm from "@/domain/Reservation/Components/ReservationDamageForm";
  import ConfirmationDialog from "@/components/Utilities/ConfirmationDialog";
  import {mapActions} from "vuex";
  import gql from "graphql-tag";

  export default {
    name: "ReservationDamageHostOptions",
    mixins: [reservationMixin],
    components: {ReservationDamageForm, ConfirmationDialog },
    data() {
      return {
        damageFormDialog: false,
        damageFormRole: 'update',
        confirmation: {
          text: null,
          confirmed: () => {}
        }
      }
    },
    computed: {

    },
    props: {
        reservation: Object,
        damage: Object
      },
    methods: {
      ...mapActions(['mutate']),
      resolveDamage() {
        this.mutate({
          mutation: gql `mutation resolveReservationDamage($reservation_id: ID!, $damage_id: ID!) {
            resolveReservationDamage(reservation_id: $reservation_id, damage_id: $damage_id){
              id
              resolution {
                  resolved_by {
                    id
                    full_name
                  }
                  resolved_at
                }
            }
          }`,
          variables: {
            reservation_id: this.reservation.id,
            damage_id: this.damage.id
          }
        }).then(response => {
          this.$store.commit("SNACKBAR", {
                status: true,
                text: `${this.damage.title} resolved`,
                color: 'success'
              })
          this.$emit('damage-updated', response.data.resolveReservationDamage);
        })
      },
      deleteDamage() {
        this.mutate({
          mutation: gql `mutation deleteReservationDamage($reservation_id: ID!, $damage_id: ID!) {
            deleteReservationDamage(reservation_id: $reservation_id, damage_id: $damage_id)
          }`,
          variables: {
            reservation_id: this.reservation.id,
            damage_id: this.damage.id
          }
        }).then(response => {
          this.$store.commit("SNACKBAR", {
            status: true,
            text: `${this.damage.title} deleted`,
            color: 'success'
          })
          this.$emit('damage-deleted', response.data.deleteReservationDamage)
        })
      }
    }
  }
</script>

