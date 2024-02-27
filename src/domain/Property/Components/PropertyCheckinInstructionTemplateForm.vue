<template>
    <v-card v-bind="$attrs" flat>
        <slot name="header" />
        <v-card-text class="px-0">
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
            <v-btn type="submit" color="primary" :loading="loading">Save</v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
import CREATE_PROPERTY_CHECKIN_INSTRUCTION_TEMPLATE from '../Mutations/createPropertyCheckinInstructionTemplate';
import UPDATE_PROPERTY_CHECKIN_INSTRUCTION_TEMPLATE from '../Mutations/updatePropertyCheckinInstructionTemplate';
import formValidation from '@/helper/formValidation';

export default {
    name: "PropertyCheckinInstructionTemplateForm",
    props: {
        property: Object,
        template: Object,
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
            if(this.template) this.updateInstructionTemplate();
            else this.createInstructionTemplate();
        },

        createInstructionTemplate(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: CREATE_PROPERTY_CHECKIN_INSTRUCTION_TEMPLATE,
                variables: {
                    property_id: this.property.id,
                    ...this.form
                }
            }).then(response => {
                const template = response.data.createPropertyCheckinInstructionTemplate;
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
                    retry: () => this.createProperty(),
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
                mutation: UPDATE_PROPERTY_CHECKIN_INSTRUCTION_TEMPLATE,
                variables: {
                    property_id: this.property.id,
                    template_id: this.template.id,
                    ...this.form
                }
            }).then(response => {
                const template = response.data.updatePropertyCheckinInstructionTemplate
                this.$emit('updated',  template)
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `${template.title} instruction updated`,
                    color: 'success'
                })
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.createProperty(),
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
        template: {
            immediate: true,
            handler(template){
                if(template){
                    this.form = {
                        title: template.title,
                        body: template.body
                    }
                }
                
            }
        },
    }
}
</script>