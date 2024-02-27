<template>
     <v-card :loading="loading" flat>
        <confirmation-dialog ref="deleteConfirmation" @confirmed="deleteTemplate">
            <div class="text-center mt-5">
                <p>
                    Are you sure you want to delete the template
                </p>
                <h4>{{ data_template.title }}</h4>
            </div>
        </confirmation-dialog>
        <v-card-title class="d-flex flex-nowrap justify-space-between">
            <h4 class="text-truncate">{{ data_template.title }}</h4>
            <div class="d-flex">
                <v-btn v-if="template" @click="edit = !edit" icon>
                    <v-icon v-html="edit ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
                </v-btn>
                <v-btn color="error" icon @click="$refs.deleteConfirmation.open()">
                    <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
            </div>
        </v-card-title>
        <v-card-text v-if="edit">
            <property-checkin-instruction-template-form
            :template="data_template"
            :property="property"
            @updated="templateUpdated"
            @cancel="edit = false"
              />
        </v-card-text>
    </v-card>
</template>

<script>
import PropertyCheckinInstructionTemplateForm from './PropertyCheckinInstructionTemplateForm';
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog';
import DELETE_TEMPLATE from '../Mutations/deletePropertyCheckinInstructionTemplate';

export default {
    name: "PropertyCheckinInstructionTemplate",
    props: {
        property: Object,
        template: Object,
    },
    data(){
        return {
            loading: false,
            edit: false,
            data_template: {},
        }
    },
    components: {
        PropertyCheckinInstructionTemplateForm, ConfirmationDialog
    },

    methods: {
        templateUpdated(template){
            this.data_template = template;
            this.edit = false;
        },

        deleteTemplate() {
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: DELETE_TEMPLATE,
                variables: {
                    property_id: this.property.id,
                    template_id: this.data_template.id,
                }
            }).then(response => {
                if(response.data.deletePropertyCheckinInstructionTemplate) {
                    this.$emit('deleted', this.data_template)
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        text: `Template deleted`,
                        color: 'success'
                    });
                }
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.deleteTemplate(),
                    message: 'Could not delete template. ',
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
        template: {
            immediate: true,
            handler(template){
                this.data_template = template
            }
        }
    }
}
</script>