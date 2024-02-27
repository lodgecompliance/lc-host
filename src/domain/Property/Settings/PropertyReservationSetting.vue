<template>
    <section>
        <div class="d-flex flex-wrap justify-space-between">
          <slot name="heading" />
        </div>
        <data-container :loading="loading">
            <v-card flat>
              <v-card-title>Reservation options</v-card-title>
              <v-card-text>
                <reservation-fields-select v-model="setting.fields" :disabledFields="paymentDisabledFields">
                  <template #label="{ item }">
                    <div>
                      {{ item.label }}
                      <v-chip
                          v-if="paymentDisabledFields.includes(item.id)"
                          x-small color="error">
                        Payment integration needed
                      </v-chip>
                    </div>
                  </template>
                </reservation-fields-select>
              </v-card-text>
            </v-card>

            <v-card v-if="setting.fields && setting.fields.includes('booking_channel')" flat class="my-3">
              <v-card-title>Channel Configuration</v-card-title>
              <v-card-text>
                <booking-channel-select
                    v-model="setting.booking_channels"
                    multiple
                    label="Supported booking channels"
                    class="mt-5"
                    @all-channels="(channels) => allChannels = channels"
                    small-chips outlined dense />
                <strong class="mb-3">Configure specific channel</strong>
                <booking-channel-configuration
                    :property="property"
                    :setting="setting"
                    :supportedChannels="supportedChannels.concat([{id: 'other', label: 'Other'}])"
                    v-model="setting.channel_configurations"
                    @active-channel="(channel) => current_channel_config = channel "
                />
              </v-card-text>
            </v-card>

            <v-card flat class="my-3">
              <v-card-title>
                Payment
              </v-card-title>
              <v-card-text>
                <v-select
                    v-model="setting.payment_gateway"
                    :items="paymentGateways"
                    item-text="label"
                    item-value="id"
                    label="Gateway"
                    outlined
                    dense
                >
                  <template v-slot:item="{ item, on }">
                    <v-list-item v-on="on" :disabled="!paymentIntegrations.includes(item.id)">
                      <v-list-item-content>
                        <v-list-item-title> {{ item.label }} </v-list-item-title>
                        <v-list-item-subtitle v-if="!paymentIntegrations.includes(item.id)" class="red--text" >
                          {{ item.label }} is not integrated yet
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-select>
                <div v-if="setting.payment_gateway === 'stripe'" class="d-flex flex-wrap align-center">
                  <p class="mr-2">Capture pre authorized charge for stay that is</p>
                  <v-text-field
                      dense outlined type="number"
                      :suffix="`night${setting.max_period_for_charge_authorization > 1 ? 's' : ''} or more`"
                      v-model="setting.max_period_for_charge_authorization">
                  </v-text-field>
                </div>
              </v-card-text>
            </v-card>

            <v-card v-if="!current_channel_config" flat class="my-3">
              <v-card-title>
                Reservation Settings
              </v-card-title>
              <v-card-text>
                <v-switch
                    v-model="setting.allow_additional_guest"
                    inset dense
                    :label="`Additional guest`"
                >
                </v-switch>
                <v-switch
                    v-model="setting.auto_checkin_approval"
                    inset dense
                    :label="`Auto Approve checkin`"
                >
                </v-switch>
                <v-switch
                    v-model="setting.send_checkin_mail"
                    inset dense
                    :label="`Send checkin link`"
                >
                </v-switch>
                <reservation-message-editor
                    v-if="setting.send_checkin_mail"
                    :fields="setting.fields"
                    v-model="setting.checkin_mail"
                />
                <!-- <template>
                    <v-textarea
                        outlined
                        label="Checkin link mail"
                        v-model="setting.checkin_mail"
                        class="required"
                        dense
                    ></v-textarea>
                </template> -->
              </v-card-text>
            </v-card>

            <v-card flat>
              <v-card-title>
                Information to Collect From Guest
              </v-card-title>
              <v-card-text>
                <div class="d-flex flex-wrap">
                  <v-switch
                      v-for="info in guestInfos" :key="info.value"
                      v-model="setting.guest_info"
                      inset
                      :label="info.label"
                      :value="info.value"
                      multiple
                      class="px-5"
                  >
                  </v-switch>
                </div>
              </v-card-text>
            </v-card>

            <v-card flat class="my-3">
              <v-card-title>
                Checkin Approval Rules
              </v-card-title>
              <v-card-text>
                <reservation-checkin-approval-rules
                    v-model="setting.checkin_approval_rules"
                />
              </v-card-text>
            </v-card>

            <v-btn color="primary" large @click="updateSetting" :loading="saving" class="mt-5" depressed>Save settings</v-btn>
        </data-container>
    </section>
