<template>
    <property :breadcrumbs="breadcrumbs" :header-space="0">
      <template #header>
        <v-row justify="center">
          <v-col md="10">
            <h4 class="headline">Notifications</h4>
          </v-col>
        </v-row>

      </template>
        <v-row justify="center">
            <v-col md="10">
              <property-notifications />
            </v-col>
        </v-row>
    </property>
</template>

<script>
import PropertyNotifications from '../Widgets/PropertyNotifications.vue';
import Property from "@/domain/Property/Views/Show.vue";

export default {
    name: 'PropertyNotificationsPage',
    components: {
      Property, PropertyNotifications,
    },
    
    data(){
      return {}
    },
    computed:{
      breadcrumbs(){
        return [
          {
            text: "Notifications",
            to: this.$route
          }
        ]
      }
    },
}
</script>
