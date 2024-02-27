<template>
    <v-container v-if="property && !property.active">
        <v-alert
          colored-border
          border="left"
          type="info"
          >
        <slot>Activate subscription for {{ property.name }}</slot>
      </v-alert>
      <v-btn :to="{ name: 'property.settings', params: {id: property.id, tab: 'subscription'}}" text color="info">View subscription</v-btn>
    </v-container>
</template>

<script>
export default {
    name: "PropertySubscriptionAlert",
    props: {
        property: Object
    }
}
</script>