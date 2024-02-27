<template>
    <section>
      <div class="d-flex flex-wrap justify-space-between">
        <slot name="heading" />
      </div>
      <data-container :loading="loading" class="mt-5">
          <v-sheet color="#fff">
            <v-list dense>
              <v-list-item v-for="({ id, name}, i) in notificationTypes" :key="id">
                <v-list-item-content>
                  <v-list-item-title>{{ name }}</v-list-item-title>
                  <template v-if="settings.allow && settings.allow[parseInt(i)]">
                    <v-switch
                        v-for="channel in channels" :key="channel"
                        v-model="settings.allow[parseInt(i)].channels"
                        :label="channel"
                        :value="channel.toLowerCase()"
                        multiple class="px-2" inset
                    >
                    </v-switch>
                  </template>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <template v-if="anyEmailChannel">
              <v-alert v-if="!setEmail && isPropertyOwner" colored-border border="left" color="info">
                <small class="grey--text">Email notifications will be sent to {{ property.email }}</small>
                <div>
                  <v-btn text x-small color="primary" @click="setEmail = true">change email to receive notification</v-btn>
                </div>
              </v-alert>
              <template v-else>
                <v-text-field
                    v-model="settings.email"
                    outlined type="email"
                    placeholder="Enter valid email"
                    label="Send email notifications to"
                    hint="This email will only be for notifications, property email is not changed"
                    dense class="pb-1"
                />
                  <v-btn v-if="isPropertyOwner" text x-small color="primary" @click="setEmail = false">use property email</v-btn>
                </template>

            </template>
            <template v-if="anyPushChannel">
            <v-alert v-if="pushNotificationPermission === 'denied'" colored-border border="left" color="red">
              <small class="grey--text">Push notification has been blocked for this site on your browser.
                Go to your browser settings and allow notification from {{ url('') }}</small>
            </v-alert>
          </template>
          </v-sheet>
          <div class="mt-5">
            <v-btn color="primary" @click="updateSetting" :loading="saving">Save changes</v-btn>
          </div>
        </data-container>
    </section>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';
import DataContainer from '@/components/DataContainer.vue';

import GET_SETTINGS from '../Queries/getPropertyNotificationSettings';
import GET_NOTIFICATION_TYPES from '../Queries/getPropertyNotificationTypes';
import UPDATE_SETTINGS from '../Mutations/updatePropertyNotificationSettings';

export default {
    name: "PropertyNotificationSettings",
    components:{
        DataContainer, 
    },
    data() {
        return {
            loading: false,
            saving: false,
            channels: ["Push", "Email"],
            notificationTypes: [],
            settings: {},
            setEmail: false
        }
    },
    props: {
        property: Object
    },
  computed: {
    ...mapGetters([
        'current_user'
    ]),
    isPropertyOwner() {
      return this.property.user_id === this.current_user.auth.uid;
    },
    anyEmailChannel() {
      if(!this.settings || !this.settings.allow) return false;
      return this.settings.allow.some(a => a.channels.includes('email'))
    },
    anyPushChannel() {
      if(!this.settings || !this.settings.allow) return false;
      return this.settings.allow.some(a => a.channels.includes('push'))
    },
    pushNotificationPermission() {
      return 'Notification' in window ? Notification.permission : null;
    }
  },

    methods: {
        ...mapActions([
            'query',
            'mutate'
        ]),

        getSetting() {
            this.loading = true;
            this.query({ query: GET_NOTIFICATION_TYPES })
            .then(response => {
              this.notificationTypes = response.data.getPropertyNotificationTypes
              return this.query({
                query: GET_SETTINGS,
                variables: {
                  id: this.property.id
                }
              })
            })
            .then(response => {
              this.settings = response.data.getPropertyById?.notification_settings ?? {}
              this.settings.email = this.settings.email ?? this.current_user.profile.email;
              this.settings.allow = this.notificationTypes.map(type => {
                const savedTypeSetting = (this.settings.allow || []).find(a => a.type === type.id);
                return {
                  type: type.id,
                  channels: savedTypeSetting ? savedTypeSetting.channels : []
                }
              })
              if(this.settings.email) this.setEmail = true;
            })
            .catch(e => {
            this.$store.commit('TOAST_ERROR', {
                show: true,
                retry: () => this.getSetting(),
                message: 'Could not get settings.',
                exception: e
            })
            }).finally(() => {
                this.loading = false;
            });
        },

        updateSetting() {
          this.saving = true;
          if(!this.setEmail) this.settings.email = null;
          this.requestPushNotificationPermission().then(() => {
            return this.mutate( {
              mutation: UPDATE_SETTINGS,
              variables: {
                property_id: this.property.id,
                settings: this.settings,
              }
            })
          })
          .then(response => {
              this.settings = response.data.setPropertyNotificationSettings ?? {};
              this.$store.commit("SNACKBAR", {
                  status: true,
                  text: "Settings updated",
                  color: "success"
              })
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.updateSetting(),
                    message: 'Could not update setting.',
                    exception: e
                })
            })
            .finally(() => {
                this.saving = false;
            });
        },

        requestPushNotificationPermission() {
          if(!this.anyPushChannel) return Promise.resolve();
            return new Promise((resolve, reject) => {
              if ('Notification' in window) {
                if(Notification.permission === "granted") return resolve()
                Notification.requestPermission().then(permission => {
                  if (permission === "granted") {
                    new Notification("Hi! We can now send you notification here");
                  }
                });
              }
              return resolve();
            })
          }
    },

    watch: {
        property: {
            immediate: true,
            handler(property){
                if(property) this.getSetting();
            }
        },
    }
}
</script>