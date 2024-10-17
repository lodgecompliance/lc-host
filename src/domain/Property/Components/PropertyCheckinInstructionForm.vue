<template>
    <v-card v-bind="$attrs" flat>
        <slot name="header" />
        <v-card-text class="pt-3">
            <v-form ref="form">
                <v-text-field
                    outlined dense
                    label="Title"
                    :rules="[rules.required]"
                    type="text"
                    v-model="form.title"
                ></v-text-field>

                <v-textarea
                outlined dense
                label="Body"
                :rules="[rules.required]"
                v-model="form.body"
                ></v-textarea>
            </v-form>
        </v-card-text>

        <v-card-actions>
            <v-btn text color="red" @click="$emit('cancel')">Cancel</v-btn>
            <v-btn type="submit" color="primary" depressed :loading="loading" @click="submit">Save</v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
import CREATE_PROPERTY_CHECKIN_INSTRUCTION from '../Mutations/createPropertyCheckinInstruction';
import UPDATE_PROPERTY_CHECKIN_INSTRUCTION from '../Mutations/updatePropertyCheckinInstruction';
import formValidation from '@/helper/formValidation';

export default {
    name: "PropertyCheckinInstructionForm",
    props: {
        property: Object,
        instruction: Object,
    },
    data(){
        return {
            loading: false,
            rules: formValidation.rules,
            form: {
                title: null,
                body: null,
            },
        }
    },
    methods: {
        submit(){
            if(!this.$refs.form.validate()) return;
            if(this.instruction) this.updateInstructionTemplate();
            else this.createInstructionTemplate();
        },

        createInstructionTemplate(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: CREATE_PROPERTY_CHECKIN_INSTRUCTION,
                variables: {
                    property_id: this.property.id,
                    ...this.form
                }
            }).then(response => {
                const template = response.data.createPropertyCheckinInstruction;
                this.$emit('created', template);
                this.$refs.form.reset();
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `${template.title} instruction created`,
                    color: 'success'
                })
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.createInstructionTemplate(),
                    message: 'Could not create instruction. ',
                    exception: e
                })
                this.$emit('error', e);
            })
            .finally(() => {
                this.loading = false;
            })
        },

        updateInstructionTemplate(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: UPDATE_PROPERTY_CHECKIN_INSTRUCTION,
                variables: {
                    property_id: this.property.id,
                    instruction_id: this.instruction.id,
                    ...this.form
                }
            }).then(response => {
                const instruction = response.data.updatePropertyCheckinInstruction
                this.$emit('updated',  instruction)
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `${instruction.title} instruction updated`,
                    color: 'success'
                })
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.updateInstructionTemplate(),
                    message: 'Could not update instruction. ',
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
                if(instruction){
                    this.form = {
                        title: instruction.title,
                        body: instruction.body
                    }
                }
                
            }
        },
    }
}
</script>