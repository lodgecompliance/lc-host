<template>
  <v-dialog
      v-model="dialog"
      width="500"
      scrollable
      persistent
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
          v-bind="$attrs.activator"
          v-on="on"
      >
        <slot><v-icon>mdi-plus</v-icon> Create Notification </slot>
      </v-btn>
    </template>
    <dashboard-notification-form :to="target">
      <template #heading>
        <div style="width: 100%">
          <h4>New Notifications</h4>
          <v-radio-group
              label="Recipients"
              v-model="target"
              row
          >
            <v-radio
                label="Properties"
                value="properties"
            ></v-radio>
            <v-radio
                label="Users"
                value="users"
            ></v-radio>
          </v-radio-group>
        </div>
      </template>
      <template #actions="{ submit, loading }">
        <v-btn color="red" @click="dialog = false" text>Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn
            @click.prevent="submit"
            color="primary"
            elevation="0"
            :loading="loading"
        >Send Notification <v-icon class="ml-2">mdi-send</v-icon></v-btn>
      </template>
    </dashboard-notification-form>
  </v-dialog>
</template>

<script>
import DashboardNotificationForm from "@/domain/Dashboard/Components/NotificationForm";
export default {
  name: "CreateNotification",
  components: {DashboardNotificationForm},
  data() {
    return {
      dialog: false,
      target: "properties"
    }
  }
}
</script>