<template>
     <v-card :loading="loading" flat>
        <confirmation-dialog ref="deleteConfirmation" @confirmed="deleteCharge">
            <div class="text-center mt-5">
                <p>
                    Are you sure you want to delete the charge
                </p>
                <h4>{{ data_charge.title }}</h4>
            </div>
        </confirmation-dialog>
        <v-card-title class="d-flex flex-nowrap justify-space-between">
            <h4 class="text-truncate">{{ data_charge.title }}</h4>
            <div class="d-flex">
                <v-btn v-if="charge" @click="edit = !edit" icon>
                    <v-icon v-html="edit ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
                </v-btn>
                <v-btn color="error" icon @click="$refs.deleteConfirmation.open()">
                    <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
            </div>
        </v-card-title>
        <v-card-text v-if="edit">
            <property-charge-form 
            :charge="data_charge" 
            :disabled="$attrs.disabled" 
            :property="property" 
            @updated="chargeUpdated"  />
        </v-card-text>
    </v-card>
</template>

<script>
import PropertyChargeForm from './PropertyChargeForm';
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog';

import DELETE_PROPERTY_CHARGE from '../Mutations/deletePropertyCharge';

export default {
    name: "PropertyCharge",
    props: {
        property: Object,
        charge: Object,
    },
    data(){
        return {
            loading: false,
            edit: false,
            data_charge: {},
        }
    },
    components: {
        PropertyChargeForm, ConfirmationDialog
    },

    methods: {
        chargeUpdated(charge){
            this.data_charge = charge;
            this.edit = false;
        },

        deleteCharge() {
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: DELETE_PROPERTY_CHARGE,
                variables: {
                    property_id: this.property.id,
                    charge_id: this.data_charge.id,
                }
            }).then(response => {
                if(response.data.deletePropertyCharge) {
                    this.$emit('deleted', this.data_charge)
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        text: `Charge deleted`,
                        color: 'success'
                    });
                }
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.deleteCharge(),
                    message: 'Could not delete charge. ',
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
        charge: {
            immediate: true,
            handler(charge){
                this.data_charge = charge
            }
        }
    }
}
</script>