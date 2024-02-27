<template>
    <v-form ref="agreementForm">
        <v-card :loading="loading" flat>
            <confirmation-dialog ref="deleteConfirmation" @confirmed="deleteAgreement">
                <div class="text-center mt-5">
                    <p>
                        Are you sure you want to delete the checkin agreement
                    </p>
                    <h4>{{ data_agreement.agreement }}</h4>
                </div>
            </confirmation-dialog>

            <v-card-title class="d-flex flex-nowrap justify-space-between">
                <h4 class="text-truncate">{{ data_agreement.agreement }}</h4>
                <div class="d-flex flex-nowrap">
                    <v-btn v-if="agreement" @click="edit = !edit" icon><v-icon v-html="edit ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon></v-btn>
                    <v-btn color="error" icon @click="$refs.deleteConfirmation.open()">
                        <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                </div>
            </v-card-title>
            <v-card-text v-if="edit">
                <property-agreement-form 
                :property="property" 
                :agreement="data_agreement" 
                @updated="agreementUpdated"
                @cancel="edit = false"
                  />
            </v-card-text>
        </v-card>
    </v-form>
</template>

<script>
import formValidation from '@/helper/formValidation';

import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog';
import PropertyAgreementForm from './PropertyAgreementForm.vue'
import DELETE_PROPERTY_CHECKIN_AGREEMENT from '../Mutations/deletePropertyCheckinAgreement';

export default {
    name: "PropertyCheckinAgreement",
    components: {
        ConfirmationDialog, PropertyAgreementForm
    },
    props: {
        agreement: Object,
        property: Object,
        collapse: Boolean,
    },
    data(){
        return {
            rules: formValidation.rules,
            edit: false,
            data_agreement: {},
            loading: false
        }
    },

    methods: {

        agreementUpdated(agreement) {
            this.data_agreement = agreement;
            this.edit = false;
        },

        deleteAgreement() {
            if(!this.data_agreement.id) {
                this.$emit('removed', this.data_agreement)
                return;
            }

            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: DELETE_PROPERTY_CHECKIN_AGREEMENT,
                variables: {
                    property_id: this.property.id,
                    agreement_id: this.data_agreement.id,
                }
            }).then(response => {
                if(response.data.deletePropertyCheckinAgreement) {
                    this.$emit('removed', this.data_agreement)
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        text: `Agreement deleted`,
                        color: 'success'
                    });
                }
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.deleteAgreement(),
                    message: 'Could not delete agreement. ',
                    exception: e
                })
                this.$emit('error', e);
            })
            .finally(() => {
                this.loading = false;
            })
        }

    },

    watch: {
        agreement: {
            immediate: true,
            handler(agreement){
                this.data_agreement = agreement;
            }
        },

        collapse: {
            handler(collapse) {
                this.edit = !collapse;
            }
        },
        
    }
}
</script>