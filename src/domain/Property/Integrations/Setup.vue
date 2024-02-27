<template>
  <v-dialog
      v-model="show"
      max-width="500"
      v-on="$listeners"
      persistent scrollable>
    <v-card>
      <v-card-title>
        <h4>{{ title }}</h4>
        <v-spacer></v-spacer>
        <slot v-if="isSet"  name="header-action" />
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>
      <v-card-text class="pt-2">
        <data-container :loading="loading" :error="error" @retry="getIntegration">
          <slot />
        </data-container>
      </v-card-text>
      <v-card-actions v-if="!loading && $slots['actions']">
        <slot  name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import DataContainer from "@/components/DataContainer";

export default {
  name: "IntegrationSetup",
  components: { DataContainer },
  props: {
    open: Boolean,
    title: String,
    subtitle: String,
    fetchQuery: Object,
    isSet: Boolean
  },
  data(){
    return {
      show: false,
      loading: false,
      error: null,
    }
  },
  methods: {
    getIntegration() {
      this.loading = true;
      this.$store.dispatch('query', this.fetchQuery)
      .then(response => {
        this.$emit('fetched', response.data)
      })
      .catch(e => {
        this.error = e
      })
      .finally(() => {
        this.loading = false;
      })
    },
  },
  watch: {
    open: {
      immediate: true,
      handler(open) {
        this.show = open;
        if(open) this.getIntegration()
      }
    }
  }
}
</script>