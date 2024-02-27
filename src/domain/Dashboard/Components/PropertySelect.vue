<template>
  <v-autocomplete
      :items="properties"
      item-text="name"
      item-value="id"
      v-bind="$attrs"
      v-on="$listeners"
  >
    <template #selection="{ item: property, index, select, parent }">
      <v-chip v-if="parent.multiple" pill class="ma-1" close @click:close="parent.value.splice(index, 1)">
        <v-avatar left>
          <v-img :src="property.image"></v-img>
        </v-avatar>
        {{ property.name }}
      </v-chip>
      <template v-else>
        <v-avatar size="30">
          <v-img :src="property.image"></v-img>
        </v-avatar>
        <span class="ml-2">{{ property.name }}</span>
      </template>
    </template>

    <template #item="{ item: property, on }">
      <slot name="item" v-bind="{ item: property, on }">
        <v-list-item v-on="on">
          <v-list-item-avatar>
            <v-img :src="property.image"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{property.name}}</v-list-item-title>
            <v-list-item-subtitle>{{ property.full_address }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </slot>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  name: "DashboardPropertySelect",
  computed: {
    properties() {
      return this.$store.getters.dashboard?.properties || []
    }
  },
}

</script>