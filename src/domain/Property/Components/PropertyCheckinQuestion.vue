<template>
    <v-form ref="questionForm">
        <v-card :loading="loading"> 
            <confirmation-dialog ref="deleteConfirmation" @confirmed="deleteQuestion">
                <div class="text-center mt-5">
                    <p>
                        Are you sure you want to delete the checkin question
                    </p>
                    <h4>{{ data_question.question }}</h4>
                </div>
            </confirmation-dialog>

            <v-card-title class="d-flex flex-nowrap justify-space-between">
              <div>
                <h4 class="text-truncate">{{ data_question.question }}</h4>
              </div>
                <div class="d-flex">
                    <v-btn v-if="question" @click="edit = !edit" icon><v-icon v-html="edit ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon></v-btn>
                    <v-btn color="error" icon @click="$refs.deleteConfirmation.open()">
                        <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                </div>
            </v-card-title>
            <v-card-subtitle>
              <slot name="parent-question" v-bind="{ id: data_question.parent_question }">
                <small v-show="data_question.parent_question">Follow up question to {{ data_question.parent_question }}</small>
              </slot>
            </v-card-subtitle>
            <v-card-text v-if="edit">
                <property-question-form 
                :property="property"
                :question="data_question"
                @updated="questionUpdated"
                @cancel="edit = false"
                />
            </v-card-text>
        </v-card>
    </v-form>
</template>

<script>
import formValidation from '@/helper/formValidation';
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog';
import PropertyQuestionForm from './PropertyQuestionForm.vue';

import DELETE_PROPERTY_CHECKIN_QUESTION from '../Mutations/deletePropertyCheckinQuestion';

export default {
    name: "PropertyCheckinQuestion",
    components: {
        PropertyQuestionForm, ConfirmationDialog
    },
    props: {
        question: Object,
        property: Object,
        active: Boolean,
    },
    data(){
        return {
            rules: formValidation.rules,
            edit: false,
            data_question: {},
            loading: false
        }
    },

    methods: {
        questionUpdated(question) {
            this.data_question = question;
            this.edit = false;
        },

        deleteQuestion() {
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: DELETE_PROPERTY_CHECKIN_QUESTION,
                variables: {
                    property_id: this.property.id,
                    question_id: this.data_question.id,
                }
            }).then(response => {
                if(response.data.deletePropertyCheckinQuestion) {
                    this.$emit('removed', this.data_question)
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        text: `Question deleted`,
                        color: 'success'
                    });
                }
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.deleteQuestion(),
                    message: 'Could not delete question. ',
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
        active: {
          immediate: true,
          handler(active) {
            this.edit = active
          }
        },
        question: {
            immediate: true,
            handler(question){
                this.data_question = question;
            }
        },
    }
}
</script>