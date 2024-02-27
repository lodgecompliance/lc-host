<template>
  <v-card v-bind="$attrs.card">
    <v-row class="py-0" justify="space-between">
        <v-col cols="4" md="3" lg="2" class="py-0">
          <status-filter
              v-model="filter"
              :collection="verifications"
              :default-status="{label: 'All Verification', value: 'all'}"
              outlined
              dense
              class="white"
          />
        </v-col>
        <v-col cols="8" md="8" lg="6" class="py-0">
          <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search"
              dense
              outlined
              class="white"
          >
            <template #append>
              <v-btn text small color="primary">
                <v-icon>mdi-filter-outline</v-icon>
                <span class="d-none d-md-inline">Filter</span>
              </v-btn>
            </template>
          </v-text-field>
        </v-col>
      </v-row>
    <verifications-table
        :verifications="filteredVerifications"
        :search="search"
        v-bind="$attrs.table"
        v-on="$listeners"
    />
  </v-card>
</template>

<script>

import VerificationsTable from "@/domain/Dashboard/Widgets/VerificationsTable";
import StatusFilter from "@/components/StatusFilter";
export default {
  name: "Verifications",
  components: {StatusFilter, VerificationsTable},
  data() {
    return {
      search: null,
      filter: null,
      filteredVerifications: []
    }
  },
  props: {
    verifications: {type: Array, default: () => [] }
  },
  watch: {
    filter: {
      immediate: true,
      handler(filter) {
        if(!filter) return;
        if(filter === "all") {
          this.filteredVerifications = this.verifications;
        } else {
          this.filteredVerifications = this.verifications.filter(verification => verification.status === filter)
        }
      }
    }
  }
}
</script>