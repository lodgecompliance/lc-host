<template>
  <div
      v-if="current_user.property && current_user.property.checkin_points <= 0"
      class="black white--text px-3 py-2 d-flex justify-space-between">
    <div>
      <v-icon color="white">mdi-information-outline</v-icon>
      <strong class="mx-2">Insufficient Check-in points</strong>
      <span>{{ current_user.property.name }} has no check-in points to process the next checkin </span>
    </div>
    <buy-property-credit
        :activator="{ depressed: true, small: true, color: 'secondary' }"
        @purchase="checkinPointsPurchased"
    >
    </buy-property-credit>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import BuyPropertyCredit from "@/domain/Property/Components/BuyPropertyCredit";

export default {
  name: "PropertyLowCheckinPointNotice",
  components: {BuyPropertyCredit},
  computed: {
    ...mapGetters([
        'current_user'
    ])
  },
  methods: {
    checkinPointsPurchased() {
      this.$store.dispatch("syncAuthUser");
    }
  }
}
</script>