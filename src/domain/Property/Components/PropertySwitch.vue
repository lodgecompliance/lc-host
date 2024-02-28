<template>
    <v-select
        class="mx-2 text--darken-4"
        :items="properties"
        item-text="name"
        item-value="id"
        dense
        :value="current_user.property ? current_user.property.id : null"
        @change="switchProperty"
        outlined
        label="Properties"
        background-color="transparent"
        :style="`max-width: ${maxWidth}`"
        hide-details
    >
      <template #selection="{ item: property, index, select, parent }">
        <v-chip v-if="parent.multiple" pill class="ma-1" close @click:close="parent.value.splice(index, 1)">
          <v-avatar size="20" left>
            <v-img :src="property.image"></v-img>
          </v-avatar>
          {{ property.name }}
        </v-chip>
        <template v-else>
          <v-avatar size="20">
            <v-img :src="property.image"></v-img>
          </v-avatar>
          <span class="ml-2">{{ property.name }}</span>
        </template>
      </template>
      <template #item="{ item: property, on }">
        <v-list-item v-on="on" :disabled="!(property.active && property.access && property.access.enabled)">
          <v-list-item-avatar>
            <v-img :src="property.image"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{property.name}}</v-list-item-title>
            <v-list-item-subtitle>{{ property.address }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-select>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
    name: "PropertySwitch",
    props: {
        maxWidth: {
          default: '300px'
        }
    },
    computed: {
        ...mapGetters([
            'current_user',
            'properties',
            'profile_loaded'
        ]),
    },
    methods: {
    ...mapMutations([
      'SET_ACTIVE_PROPERTY'
    ]),

    switchProperty(property){
      const activeProperty = this.properties.find(p => p.id === property);
      this.SET_ACTIVE_PROPERTY(activeProperty);
      if(this.$route.params.property) {
        this.$router.replace({
          name: this.$route.name,
          params: { ...this.$route.params, property: activeProperty.id }
        })
      } else {
        this.$emit('change', activeProperty);
      }
    }
  },
}
</script>