<template>
     <v-card :loading="loading" flat>
        <confirmation-dialog ref="deleteConfirmation" @confirmed="deleteInstruction">
            <div class="text-center mt-5">
                <p>
                    Are you sure you want to delete the instruction
                </p>
                <h4>{{ data_instruction.title }}</h4>
            </div>
        </confirmation-dialog>
        <v-card-title class="d-flex flex-nowrap justify-space-between">
            <h4 class="text-truncate">{{ data_instruction.title }}</h4>
            <div class="d-flex">
                <v-btn v-if="instruction" @click="edit = !edit" icon>
                    <v-icon v-html="edit ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
                </v-btn>
                <v-btn color="error" icon @click="$refs.deleteConfirmation.open()">
                    <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
            </div>
        </v-card-title>
        <v-card-text v-if="edit">
            <property-checkin-instruction-form
            :instruction="data_instruction"
            :property="property"
            @updated="instructionUpdated"
            @cancel="edit = false"
              />
        </v-card-text>
    </v-card>
</template>

<script>
import PropertyCheckinInstructionForm from './PropertyCheckinInstructionForm.vue';
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog';
import DELETE_INSTRUCTION from '../Mutations/deletePropertyCheckinInstruction';

export default {
    name: "PropertyCheckinInstruction",
    props: {
        property: Object,
        instruction: Object,
    },
    data(){
        return {
            loading: false,
            edit: false,
            data_instruction: {},
        }
    },
    components: {
      PropertyCheckinInstructionForm, ConfirmationDialog
    },

    methods: {
        instructionUpdated(instruction){
            this.data_instruction = instruction;
            this.edit = false;
        },

        deleteInstruction() {
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: DELETE_INSTRUCTION,
                variables: {
                    property_id: this.property.id,
                    instruction_id: this.data_instruction.id,
                }
            }).then(response => {
                if(response.data.deletePropertyCheckinInstruction) {
                    this.$emit('deleted', this.data_instruction)
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        text: `Instruction deleted`,
                        color: 'success'
                    });
                }
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.deleteInstruction(),
                    message: 'Could not delete instruction. ',
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
        instruction: {
            immediate: true,
            handler(instruction){
                this.data_instruction = instruction
            }
        }
    }
}
</script>