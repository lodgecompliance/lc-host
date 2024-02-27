<template>
  <section>
    <div class="d-flex flex-nowrap align-center">
      <v-btn text color="primary" @click="selectAllItems" small>
              <span v-if="items.length && allSelected">
                <v-icon small>mdi-checkbox-blank</v-icon> unselect all
              </span>
        <span v-else>
          <v-icon small>mdi-checkbox-blank-outline</v-icon> select all
        </span>
      </v-btn>
      <v-btn
          color="primary"
          class="mx-1"
          :disabled="selected.length === 0"
          @click="markNotificationsAsRead(selected)" outlined small>
        <v-icon small>mdi-check</v-icon> Mark as read
      </v-btn>
      <v-btn
          color="primary"
          class="mx-1"
          @click="getPropertyNotifications" text small><v-icon>mdi-refresh</v-icon> Refresh
      </v-btn>
    </div>
    <data-container :loading="loading" :error="error" @retry="getPropertyNotifications">
    <template v-slot:loading>
      <v-skeleton-loader
          v-for="i in 6" :key=i
          type="card"
          height="50"
          class="my-2"
      ></v-skeleton-loader>
    </template>
    <template v-if="items.length">
      <property-notification
          v-for="notification in items"
          :property="property"
          :notification="notification"
          :key="notification.id"
          :select="selected.includes(notification.id)"
          @update-notification="updateNotification"
          @mark-as-read="markNotificationsAsRead([notification.id])"
          @selected="selectItem"
          @unselected="unselectItem"
          class="my-2"
      />
    </template>
    <div v-else class="text-center py-16">
      <p class="grey--text text-center">You are all caught up, no notification here</p>
    </div>
  </data-container>
  </section>
</template>
<script>
import DataContainer from '../../../components/DataContainer.vue';
import PropertyNotification from '../Components/PropertyNotification.vue';
import GET_PROPERTY_NOTIFICATIONS from '../Queries/getPropertyNotifications';
import { mapGetters, mapMutations } from "vuex";
import itemSelect from "@/mixins/item-select";

export default {
    name: 'PropertyNotifications',
    mixins:[itemSelect],
    components: {
        PropertyNotification,
        DataContainer,
    },
    data(){
        return {
            loading: false,
            error: null,
        }
    },
    computed: {
      ...mapGetters([
          'current_user',
          'property_notifications',
          'properties_notifications'
      ]),

      property() {
        return this.current_user.property;
      }
    },
    methods:{
      ...mapMutations(['SET_PROPERTY_NOTIFICATIONS']),

      queryNotifications(notification_ids, mark_as_read) {
        return new Promise((resolve, reject) => {
          this.$store.dispatch('query', {
            query: GET_PROPERTY_NOTIFICATIONS,
            variables: {
              property_id: this.$store.getters.current_user.property.id,
              notification_ids, mark_as_read
            }
          }).then(response => {
            const notifications = response.data.getPropertyNotifications ? response.data.getPropertyNotifications : [];
            resolve(notifications);
          }).catch(e => reject(e))
        })
      },

      getPropertyNotifications(){
            this.loading = true;
            this.queryNotifications().then(notifications => {
                this.items = notifications;
              this.SET_PROPERTY_NOTIFICATIONS({ id: this.property.id, notifications })
            })
            .catch(e => {
                this.error = e;
            })
            .finally(() => {
                this.loading = false;
            })
        },

      markNotificationsAsRead(ids) {
        this.queryNotifications(ids, true).then(notifications => {
          notifications.forEach(notification => {
            this.updateNotification(notification);
            this.unselectItem(notification.id)
          });
          this.$store.commit("SNACKBAR", {
            status: true,
            text: `${notifications.length} notifications marked as read`,
            color: 'primary'
          })
        })
      },

      updateNotification(notification) {
        const index = this.items.findIndex(n => n.id === notification.id);
        if(index >= 0) {
          this.items.splice(index, 1, notification);
        }
        this.SET_PROPERTY_NOTIFICATIONS({ id: this.property.id, notifications: this.items});
      }
    },
    watch: {
      property: {
        immediate: true,
        handler(property) {
          const notifications = this.properties_notifications[property.id] || []
          this.SET_PROPERTY_NOTIFICATIONS({  id: property.id, notifications })
          this.items = notifications;
        }
      }
  }
}
</script>