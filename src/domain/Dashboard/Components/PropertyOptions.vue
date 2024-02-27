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
            v-if="$route.name !== 'dashboard.property.show' && $route.params.id !== property.id"
            :to="{ name:'dashboard.property.show', params: { id: property.id }}">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-eye</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>View Property</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="dialogs.checkinHistory = true">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-history</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Checkin Credit History</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="dialogs.transferPoint = true">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-transfer</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Transfer Checkin Credit</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-close-circle</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Disable Property</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-trash-can</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Delete Property</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-dialog
        v-model="dialogs.checkinHistory"
        width="800"
        scrollable
        persistent
    >
      <v-card>
        <v-card-title class="primary white--text">
          Checkin Credit History
          <v-spacer></v-spacer>
          <v-btn icon @click="dialogs.checkinHistory = false">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <property-checkin-point-history :property="property">
            <template #head>
              <div class="text-center mt-5">
                <h2 class="headline">{{ property.name }}</h2>
                <p class="grey--text">{{ property.full_address }}</p>
              </div>
            </template>
          </property-checkin-point-history>
        </v-card-text>
      </v-card>
    </v-dialog>
    <transfer-property-credit
        :from-property="property"
        :with-activator="false"
        v-model="dialogs.transferPoint"
        @transferred="(transfer) => $emit('checkin-point-transferred', transfer)"
    />
  </div>
</template>

<script>
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog.vue';
import PropertyCheckinPointHistory from "@/domain/Property/Components/PropertyCheckinPointHistory";
import TransferPropertyCredit from "@/domain/Dashboard/Widgets/TransferPropertyCredit";

export default {
  name: "PropertyAdminOptions",
  mixins: [],
  components: {TransferPropertyCredit, PropertyCheckinPointHistory, ConfirmationDialog },
  data() {
    return {
      confirmation: {
        text: null,
        confirmed: () => {}
      },
      dialogs: {
        checkinHistory: false,
        transferPoint: false,
      }
    }
  },
  props: {
    property: Object
  },
}
</script>

