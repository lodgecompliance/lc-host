<template>
  <v-card>
    <v-card-title v-if="$slots.heading">
      <slot name="heading" />
    </v-card-title>
    <v-card-text>
      <p>Create and send notification to {{ to }}</p>
      <v-form ref="form" @submit.prevent class="pt-2">
        <v-text-field
            outlined dense
            label="Title"
            :rules="[rules.required]"
            type="text"
            name="Title"
            v-model="form.title"
        ></v-text-field>
        <v-textarea
            outlined dense
            label="Description"
            :rules="[rules.required]"
            v-model="form.description"
        ></v-textarea>
        <dashboard-user-select
            v-if="to === 'users'"
            v-model="form.users"
            label="Select users"
            multiple outlined dense clearable />
        <dashboard-property-select
            v-if="to === 'properties'"
            v-model="form.properties"
            label="Select properties"
            multiple outlined dense clearable />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <slot name="actions" v-bind="{ submit, loading }">
        <v-btn type="button" @click.prevent="submit" color="primary" :loading="loading">Send Notification</v-btn>
      </slot>
    </v-card-actions>
  </v-card>
</template>

<script>
import formValidation from '@/helper/formValidation';
import DashboardUserSelect from "@/domain/Dashboard/Components/UserSelect";
import DashboardPropertySelect from "@/domain/Dashboard/Components/PropertySelect";

export default {
  name: "DashboardNotificationForm",
  components: {DashboardPropertySelect, DashboardUserSelect},
  data() {
    return {
      loading: false,
      form: {
        title: "",
        descriptions: "",
        properties: [],
        users: []
      },
      rules: formValidation.rules
    }
  },
  props: {
    to: {type: String, default: () => "properties"},
  },
  methods: {
    submit() {
      if(!this.$refs.form.validate()) return;
      this.$store.commit('SNACKBAR', {
        status: true,
        text: "Can't create notification from dashboard yet",
        color: "info"
      })
    }
  }
}
</script>