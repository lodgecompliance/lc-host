<template>
  <v-select
      :items="properties"
      item-text="name"
      item-value="id"
      :item-disabled="property => !(property.access && (property.access.active || property.access.is_admin ))"
      v-bind="$attrs"
      v-on="$listeners"
  >
    <template #item="props">
      <slot name="item" v-bind="props">
        <v-list-item v-on="props.on">
          <v-list-item-avatar>
            <v-img :src="props.item.image"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{props.item.name}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </slot>
    </template>
    <template #selection="props">
      <slot name="selection" v-bind="props">
        <v-chip v-if="props.parent.multiple" pill class="ma-1" close
                @click:close="props.parent.value.splice(props.index, 1)">
          <v-avatar left>
            <v-img :src="props.item.image"></v-img>
          </v-avatar>
          {{ props.item.name }}
        </v-chip>
        <template v-else>
          <v-avatar size="30">
            <v-img :src="props.item.image"></v-img>
          </v-avatar>
          <span class="ml-2">{{ props.item.name }}</span>
        </template>
      </slot>
    </template>
  </v-select>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: "UserPropertiesSelect",
  computed: {
    ...mapGetters([
      'properties'
    ]),

  },
}
</script>