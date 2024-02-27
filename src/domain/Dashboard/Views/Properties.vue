<template>
  <dashboard class="white">
    <template #header>
      <div class="pb-5 pb-md-0">
        <h4 class="headline">Properties</h4>
      </div>
    </template>
    <v-row justify="center">
      <v-col cols="12" md="11" lg="10">
        <properties
            :properties="properties"
            :table="{'class': 'striped', 'show-select': true}"
            :card="{flat: true, 'class': 'mt-n8 mt-md-0 transparent'}"
        />
      </v-col>
    </v-row>
  </dashboard>
</template>

<script>
import Dashboard from "@/views/Dashboard";
import Properties from "@/domain/Dashboard/Widgets/Properties";
import {mapGetters} from "vuex";

export default {
  name: "DashboardProperties",
  components: { Properties, Dashboard },
  data() {
    return {
      quickView: null,
    }
  },
  computed: {
    ...mapGetters(['dashboard']),
    breadcrumbs() {
      return [
        {
          text: "Properties",
          to: {name: 'dashboard.properties'}
        }
      ]
    },
    properties() {
      return this.dashboard?.properties || []
    }
  }
}

</script>