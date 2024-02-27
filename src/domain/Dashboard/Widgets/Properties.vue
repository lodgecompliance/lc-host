<template>
  <v-card v-bind="$attrs.card">
    <v-row class="py-0" justify="space-between">
      <v-col cols="4" lg="2" class="py-0 mb-lg-n1">
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
      <v-col cols="8" lg="10" class="py-0 mb-lg-n1">
        <v-row justify="start">
          <v-col cols="12" lg="5" class="py-0">
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
      </v-col>
    </v-row>
    <v-row justify-lg="end" >
      <v-col cols="12" lg="7" class="py-0 text-right mt-n5 mt-lg-n16">
        <transfer-property-credit
            :activator="{outlined: true, color: 'primary', 'class':'ma-1', small:!$vuetify.breakpoint.mdAndUp }"
        >
          <v-icon small>mdi-plus</v-icon> Transfer Point
        </transfer-property-credit>
        <add-property-credit
            :activator="{outlined: true, color: 'primary', 'class':'ma-1', small:!$vuetify.breakpoint.mdAndUp }"
        >
          <v-icon small>mdi-plus</v-icon> Add Point
        </add-property-credit>
      </v-col>
    </v-row>
    <properties-table
        :properties="filteredProperties"
        :search="search"
        v-bind="$attrs.table"
        v-on="$listeners"
    />
  </v-card>
</template>
<script>
import PropertiesTable from "./PropertiesTable";
import AddPropertyCredit from "@/domain/Dashboard/Widgets/AddPropertyCredit";
import TransferPropertyCredit from "@/domain/Dashboard/Widgets/TransferPropertyCredit";
export default {
  name: "Properties",
  components: {TransferPropertyCredit, AddPropertyCredit, PropertiesTable},
  data() {
    return {
      search: null,
      filter: null,
      filters: [
        {label: "All Properties", value: "all"},
        {label: "Active", value: "active"},
        {label: "Non-active", value: "non-active"},
        {label: "Disabled", value: "disabled"}
      ],
      filteredProperties: []
    }
  },
  props: {
    properties: Array
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
          this.filteredProperties = this.properties;
        } else {
          this.filteredProperties = this.properties.filter(property => property.status.toLowerCase() == filter.toLowerCase())
        }
      }
    }
  }
}
</script>