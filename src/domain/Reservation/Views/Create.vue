<template>
    <property :breadcrumbs="breadcrumbs">
      <template #header>
        <v-row justify="center">
          <v-col cols="12" md="6">
            <h4 class="headline">New Reservation</h4>
          </v-col>
        </v-row>
      </template>
      <v-row justify="center">
          <v-col cols="12" md="6">
              <reservation-form v-if="hasPermission" :property="property" />
              <v-alert v-else type="error" colored-border border="left">
                  You do not have permission to create reservation in {{ property.name }}
              </v-alert>
          </v-col>
      </v-row>
    </property>
</template>

<script>
import Property from '@/domain/Property/Views/Show.vue';
import ReservationForm from '../Components/ReservationForm.vue';

export default {
    name: 'CreateReservation',
    mixins: [],
    components: {
      Property, ReservationForm
    }, 
    data(){
        return {
           
        }
    },

    computed:{
     property(){
          return this.$store.getters.current_user.property
      },
      hasPermission() {
          return this.property?.access?.is_admin
              || this.property?.access?.permissions?.includes('reservation.create')
      },
      breadcrumbs(){
        return [
          {
            text: "Reservations",
            to: { path: '/' }
          },
          {
            text: "Create New",
            to: this.$route
          }
        ]
      }
    },

}
</script>
