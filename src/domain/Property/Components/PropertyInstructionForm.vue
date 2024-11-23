<template>
  <v-card flat :loading="loading">
    <slot name="header" />
    <v-card-text class="pt-3">
      <v-form ref="form">
        <v-text-field
            outlined dense
            label="Instruction title"
            :rules="[rules.required, (value) => rules.max(value, 40)]"
            type="text"
            v-model="form.title"
            counter="40"
        ></v-text-field>
        <div>
            <v-textarea
            outlined dense
            label="Text"
            v-model="form.body"
            :rules="[rules.required]"
            ></v-textarea>
        </div>
      </v-form>
    </v-card-text>
    <v-card-actions>
        <v-btn text color="red" @click="$emit('cancel')">Cancel</v-btn>
        <v-btn color="primary" :loading="loading" @click="submit" depressed>Save Instruction</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import formValidation from '@/helper/formValidation';

import CREATE_PROPERTY_CHECKIN_INSTRUCTION from '../Mutations/createPropertyCheckinInstruction';
import UPDATE_PROPERTY_CHECKIN_INSTRUCTION from '../Mutations/updatePropertyCheckinInstruction';

export default {
    name: "PropertyInstructionForm",
    components: {
        
    },
    props: {
        instruction: Object,
        property: Object,
    },
    data(){
        return {
            rules: formValidation.rules,
            form: {
                title: null,
                body: null,
            },
            loading: false,
        }
    },

    methods: {
        submit(){
            if(!this.$refs.form.validate()) return;
            
            if(this.instruction) this.updateInstruction();
            else this.createInstruction();
        },

        createInstruction(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: CREATE_PROPERTY_CHECKIN_INSTRUCTION,
                variables: {
                    property_id: this.property.id,
                    title: this.form.title,
                    body: this.form.body,
                }
            }).then(response => {
                this.$emit('created', response.data.createPropertyCheckinInstruction);

                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Instruction created`,
                    color: 'success'
                });
                this.$refs.form.reset();
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.createInstruction(),
                    message: 'Could not create instruction. ',
                    exception: e
                })
                this.$emit('error', e);
            })
            .finally(() => {
                this.loading = false;
            })
        },

        updateInstruction(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: UPDATE_PROPERTY_CHECKIN_INSTRUCTION,
                variables: {
                    property_id: this.property.id,
                    instruction_id: this.instruction.id,
                    data: this.form
                }
            }).then(response => {
                this.$emit('updated', response.data.updatePropertyCheckinInstruction);
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Instruction updated`,
                    color: 'success'
                });
                this.edit = false;
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.updateInstruction(),
                    message: 'Could not update instruction. ',
                    exception: e
                })
                this.$emit('error', e);
            })
            .finally(() => {
                this.loading = false;
            })

        },

    },

    watch: {
        instruction: {
            immediate: true,
            handler(instruction){
                if(instruction) {
                    this.form = {
                        title: instruction.title,
                        body: instruction.body,
                    };
                }
            }
        },
    }
}
</script>