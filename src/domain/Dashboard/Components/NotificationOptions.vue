<template>
  <div>
    <confirmation-dialog ref="actionConfirmation" @confirmed="confirmation.confirmed()">
      <div class="text-center">
        <p>{{confirmation.text}}</p>
      </div>
    </confirmation-dialog>
    <v-menu>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list >
        <v-list-item>
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-eye</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Resend Notification</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-delete</v-icon>
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
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog.vue';

export default {
  name: "DashboardNotificationOptions",
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
    notification: Object
  },
}
</script>

