<template>
    <v-form ref="form" @submit.prevent>
        <v-select 
        label="Select channel to configure"
        :items="supportedChannels"
        v-model="active"
        item-text="label"
        return-object
        clearable
        outlined
        dense
        >
        </v-select>
        <template  v-if="active">
            <div class="mb-3 d-flex flex-wrap">
                <h3 class="text-h6 mr-2">Configuration for reservations from {{ active.label }} channel</h3>
                <v-btn v-if="!edit" text small color="primary" @click="edit = true">
                  <v-icon size="16">mdi-pencil</v-icon> Modify Config
                </v-btn>
            </div>
            <booking-channel-reservation-form
            v-if="!edit"
            v-model="form"
            :channel="active"
            :setting="setting"
            :edit="edit"
            :property="property"
            >
                <template #booking-balance>
                    <h4>Allow booking balance</h4>
                    <p>{{ options.can_pay_balance ? 'YES' : 'NO' }}</p>
                </template>
            </booking-channel-reservation-form>
            <v-dialog
            v-model="edit"
            width="600"
            scrollable 
            >
                <booking-channel-reservation-form
                v-model="form"
                :channel="active"
                :setting="setting"
                :edit="edit"
                :property="property"
                >
                    <template #header>
                        <v-card-title class="primary white--text">
                            <h4>{{ active.label }} Channel</h4> 
                        </v-card-title>
                    </template> 

                    <template #start>
                        <v-switch
                            v-model="options.can_pay_balance"
                            inset
                            :label="`Can pay reservation balance`"
                            :disabled="!edit"
                            >
                        </v-switch>
                    </template>
                    <template  #actions>
                        <v-btn color="primary" @click="saveConfiguration()">
                            <v-icon>mdi-check</v-icon> Done
                        </v-btn>
                    </template>
                </booking-channel-reservation-form>
            </v-dialog>
        </template>
    </v-form>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

import BookingChannelReservationForm from '../Components/BookingChannelReservationForm.vue'

export default {
    name: "BookingChannelConfiguration",
    components: {
        BookingChannelReservationForm
    },

    data(){
        return {
            active: null,
            edit: false,
            form: {},
            options: {},
            configurations: []
        }
    },
    props: {
        property: Object,
        value: Array,
        channel: Object,
        setting: Object,
        supportedChannels: Array
    },

    computed: {
        ...mapGetters([
            'current_user'
        ]),

        fields() {
            return this.setting.fields ?? [];
        },

        questionHasAnyChargeAttachment() {
            if(!this.form.question || !this.form.question.length) return false;
            return this.form.questions.some(question => {
                if(question.response_type == 'options' && question.options && question.options.length) {
                    return question.options.some(option => option.attachments && option.attachments.charges && option.attachments.charges.length)
                }
                return false;
            })
        },

        dialogAttributes() {
            if(!this.edit) return {};

            return {
                'width': 500,
            }
        }

    },

    methods: {

        ...mapActions([
            'query',
            'mutate'
        ]),
        ...mapMutations([
            'TOAST_ERROR'
        ]),

        setForm() {
            const config = this.active ? this.configurations.find(config => config.id == this.active.id) : null;
            this.form = config ? config.reservation_form : null;
            const options = config ? config.options: null;
            this.options = options ? options : {
              can_pay_balance: this.setting.fields.includes('balance')
            };
        },

        setConfigurations() {
            this.configurations = this.supportedChannels.map( channel => {
                if(this.active && this.active.id == channel.id) {
                    return {
                        ...channel,
                        options: this.options,
                        reservation_form: this.form
                    }
                }
                
                const config = this.value ? this.value.find(c => c.id == channel.id) : null;

                return config ? config : {
                    ...channel,
                };
            })
        },

        saveConfiguration() {
            this.edit = false;
            this.setConfigurations();
            this.$emit('input', this.configurations)
        }

    },


    watch: {

        // value: {

        //     immediate: true,
        //     handler(configs) {
        //         this.configurations = configs;
        //     }
        // },


        supportedChannels: {
            immediate: true,
            handler() {
                this.setConfigurations();
            }
        },

        active: {
            immediate: true,
            handler(channel){
                this.setForm();
                this.setConfigurations();
                this.$emit('input', this.configurations)
                this.$emit('active-channel', channel);
                this.edit = false;
            }
        },

        
    }
}
</script>