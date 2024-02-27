<template>
    <v-card v-if="property" :loading="loading" flat>
      <slot name="header" />
        <v-card-text class="pt-5">
          <v-form ref="form" @submit.prevent>
            <data-container
                :loading="booting"
                :error="error.init"
                @retry="init"
            >
                <v-row justify="center" align="center">
                    <v-col cols="12" :md="`${fields.includes('booking_channel') ? 8 : 12}`" class="py-0">
                        <v-text-field
                            outlined
                            label="Guest name"
                            :rules="[rules.required]"
                            type="text"
                            name="name"
                            v-model="form.name"
                            class="required"
                            dense
                        ></v-text-field>
                    </v-col>
                    <v-col v-if="fields.includes('booking_channel')" cols="12" md="4" class="py-0">
                        <booking-channel-select
                        outlined
                        label="Booking Channel"
                        v-model="channel"
                        :disabled="reservationCheckedIn"
                        :supported="setting.booking_channels || []"
                        return-object
                        dense
                        />
                    </v-col>
                </v-row>

                <v-row justify="center" align="center">
                    <v-col cols="12" :md="6" class="py-0">
                        <v-text-field
                            outlined
                            label="Email"
                            :rules="[]"
                            type="email"
                            v-model="form.email"
                            dense
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6" class="py-0">
                        <v-text-field
                            outlined
                            label="Phone"
                            :rules="[]"
                            type="tel"
                            v-model="form.phone"
                            dense
                        ></v-text-field>
                    </v-col>
                </v-row>

                <v-row justify="center" align="center">
                    <v-col v-if="fields.includes('booking_reference')"
                    cols="12"
                    :md="`${fields.includes('booking_reference') && fields.includes('room') ? 6 : 12}`" class="py-0"
                    >
                        <v-text-field
                            outlined
                            label="Booking Reference"
                            type="text"
                            name="booking_reference"
                            v-model="form.booking_reference"
                            :disabled="reservationCheckedIn"
                            prefix="#"
                            dense
                        ></v-text-field>
                    </v-col>

                    <v-col v-if="fields.includes('room')"
                    cols="12"
                    :md="`${fields.includes('booking_reference') && fields.includes('room') ? 6 : 12}`" class="py-0">
                        <v-text-field
                            outlined
                            label="Room/Listing "
                            type="text"
                            name="room"
                            v-model="form.room"
                            :disabled="reservationCheckedIn"
                            prefix="#"
                            dense
                        ></v-text-field>
                    </v-col>
                </v-row>

                <v-row justify="center" >
                    <v-col cols="12" md="6" class="py-0">
                        <div>
                            <label for="checkin-date" class="required">Checkin date</label>
                        </div>
                        <v-date-picker full-width id="checkin-date" v-model="form.checkin_date" :min="minCheckinDate" @change="form.checkout_date = null"></v-date-picker>
                    </v-col>
                    <v-col  cols="12" md="6" class="py-0">
                        <div>
                            <label for="checkout-date" class="required">Checkout date</label>
                        </div>
                        <v-date-picker full-width id="checkout-date" v-model="form.checkout_date" :min="minCheckoutDate"></v-date-picker>
                    </v-col>
                    <v-col cols="12" class="py-0">
                        <h4>Stay Duration: {{ stayDuration }} day<span v-show="stayDuration > 1">s</span></h4>
                    </v-col>
                </v-row>

                <template v-if="channel">
                    <booking-channel-reservation-form
                    v-model="channelConfiguration.reservation_form"
                    @input="v => Object.assign(form, v)"
                    :setting="setting"
                    :edit="editChannelConfig"
                    :property="property"
                    :channel="channel"
                    :card-props="{
                        loading: setting_channel_config,
                        disabled: setting_channel_config
                    }"
                    >
                        <template #header>
                            <v-card-title  v-if="mode === 'create' && !editChannelConfig">
                                <h4>Reservation options for {{ channel.label }} channel</h4>
                            </v-card-title>
                        </template>

                        <template v-if="mode === 'create' && channelConfiguration.options && channelConfiguration.options.can_pay_balance" #booking-balance>
                          <v-text-field
                              outlined
                              dense
                              label="Booking balance"
                              type="number"
                              name="balance"
                              v-model="form.balance"
                              :disabled="reservationCheckedIn"
                              :prefix="form.currency"
                              :rules="[(v) => parseInt(v) < 0 ? 'Invalid amount' : true]"
                          >
                          </v-text-field>
                        </template>
                        <template v-else-if="mode === 'edit' && channelConfiguration.options && channelConfiguration.options.can_pay_balance" #after-currency>
                          <v-text-field
                              outlined
                              dense
                              label="Booking balance"
                              type="number"
                              name="balance"
                              v-model="form.balance"
                              :disabled="reservationCheckedIn"
                              :prefix="form.currency"
                              :rules="[(v) => parseInt(v) < 0 ? 'Invalid amount' : true]"
                          >
                          </v-text-field>
                        </template>

                        <template v-if="!reservationCheckedIn" #actions>
                            <v-btn v-if="!editChannelConfig" text color="primary" @click="editChannelConfig = true">
                                <v-icon>mdi-pencil</v-icon> update options
                            </v-btn>
                            <template v-else>
                                <v-btn text color="primary" @click="useDefaultChannelConfig" :loading="setting_channel_config">
                                    <v-icon>mdi-cog</v-icon> Restore {{ channel.label }} channel options
                                </v-btn>
                            </template>
                        </template>

                    </booking-channel-reservation-form>

                </template>
                <template v-else >
                    <booking-channel-reservation-form
                    v-model="channelConfiguration.reservation_form"
                    @input="v => Object.assign(form, v)"
                    :setting="setting"
                    :edit="!reservationCheckedIn"
                    :property="property"
                    >
                        <template v-if="fields.includes('balance')" #start>
                            <v-text-field
                                outlined
                                dense
                                label="Booking balance"
                                type="number"
                                name="balance"
                                v-model="form.balance"
                                :disabled="reservationCheckedIn"
                                :prefix="form.currency"
                                :rules="[(v) => parseInt(v) < 0 ? 'Invalid amount' : true]"
                            >
                            </v-text-field>
                        </template>

                    </booking-channel-reservation-form>
                </template>

              <error-handler :error="error.reservation" :can-retry="false" />

            </data-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                :disabled="booting"
                color="primary"
                @click.prevent="submit"
                :loading="loading"
                depressed
            >
                Save Reservation
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import moment from 'moment';
import { mapActions, mapGetters } from 'vuex';
import formValidation from '@/helper/formValidation';
import DataContainer from '../../../components/DataContainer.vue';
import BookingChannelSelect from '../../Property/Components/PropertyBookingChannelSelect.vue';
import BookingChannelReservationForm from '../../Property/Components/BookingChannelReservationForm.vue'
import CREATE_RESERVATION from '../Mutations/createReservation';
import UPDATE_RESERVATION from '../Mutations/updateReservation';
import GET_PROPERTY_RESERVATION_SETTING from '../../Property/Queries/getPropertyReservationSetting';
import ErrorHandler from "@/components/ErrorHandler.vue";

