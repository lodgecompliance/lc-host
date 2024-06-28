<template>
  <v-card flat :loading="loading">
    <slot name="header" />
    <v-card-text>
      <v-form ref="form">
        <v-text-field
            outlined dense
            label="Agreement title"
            :rules="[rules.required, (value) => rules.max(value, 40)]"
            type="text"
            v-model="form.agreement"
            counter="40"
        ></v-text-field>

        <div v-if="useLink">
            <v-text-field
                dense
                label="URL to agreement"
                type="url"
                :rules="[rules.required, rules.url]"
                v-model="form.link"
                placeholder="https://example.com/agreement"
                clearable
            >
            </v-text-field>
            <a href="#" @click.prevent="useLink = false">Use text</a>
        </div>
        <div v-else>
            <v-textarea
            outlined dense
            label="Text"
            v-model="form.text"
            :rules="[]"
            ></v-textarea>

            <a v-if="!useLink" href="#" @click.prevent="useLink = true">Use link</a>
        </div>
      </v-form>
    </v-card-text>
    <v-card-actions>
        <v-btn text color="red" @click="$emit('cancel')">Cancel</v-btn>
        <v-btn color="primary" :loading="loading" @click="submit" depressed>Save Agreement</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import formValidation from '@/helper/formValidation';

import CREATE_PROPERTY_CHECKIN_AGREEMENT from '../Mutations/createPropertyCheckinAgreement';
import UPDATE_PROPERTY_CHECKIN_AGREEMENT from '../Mutations/updatePropertyCheckinAgreement';

export default {
    name: "PropertyAgreementForm",
    components: {
        
    },
    props: {
        agreement: Object,
        property: Object,
    },
    data(){
        return {
            rules: formValidation.rules,
            form: {
                agreement: null,
                text: null,
                link: null,
            },
            loading: false,
            useLink: false
        }
    },

    methods: {
        submit(){
            if(!this.$refs.form.validate()) return;
            
            if(this.agreement) this.updateAgreement();
            else this.createAgreement();
        },

        createAgreement(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: CREATE_PROPERTY_CHECKIN_AGREEMENT,
                variables: {
                    property_id: this.property.id,
                    data: this.form
                }
            }).then(response => {
                this.$emit('created', response.data.createPropertyCheckinAgreement);

                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Agreement created`,
                    color: 'success'
                });
                this.$refs.form.reset();
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.createAgreement(),
                    message: 'Could not create agreement. ',
                    exception: e
                })
                this.$emit('error', e);
            })
            .finally(() => {
                this.loading = false;
            })
        },

        updateAgreement(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: UPDATE_PROPERTY_CHECKIN_AGREEMENT,
                variables: {
                    property_id: this.property.id,
                    agreement_id: this.agreement.id,
                    data: this.form
                }
            }).then(response => {
                this.$emit('updated', response.data.updatePropertyCheckinAgreement);

                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Agreement updated`,
                    color: 'success'
                });

                this.edit = false;
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.updateAgreement(),
                    message: 'Could not update agreement. ',
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
        agreement: {
            immediate: true,
            handler(agreement){
                if(agreement) {
                    this.form = {
                        agreement: agreement.agreement,
                        text: agreement.text,
                        link: agreement.link
                    };
                    this.useLink =  agreement.link !== null;
                }
            }
        },
    }
}
</script>