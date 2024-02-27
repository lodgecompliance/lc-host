<template>
  <div>
    <v-card v-bind="$attrs.vCard">
      <v-card-title>Credit Balance</v-card-title>
      <v-card-text>
        <h1>{{ property.checkin_points }}</h1>
      </v-card-text>
      <v-card-actions v-if="$slots.actions">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "PropertyCredit",
  data() {
    return {}
  },
  props: {
    property: Object
  }
}
</script>