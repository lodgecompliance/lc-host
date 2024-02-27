<template>
  <div>
    <confirmation-dialog ref="actionConfirmation" @confirmed="confirmation.confirmed()">
      <div class="text-center">
        <p>{{confirmation.text}}</p>
      </div>
    </confirmation-dialog>
    <v-menu origin="center center"  transition="scale-transition">
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list >
        <v-list-item
            v-if="$route.name !== 'dashboard.user.show' && $route.params.id !== user.id"
            :to="{ name:'dashboard.user.show', params: { id: user.id }}"
        >
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-eye</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>View User</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-domain</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Assign to Property</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-close-circle-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Suspend User</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-icon class="mr-2">
            <v-icon color="red">mdi-delete-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Delete User</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-delete-forever-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Remove User from Property</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog.vue';

export default {
  name: "UserAdminOptions",
  mixins: [],
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
    user: Object
  },
}
</script>

