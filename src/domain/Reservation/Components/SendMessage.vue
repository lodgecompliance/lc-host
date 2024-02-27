<template>
     <v-dialog
        v-model="dialog"
        width="500"
        scrollable
        persistent
        >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
            color="primary"
            dark
            v-bind="attrs"
            v-on="on"
            text
            >
            <slot>Send Message</slot>
            </v-btn>
        </template>
        <v-card>
            <v-card-title class="headline">
                <span>Message Guest</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text >
                <v-alert v-if="error" 
                border="left"
                colored-border
                type="info"
                class="my-2"
                >
                    {{ error }}
                </v-alert>
                <v-form ref="form" class="pt-5" @submit.prevent>
                    <v-select
                    outlined dense
                    placeholder="Channel"
                    :items="channels"
                    item-text="label"
                    item-value="value"
                    :item-disabled="channel => channel.disabled"
                    :rules="[rules.required]"
                    v-model="form.via"
                    >
                    </v-select>

                    <v-text-field
                        v-if="form.via === 'mail'"
                        outlined dense
                        :label="`Email`"
                        :rules="[rules.required, rules.email]"
                        v-model="form.to.email"
                    >
                    </v-text-field>

                    <v-text-field
                        v-else-if="form.via === 'sms' || form.via === 'whatsapp'"
                        outlined dense
                        :label="`Email`"
                        :rules="[rules.required, rules.email]"
                        v-model="form.to.email"
                    >
                    </v-text-field>
                   
                    <v-text-field
                        outlined dense
                        :label="`Subject`"
                        :rules="[rules.required]"
                        v-model="form.subject"
                    >
                    </v-text-field>

                    <reservation-message-editor
                    v-model="form.message"
                    :reservation="reservation"
                    :rules="[rules.required]"
                    >
                        <v-btn color="primary" small text @click="composeCheckinMessage" depressed>checkin message</v-btn>
                    </reservation-message-editor>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red" @click="dialog = false" text>Cancel</v-btn>
                <v-btn @click.prevent="submit" color="primary" :loading="sending" depressed>Send Message</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import gql from 'graphql-tag';
import { mapActions } from 'vuex';
import formValidation from '@/helper/formValidation';

import ReservationMessageEditor from './ReservationMessageEditor.vue';

export default {
    name: "SendReservationMessage",
    components: {
        ReservationMessageEditor
    },
    props: {
        reservation: Object,
        subject: String,
        message: String,
    },
    data(){
        return {
            dialog: false,
            error: null,
            sending: false,
            form: {
                via: null,
                subject: null,
                message: null,
                to: {
                    email: null,
                    phone: null,
                }
            },
            rules: formValidation.rules,
           
        }
    },
    computed: {
        channels() {
            return [
                {
                    label: 'Mail',
                    value: 'mail',
                    disabled: false
                },
                {
                    label: 'SMS',
                    value: 'sms',
                    disabled: true
                },
                {
                    label: 'WhatsApp',
                    value: 'whatsapp',
                    disabled: true
                }
            ]
        }
    },
    methods: {
        ...mapActions([
            'mutate'
        ]),

        composeCheckinMessage() {
            if(!this.reservation.checkin_mail || this.reservation.checkin_mail == "") {
                this.$store.commit("SNACKBAR", {
                    status: true,
                    text: "No checkin mail set for reservation",
                    color: "error"
                });
                return;
            }
            this.form.subject = `Reservation checkin at ${this.reservation.property.property.name}`
            this.form.message = this.reservation.checkin_mail;
        },

        submit2() {
            if(!this.$refs.form.validate()) return;

            this.sending = true;
            this.mutate({
                mutation: gql`
                    mutation sendReservationCheckinMail ($id: ID!) {
                        sendReservationCheckinMail(id: $id) 
                    }`,
                variables: {
                    id: this.reservation.id
                }
            })
            .then(response => {
                const sent = response.data.sendReservationCheckinMail;
                this.$store.commit("SNACKBAR", {
                    status: true,
                    text: sent ? "Checkin mail sent" : "Checkin mail not sent",
                    color: sent ? "success" : "error"
                });
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    message: `Could not send checkin mail.`,
                    retry: () => this.sendCheckinMail(),
                    exception: e
                })
            })
            .finally(() => {
                this.sending = false;
            })
        },

        submit() {
            if(!this.$refs.form.validate()) return;

            this.sending = true;
            this.mutate({
                mutation: gql`
                    mutation sendReservationMessage ($id: ID!, $data: ReservationMessageInput!) {
                        sendReservationMessage(id: $id, data: $data) 
                    }`,
                variables: {
                    id: this.reservation.id,
                    data: this.form
                }
            })
            .then(response => {
                const sent = response.data.sendReservationMessage;
                this.$store.commit("SNACKBAR", {
                    status: true,
                    text: sent ? "Message sent" : "Message not sent",
                    color: sent ? "success" : "error"
                });

                if(sent) this.dialog = false;
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    message: `Could not send message.`,
                    retry: () => this.submit(),
                    exception: e
                })
            })
            .finally(() => {
                this.sending = false;
            })
        }
    },
    watch: {
        reservation: {
            immediate: true,
            handler(reservation) {
                if(reservation) {
                    this.form.to = {
                        email: reservation.email,
                        phone: reservation.phone,
                    }
                }
            }
        }
    }
}
</script>