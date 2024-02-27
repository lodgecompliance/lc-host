<template>
    <v-dialog
        v-model="open"
        max-width="550"
        scrollable
        persistent
        >
        <v-card >
            <v-card-title class="primary white--text">
                <h4><v-icon class="mr-2" color="white">mdi-attachment</v-icon> <slot name="heading">Attachment {{ attachment.type ?  attachment.type : '' }}</slot></h4>
                <v-spacer></v-spacer>
                <v-btn
                icon
                dark
                @click="$emit('close')"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="pt-5">
                <v-form ref="attachmentForm">
                    <v-select
                    v-model="attachment.type"
                    :items="types"
                    :rules="[rules.required]"
                    item-text="label"
                    item-value="value"
                    outlined dense
                    label="Attachment Type"
                    ></v-select>

                    <div v-if="attachment.type === 'Agreement'" class="my-2" >
                        <property-agreement-select
                            :property="property"
                            item-text="agreement"
                            v-model="attachment.attachments"
                            label="Attach Agreement"
                            return-object
                            outlined dense
                            small-chips
                            :create-new="true"
                            :changeable="true"
                            multiple
                        />
                    </div>
                            
                    <div v-if="attachment.type === 'Charge'" class="my-2">
                        <property-charges-select
                            outlined dense
                            label="Attach Charge"
                            v-model="attachment.attachments"
                            :property="property"
                            small-chips
                            return-object
                            :create-new="true"
                            :changeable="true"
                            :allowedCurrency="allowedCurrency"
                            multiple
                        />
                    </div>

                    <div v-if="attachment.type === 'Question'" class="my-2">
                        <property-checkin-question-select
                            :property="property"
                            item-text="question"
                            v-model="attachment.attachments"
                            label="Attach Question"
                            return-object
                            outlined dense
                            small-chips
                            :create-new="true"
                            :changeable="true"
                            :allow-attachment="false"
                            :blacklist="questionBlacklist"
                            :parent-question="(parent || {}).question"
                            :is-follow-up="true"
                            multiple
                        />
                    </div>
                </v-form>
               
            </v-card-text>
            <v-card-actions>
                <v-btn text color="red" @click="cancel">Cancel</v-btn>
                <v-btn color="primary" @click="done">
                    Done
                </v-btn>
            </v-card-actions>
        </v-card>
        
    </v-dialog>
</template>

<script>
import formValidation from '@/helper/formValidation';
import PropertyAgreementSelect from './PropertyCheckinAgreementSelect.vue';
import PropertyChargesSelect from './PropertyChargesSelect.vue';

export default {
    name: "PropertyAttachmentForm",
    components: {
        PropertyAgreementSelect, PropertyChargesSelect
    },
    props: {
        property: Object,
        value: {},
        open: Boolean,
        parent: Object,
        allowedCurrency: String
    },
    data() {
        return {
            rules: formValidation.rules,
            types: [
                'Agreement', 'Charge', 'Question'
            ],
            attachment: {},
        }
    },
    computed: {
        agreementBlacklist() {
           return this.parent && this.parent.agreement ? [this.parent.agreement] : []
       },

       chargeBlacklist() {
           return this.parent && this.parent.charge ? [this.parent.charge] : []
       },

       questionBlacklist() {
           return this.parent && this.parent.question ? [this.parent.question] : []
       },
    },

    methods:{
        reset() {
            this.attachment = {
                type: null,
                attachments: [],
            }
        },

        done() {
            if(!this.$refs.attachmentForm.validate()) {
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Fields incorrectly filled`,
                    color: 'success'
                });
                return;
            }

            else this.$emit('input', this.attachment)
            
            this.$emit('close');
        },

        cancel() {
            this.$emit('close');
        }

    },
    watch: {

        value: {
            immediate: true,
            handler(value) {
                if(value) {
                    this.attachment = value
                } else {
                    this.reset();
                }
            }
        },
        open: {
            immediate: true,
            handler(open) {
                if(!open && this.$refs.attachmentForm) this.$refs.attachmentForm.reset()
            }
        }
    }
}
</script>