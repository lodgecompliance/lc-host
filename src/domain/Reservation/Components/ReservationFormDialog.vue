<template>
    <v-dialog 
        v-model="dialog"
        width="600"
        scrollable
        transition="dialog-bottom-transition"    
        persistent
      >
      <reservation-form
          :property="property"
          :reservation="reservation"
          @reservation-created="close"
      >
        <template #header>
          <v-card-title>
            <span>Create Reservation</span>
            <v-spacer></v-spacer>
            <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
        </template>
      </reservation-form>
    </v-dialog>
</template>

<script>
import ReservationForm from './ReservationForm.vue';export default {
    name: "ReservationFormDialog",
    components: {
       ReservationForm
    },
    data(){
        return {
            dialog: false,
        }
    },
    props: {
        property: Object,
        reservation: Object
    },

    methods: {
        open(){
            this.dialog = true;
        },

        close(){
            this.dialog = false;
        },
    }
}
</script>