<template>
    <property
        :breadcrumbs="breadcrumbs"
        :header-space="2"
    >
      <template #header>
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <h4 class="headline mb-3">Property Setting</h4>
          </v-col>
        </v-row>
      </template>
      <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <template v-if="property && tabs.length">
                <responsive-tabs
                  v-model="currentTab"
                  @change="tabChanged"
                  color="primary"
                  show-arrows
                  class="rounded"
                >
                  <template #tabs v-if="$store.getters.is_mobile">
                    <v-tab
                      v-for="tab in tabs" :key="tab.name"
                     :disabled="tab.disabled"
                      class="justify-start"
                    >
                      <v-icon flex>
                        {{ tab.icon }}
                      </v-icon>
                      <span>{{ tab.name }}</span>
                    </v-tab>
                  </template>
                  <template #items>
                    <v-tab-item v-for="tab in tabs" :key="tab.name"
                    class="px-sm-5 py-5">

                        <template v-if="tab.route.params.tab === 'integrations'">
                            <integrations-tab :property="property">
                              <template #heading>
                                <h3>Integrations</h3>
                              </template>
                            </integrations-tab>
                        </template>

                        <!-- Charges -->
                        <template v-if="tab.route.params.tab=== 'charges'">
                          <charges-tab :property="property">
                            <template #heading>
                              <h3>Charges</h3>
                            </template>
                          </charges-tab>
                        </template>

                        <!-- Reservation -->
                        <template v-if="tab.route.params.tab === 'reservation'">
                            <property-reservation-setting-tab :property="property">
                              <template #heading>
                                <h3 class="mb-3">Reservation Settings</h3>
                              </template>
                            </property-reservation-setting-tab>
                        </template>

                        <!-- Reservation Instructions -->
                        <template v-if="tab.route.params.tab === 'instructions'">
                            <checkin-instructions-tab :property="property">
                              <template #heading>
                                <h3>Checkin Instructions</h3>
                              </template>
                            </checkin-instructions-tab>
                        </template>

                        <!-- Reservation Agreements -->
                        <template v-if="tab.route.params.tab === 'agreements'">
                            <checkin-agreements-tab :property="property">
                              <template #heading>
                                <h3>Checkin Agreements</h3>
                              </template>
                            </checkin-agreements-tab>
                        </template>

                        <!-- Reservation Questions -->
                        <template v-if="tab.route.params.tab === 'questions'">
                            <checkin-questions-tab :property="property">
                              <template #heading>
                                <h3>Checkin Questions</h3>
                              </template>
                            </checkin-questions-tab>
                        </template>

                        <!-- Property Rooms -->
                        <template v-if="tab.route.params.tab === 'rooms'">
                          <property-rooms-tab :property="property">
                            <template #heading>
                              <h3>Rooms</h3>
                            </template>
                          </property-rooms-tab>
                        </template>

                        <!-- Property notification setting -->
                        <template v-if="tab.route.params.tab === 'notification'">
                          <property-notification-setting-tab :property="property">
                            <template #heading>
                              <h3>Notifications</h3>
                            </template>
                          </property-notification-setting-tab>
                        </template>

                        <!-- Property checkin points -->
                      <template v-if="tab.route.params.tab === 'check-in-point'">
                        <property-checkin-point-tab :property="property">
                          <template #heading>
                            <h3>Checkin Points</h3>
                          </template>
                        </property-checkin-point-tab>
                      </template>

                    </v-tab-item>
                  </template>
                </responsive-tabs>
            </template>
            <v-alert v-else type="error" colored-border border="left">
                No setting is available
            </v-alert>
          </v-col>
      </v-row>
    </property>
</template>

<script>