</template>

<script>
import { mapActions } from 'vuex';
import BookingChannelSelect from '../../Reservation/Components/BookingChannelSelect.vue';
import ReservationFieldsSelect from '../../Reservation/Components/ReservationFieldSelect.vue';
import DataContainer from '../../../components/DataContainer.vue';
import BookingChannelConfiguration from '../Widgets/BookingChannelConfigurations.vue';
import ReservationMessageEditor from '../../Reservation/Components/ReservationMessageEditor.vue'
import ReservationCheckinApprovalRules from '../../Reservation/Components/ReservationCheckinApprovalRuleSelect.vue';

import GET_PROPERTY_RESERVATION_SETTING from '../Queries/getPropertyReservationSetting';
import UPDATE_PROPERTY_RESERVATION_SETTING from '../Mutations/updatePropertyReservationSetting';

export default {
    name: "PropertyReservationSetting",
    components:{
        DataContainer, BookingChannelSelect, ReservationFieldsSelect,
        BookingChannelConfiguration, ReservationMessageEditor,
        ReservationCheckinApprovalRules
    },
    data() {
        return {
            loading: false,
            saving: false,
            setting: {},
            allChannels: [],
            current_channel_config: null,
            guestInfos: [
              {
                label: 'Gender',
                value: 'gender'
              },
              {
                label: 'Address',
                value: 'address'
              },
              {
                label: 'Phone',
                value: 'phone'
              },
              {
                label: 'Email',
                value: 'email'
              },
              {
                label: 'Age',
                value: 'age'
              },
            ],
            paymentGateways: [
                {
                    id: 'stripe',
                    label: 'Stripe'
                },
                {
                    id: 'paystack',
                    label: 'Paystack'
                }
            ]
        }
    },

    computed: {

        propertyId() {
            return this.property ? this.property.id : null
        },

        paymentIntegrations() {
            return this.property.payment_integrations || [];
        },
        
        paymentDisabledFields() {
            const fields = [];
            if(!this.paymentIntegrations.length || !this.setting.payment_gateway) {
                fields.push('balance', 'charges')
            }
            return fields
        },

        supportedChannels() {
            if(this.setting.booking_channels && this.setting.booking_channels.length) {
                return this.setting.booking_channels.map(channel => this.allChannels.find(c => c.id === channel))
                .filter(channel => channel !== undefined);
            }
            return [];
        },

    },

    props: {
        property: Object
    },

    methods: {
        ...mapActions([
            'query',
            'mutate'
        ]),

        getSetting() {
            this.loading = true;
            this.query({
                query: GET_PROPERTY_RESERVATION_SETTING,
                variables: {
                    id: this.property.id
                }
            })
            .then(response => {
                this.setting = response.data.getPropertyById?.reservation_settings ?? {};
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.getSetting(),
                    message: 'Could not get property reservation setting.',
                    exception: e
                })
            })
            .finally(() => {
                this.loading = false;
            });
        },

        updateSetting() {
            this.saving = true;
            this.setting.max_period_for_charge_authorization = parseInt(this.setting.max_period_for_charge_authorization);
            this.mutate( {
                mutation: UPDATE_PROPERTY_RESERVATION_SETTING,
                variables: {
                    property_id: this.property.id,
                    data: this.setting,
                }
            })
            .then(response => {
                Object.assign(this.setting, response.data.setPropertyReservationSettings ?? {})
                return this.$store.dispatch('getAuthGrProfile')
            })
            .then(() => {
                this.$store.commit("SNACKBAR", {
                    status: true,
                    text: "Settings updated",
                    color: "success"
                })
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.getSetting(),
                    message: 'Could not update property reservation setting.',
                    exception: e
                })
            })
            .finally(() => {
                this.saving = false;
            });
        }
    },

    watch: {
        propertyId: {
            immediate: true,
            handler(property){
                if(property) this.getSetting();
                else this.loading = true;
            }
        },
    }
}
</script>