export default {
    name: "ReservationForm",
    components: {
      ErrorHandler,
        DataContainer,
        BookingChannelSelect,
        BookingChannelReservationForm
    },

    defaultSetting: {},

    data(){
        return {
            dialog: false,
            mode: 'create',
            loading: false,
            rules: formValidation.rules,
            form: {},
            setting: {},
            booting: false,
            error: {
                init: null,
                reservation: null
            },
            editChannelConfig: false,
            channel: null,
            setting_channel_config: false,
            channelConfiguration: {},
        }
    },
    props: {
        property: Object,
        reservation: Object
    },

    computed: {
        ...mapGetters([
            'current_user'
        ]),

        minCheckinDate(){
            if (this.mode === 'edit' && moment(this.reservation.checkin_date).diff(moment(), 'days') < 1) {
                return this.reservation.checkin_date;
            } 
            return moment().format('YYYY-MM-DD');
        },

        minCheckoutDate(){
            if(this.form.checkin_date) {
                return  moment(this.form.checkin_date).add(1, 'day').format('YYYY-MM-DD');
            } 
            return moment().add(1, 'day').format('YYYY-MM-DD')
        },

        stayDuration() {
            if(this.form.checkin_date && this.form.checkout_date) {
                const checkin = moment(this.form.checkin_date);
                const checkout = moment(this.form.checkout_date);
                return checkout.diff(checkin, 'days');
            }
            return 0;
        },

        reservationCheckedIn(){
            if(!this.reservation) return false;
            return this.reservation.already_checkedin
        },

        fields() {
            return this.setting && this.setting.fields ? this.setting.fields : [];
        },

        reservationChannelForm() {
            return this.channelConfiguration.reservation_form;
        },

         reservationChannelOptions() {
            return this.channelConfiguration.options;
        }

    },

    methods: {

        ...mapActions([
            'query',
            'mutate'
        ]),

        setForm() {
            const reservation = this.reservation;
            if(reservation){
                this.form = {
                    name: reservation.name,
                    phone: reservation.phone,
                    email: reservation.email,
                    balance: reservation.balance ? parseFloat(reservation.balance) : 0,
                    room: reservation.room,
                    booking_reference: reservation.booking_reference,
                    booking_channel: reservation.booking_channel ? reservation.booking_channel.id : null,
                    checkin_date: reservation.checkin_date,
                    checkout_date: reservation.checkout_date,

                    currency: reservation.currency ? reservation.currency : (this.setting.payment_gateway === 'paystack' ? 'NGN' : this.property.currency),
                    instruction: reservation.instruction,
                    charges: reservation.charges,
                    agreements: reservation.agreements,
                    questions: reservation.questions,
                    require_id_verification: reservation.require_id_verification,
                    require_credit_card: reservation.require_credit_card,
                    allow_additional_guest: reservation.allow_additional_guest,
                    auto_checkin_approval: reservation.auto_checkin_approval,
                    send_checkin_mail: reservation.send_checkin_mail,
                    checkin_mail: reservation.checkin_mail,
                }

                this.channel = reservation.booking_channel;
                this.editChannelConfig = !reservation.already_checkedin;
                this.mode = 'edit';
                
                this.channelConfiguration.reservation_form = {};
                Object.assign(this.channelConfiguration.reservation_form, this.form)
                
            }else{
                this.form = {
                    name: null,
                    room: null,
                    balance: 0,
                    currency: this.setting.payment_gateway === 'paystack' ? 'NGN' : this.property.currency,
                    booking_reference: null,
                    booking_channel: null,
                    phone: null,
                    email: null,
                    checkin_date: this.today,
                    checkout_date: this.today,
                    instruction: null,
                    charges: [] ,
                    agreements: [],
                    questions: [],
                    require_id_verification: false,
                    require_credit_card: false, 
                    allow_additional_guest: this.setting.allow_additional_guest,
                    auto_checkin_approval: this.setting.auto_checkin_approval,
                    send_checkin_mail: this.setting.send_checkin_mail,
                    checkin_mail: this.setting.checkin_mail,
                }
            }
        },

        submit(){         
            
            if(!this.$refs.form.validate()) {
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: 'Some fields are not filled correctly yet.',
                    color: 'error'
                })
                return;
            }

            if(!this.form.checkin_date || !this.form.checkin_date) {
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: 'Checkin and checkout dates are required',
                    color: 'error'
                })
                return;
            }
            
            this.form.balance = parseFloat(this.form.balance);

            if(this.mode === 'edit') this.updateReservation();
            else this.createReservation();
        },

        createReservation() {
            this.loading = true;
            this.mutate({
                variables: {
                    property_id: this.property.id,
                    data: this.form,
                },
                mutation: CREATE_RESERVATION
            })
            .then(response => {
               const reservation = response.data.createReservation;
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: 'Reservation created',
                    color: 'success'
                })
                this.$refs.form.reset();
                this.$emit('reservation-created', reservation);
                this.$router.push({
                  name: 'property.reservation.show',
                  params: {
                    property: this.property.id,
                    reservation: reservation.id,
                  }
              })
            })
            .catch(e => {
                this.error.reservation = e;
                this.$emit('error', e);
            })
            .finally(() => this.loading = false)
        },

        updateReservation() {
            this.loading = true;
            this.mutate({
                mutation: UPDATE_RESERVATION,
                variables: {
                    id: this.reservation.id,
                    data: this.form
                },
            })
            .then(response => {
                 this.$store.commit('SNACKBAR', {
                    status: true,
                    text: 'Reservation updated',
                    color: 'success'
                })
               this.$emit('reservation-updated', true);
            })
            .catch(e => {
                this.error.reservation = e;
                this.$emit('error', e);
            })
            .finally(() => this.loading = false )
        },

        currencySelected(currency) {
            this.form.charges = this.form.charges.filter(charge => charge.currency === currency)
        },

        getSetting() {
            return new Promise((resolve, reject) => {
                this.query({
                    query: GET_PROPERTY_RESERVATION_SETTING,
                    variables: {
                        id: this.property.id
                    }
                })
                .then(response => resolve(response.data.getPropertyById?.reservation_settings || {}))
                .catch(e => reject(e))
            })
        },

        init() {
            this.booting = true;
            this.error.init = null;
            this.channel = null;
            this.getSetting().then(setting => {
                this.setting = setting;
                this.setChannelConfiguration();
                this.setForm();
            })
            .catch(e => this.error.init = e)
            .finally(() => this.booting = false)
        },

        setChannelConfiguration() {
            if(!this.channel) return;
            let config =  null;
            if(this.channel.label === 'Other') {
                config =  this.setting.channel_configurations.find(config => config.id === 'other');
            } else{
                config =  this.setting.channel_configurations.find(config => config.id === this.channel.id);
            }
            this.channelConfiguration = config ? config : {};
        },

        useDefaultChannelConfig() {
            this.setting_channel_config = true;
            this.getSetting().then(setting => {
                this.setting = setting;
                this.setChannelConfiguration();
                this.editChannelConfig = false;
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: this.channel ? `Default configuration for ${this.channel.label} applied` : `Default configuration applied`,
                    color: 'success'
                });

            })
            .finally(() => {
                this.setting_channel_config = false;
            });       
        }

    },

    watch: {
        property: {
            immediate: true,
            handler(property) {
                if(property) this.init()
            }
        },

        reservation: {
            immediate: true,
            handler(){
                this.setForm();
            }
        },

        channel: {
            immediate: true,
            handler(channel) {
                if(channel) {
                    this.form.booking_channel = channel.id;
                    this.editChannelConfig = false;
                    if(this.setting && this.setting.channel_configurations && this.setting.channel_configurations.length) {
                       this.setChannelConfiguration();
                    }
                }
            }
        },
        reservationFormOptions: {
          immediate: true,
          handler(form) {
            if (form) {
              Object.assign(this.form, form)
            }
          }
        }
    }
}
</script>