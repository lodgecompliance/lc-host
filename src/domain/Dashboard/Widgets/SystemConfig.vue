<template>
  <v-card>
    <v-virtual-scroll
              height="500"
              item-height="50"
              :items="params">
            <template #default="{ item: param, index }">
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-cog</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-text-field
                      outlined
                      dense
                      type="text"
                      v-model="params[index].value"
                      :prefix="param.key"
                  >
                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-virtual-scroll>
    <v-card-actions>
      <v-btn
          color="primary"
          :loading="submitting"
          @click="submit"
      >Save</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>

import {mapActions} from "vuex";
import SET_SYSTEM_PARAMS from '../Mutations/setSystemParams';
export default {
  name: "SystemConfig",
  components: {},
  data() {
    return {
      submitting: false,
      params: []
    }
  },
  props: {
    config: Object
  },

  methods: {
    ...mapActions([
        'mutate'
    ]),
    submit() {
      this.submitting = true;
      this.mutate({
        mutation:SET_SYSTEM_PARAMS,
        variables: {
          params: this.params
        }
      }).then(response => {
          this.$store.commit("SNACKBAR", {
            status: true,
            text: response.data.setSystemParams ? "Saved" : "Failed to save",
            color: response.data.setSystemParams ? "success" : "error"
          })
      })
      .catch(e => {
        this.$store.commit('TOAST_ERROR', {
          show: true,
          retry: () => this.submit(),
          message: `Couldn't save config.`,
          exception: e
        })
      })
      .finally(() => {
        this.submitting = false;
      })
    }
  },

  watch: {
    config: {
      immediate: true,
      handler(config) {
        this.params = config.main
      }
    }
  }
}
</script>