import ChargesTab from '../Settings/PropertyCharges.vue';
import IntegrationsTab from '../Settings/PropertyIntegrations.vue';
import CheckinInstructionsTab from '../Settings/PropertyCheckinInstructions.vue';
import CheckinAgreementsTab from '../Settings/PropertyCheckinAgreements';
import CheckinQuestionsTab from '../Settings/PropertyCheckinQuestions';
import PropertyReservationSettingTab from '../Settings/PropertyReservationSetting.vue';
import PropertyNotificationSettingTab from '../Settings/PropertyNotification.vue';
import PropertyCheckinPointTab from "@/domain/Property/Settings/PropertyCheckinPoint";
import ResponsiveTabs from "@/components/ResponsiveTabs";
import PropertyRoomsTab from "@/domain/Property/Settings/PropertyRooms.vue";
import Property from "@/domain/Property/Views/Show.vue";

export default {
    name: 'PropertySettings',
    components: {
      Property,
      // PropertyWallets,
      PropertyRoomsTab,
      ResponsiveTabs,
      ChargesTab, IntegrationsTab,
      CheckinInstructionsTab, CheckinAgreementsTab, CheckinQuestionsTab,
      PropertyReservationSettingTab,
      PropertyNotificationSettingTab, PropertyCheckinPointTab
    }, 
    data(){
        return {
          loading: false,
        }
    },
    computed:{
        property() {
            return this.$store.getters.current_user.property
        },
        propertyPermissions() {
            if(!this.property) return [];
            return this.property.access?.permissions || []
        },
        tabs(){
            return [
                {
                    name: 'Integrations',
                    route: {name: this.$route.name, params: {tab: 'integrations'}},
                    icon: 'mdi-cog-box',
                    permission: 'property.integration.manage'
                },
                {
                    name: 'Charges',
                    route: {name: this.$route.name, params: {tab: 'charges'}},
                    icon: 'mdi-credit-card',
                    permission: 'property.charge.manage'
                },
                {
                    name: 'Reservation',
                    route: {name: this.$route.name, params: {tab: 'reservation'}},
                    icon: 'mdi-cog',
                    permission: 'property.reservation.setting'
                },
                {
                    name: 'Instructions',
                    route: {name: this.$route.name, params: {tab: 'instructions'}},
                    icon: 'mdi-information',
                    permission: 'property.instruction.manage'
                },
                {
                    name: 'Agreements',
                    route: {name: this.$route.name, params: {tab: 'agreements'}},
                    icon: 'mdi-handshake',
                    permission: 'property.agreement.manage'
                },
                {
                    name: 'Questions',
                    route: {name: this.$route.name, params: {tab: 'questions'}},
                    icon: 'mdi-account-question',
                    permission: 'property.question.manage'
                },
                {
                  name: 'Rooms',
                  route: {name: this.$route.name, params: {tab: 'rooms'}},
                  icon: 'mdi-bed',
                  permission: 'property.reservation.setting'
                },
                {
                    name: 'Notification',
                    route: {name: this.$route.name, params: {tab: 'notification'}},
                    icon: 'mdi-bell',
                    permission: null
                },
                {
                  name: 'Check-in Point',
                  route: {name: this.$route.name, params: {tab: 'check-in-point'}},
                  icon: 'mdi-credit-card',
                  permission: 'property.subscription.manage'
                }
          ].filter(tab => tab.permission == null || this.property.access.is_admin || this.propertyPermissions.includes(tab.permission))
        },
        id(){
            return this.$route.params.id
        },
        tab:{
            get: function() {
                return this.$route.params.tab
                    ?  this.$route.params.tab
                    : (this.tabs.length ? this.tabs[0].route.params.tab : null);
            },
            set: function(tab){}
        },
        currentTab: {
          get: function(){
              return this.tabs.findIndex(t => t.route.params.tab === this.tab)
          },
          set: function(tab){}
        },

      breadcrumbs() {
        return [
          {
            text: this.tabs[this.currentTab].name,
            to: this.$route
          }
        ]
      }
    },
    
    methods:{
        propertyUpdated(property){
            this.$store.dispatch('syncAuthUser');
        },
        tabChanged(tab){
            if(!this.tabs[tab].route) return;
            this.$router.push(this.tabs[tab].route)
        },
    },

}
</script>
