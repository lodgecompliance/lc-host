<template>
    <div>
        <v-sheet class="pa-2 rounded-b-0" rounded elevation="0">
           <v-row tile class="d-flex">
                <v-col v-if="view === 'Table'" cols="12" sm="3" class="py-0">
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        outlined
                        dense
                    ></v-text-field>
                </v-col>
                <v-col cols="12" :sm="view === 'Table' ? 6 : 8" class="py-0">
                  <reservation-status-filter
                    :includes="includes"
                    label="Status filter"
                    multiple
                    small-chips
                    v-model="statusFilter"
                    outlined
                    dense
                  />
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="12" :sm="view === 'Table' ? 3 : 4" class="py-0">
                    <v-select
                        v-model="view"
                        :items="views"
                        dense
                        outlined
                        hide-details
                        label="View"
                    ></v-select>
                </v-col>
            </v-row>
            <div class="d-flex justify-end align-content-center">
              <v-checkbox
                  v-for="archive in archives" :key="archive.value"
                  v-model="includes"
                  :value="archive.value"
                  multiple dense
                  :label="archive.label"
                  class="my-0 mx-2"
              />
            </div>
          </v-sheet>
        <data-container :loading="loading" :error="error" @retry="getPropertyReservations" >
            <template v-if="view === 'Table'" #loading>
                <v-skeleton-loader :type="view.toLowerCase()" />
            </template>
            <component
                :is="`property-reservations-${view}`"
                :reservations="items"
                :search="search"
                @reservation-updated="reservationUpdated"
                @reservation-deleted="reservationDeleted"
            ></component>
        </data-container>
    </div>
</template>
<script>

import moment from 'moment';
import ReservationFormDialog from '../Components/ReservationFormDialog.vue';
import GET_PROPERTY_RESERVATIONS from '../Queries/getPropertyReservations';
import DataContainer from '../../../components/DataContainer.vue';
import PropertyReservationsTable from '../../Property/Widgets/ReservationsTable.vue';
import PropertyReservationsCalendar from '../../Property/Widgets/ReservationsCalendar.vue';
import ReservationStatusFilter from "@/domain/Reservation/Components/ReservationStatusFilter";

export default {
    name: "PropertyReservations",
    components: {
      ReservationStatusFilter,
      DataContainer, ReservationFormDialog,
      PropertyReservationsTable, PropertyReservationsCalendar
    },

    data(){
        return {
            loading: false,
            view: 'Table',
            views: ['Table', 'Calendar'],
            search: '',
            statusFilter: [],
            reservations: [],
            includes: [],
            error: null
        }
    },
    computed: {
        property() {
            return this.$store.getters.current_user.property
        },

        items() {
            if(!this.statusFilter.length) return this.reservations;
            return this.reservations.filter(reservation => this.reservationMatchFilter(reservation))
        },

      archives() {
          return [
            { value: 'checkedout', label: "checked out" },
            { value: 'cancelled', label: "cancelled" }
          ]
      }
    },
    methods: {

        reservationMatchFilter(reservation) {
          return this.statusFilter.includes(reservation.status);
        },

        getPropertyReservations() {
            this.error = null;
            this.loading = true;
            this.reservations = [];

            this.$store.dispatch('query', {
                query: GET_PROPERTY_RESERVATIONS,
                variables: {
                    id: this.$store.getters.current_user.property.id,
                    includes: this.includes
                }
            }).then(response => {
                this.reservations = response.data?.getPropertyReservations?.data || [];
            })
            .catch(e => {
                this.error = e
            })
            .finally(() => {
                this.loading = false;
            })
        },

        momentFromTimestamp(timestamp) {
            return moment.unix(timestamp);
        },

      reservationUpdated(update) {
          this.reservations = this.reservations.map(reservation => {
            if(reservation.id === update.id) Object.assign(reservation, update)
            return reservation;
          }).filter(reservation => {
            if(!this.includes.includes("checkedout") && reservation.checkedout) return false;
            if(!this.includes.includes("cancelled") && reservation.cancelled) return false;
            return true;
          })
      },

      reservationDeleted(deletedReservation) {
          const index = this.reservations.findIndex(r => r.id === deletedReservation.id);
          if(index >= 0) this.reservations.splice(index, 1);
      }
     },

    watch: {
      property: {
        immediate: true,
        handler() {
          this.getPropertyReservations()
        }
      },
      statusFilter: {
          immediate: true,
          handler(statuses) {

          }
      },
      includes: {
        handler() {
          this.getPropertyReservations()
        }
      }
    }
}
</script>