<template>
  <v-card v-bind="$attrs.card">
    <v-row class="mx-2 pt-5" justify="space-between" align="center">
      <v-col cols="12" md="3" class="py-0">
        <h6 class="text-h6 headline pb-3">Credit History</h6>
      </v-col>
      <v-col cols="12" md="9" class="py-0">
        <v-row justify="end">
          <v-col cols="12" md="5" lg="6" class="py-0">
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
          <v-col cols="6" md="3" lg="3" class="py-0">
            <v-select
                v-model="filter"
                :items="filters"
                item-text="label"
                item-value="value"
                outlined
                dense
                class="white"
            >
            </v-select>
          </v-col>
          <v-col cols="6" md="4" lg="3" class="py-0 text-right">
            <add-property-credit
            :activator="{color: 'primary' }"
            >
              <v-icon small>mdi-plus</v-icon> Add Payment
            </add-property-credit>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <credit-history-table
    :history="filteredCredits"
    :search="search"
    v-bind="$attrs.table"
    v-on="$listeners"
    />
  </v-card>
</template>
<script>
import AddPropertyCredit from "@/domain/Dashboard/Widgets/AddPropertyCredit";
import CreditHistoryTable from "@/domain/Dashboard/Widgets/CreditHistoryTable";
export default {
  name: "CreditHistory",
  components: {CreditHistoryTable, AddPropertyCredit},
  data() {
    return {
      search: null,
      filter: null,
      filters: [
        {label: "All Credits", value: "all"},
        {label: "Successful", value: "success"},
        {label: "Pending", value: "pending"},
        {label: "Failed", value: "failed"}
      ],
      filteredCredits: []
    }
  },
  props: {
    history: {type: Array, default: () => []}
  },
  mounted() {
    this.filter = this.filters[0].value;
  },
  watch: {
    filter: {
      immediate: true,
      handler(filter) {
        if(!filter) return;
        if(filter === "all") {
          this.filteredCredits = this.history;
        } else {
          this.filteredCredits = this.history.filter(credit => credit.status ? credit.status.toLowerCase() == filter.toLowerCase() : false)
        }
      }
    }
  }
}
</script>