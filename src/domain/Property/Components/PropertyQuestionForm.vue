<template>
  <v-card v-bind="$attrs" flat :loading="loading">
      <slot name="header" />
      <v-card-text>
        <v-form ref="form">
          <v-text-field
              outlined dense
              label="Question"
              :rules="[rules.required]"
              type="text"
              v-model="form.question"
          ></v-text-field>
          <v-select
          v-model="form.response_type"
          :items="response_types"
          :rules="[rules.required]"
          item-text="label"
          item-value="value"
          outlined dense
          label="Response Type"
          ></v-select>

          <template v-if="form.response_type === 'options'">
              <div v-for="(option, o) in form.options" :key="o">
                  <div class="my-2">
                      <property-checkin-question-option
                      :property="property"
                      :question="question"
                      :option="option"
                      :index="o+1"
                      v-model="form.options[o]"
                      :allowAttachment="allowAttachment && !!question"
                      :allowedCurrency="allowedCurrency"
                      >
                          <template #actions>
                              <v-spacer></v-spacer>
                              <v-btn small text title="Remove option" color="error" @click="form.options.splice(o, 1)">
                                  <v-icon small>mdi-delete</v-icon> Remove
                              </v-btn>
                          </template>
                        <template #option-attachment>
                          <slot name="option-attachment" />
                        </template>
                      </property-checkin-question-option>
                  </div>
              </div>
              <v-btn color="primary" small text @click="addOption">
                  <v-icon>mdi-plus</v-icon> Add option
              </v-btn>
          </template>

          <v-switch dense inset v-model="form.required" label="Make compulsory" color="primary"></v-switch>

        </v-form>
      </v-card-text>
      <v-card-actions>
          <v-btn text color="red" @click="$emit('cancel')">Cancel</v-btn>
          <v-btn color="primary" @click="submit" :loading="loading" depressed>
              Save Question
          </v-btn>
      </v-card-actions>
  </v-card>
</template>

<script>
import formValidation from '@/helper/formValidation';
import PropertyCheckinQuestionOption from './PropertyCheckinQuestionOption.vue';

import CREATE_PROPERTY_CHECKIN_QUESTION from '../Mutations/createPropertyCheckinQuestion';
import UPDATE_PROPERTY_CHECKIN_QUESTION from '../Mutations/updatePropertyCheckinQuestion';

export default {
    name: "PropertyQuestionForm",
    components: {
        PropertyCheckinQuestionOption
    },
    props: {
        question: Object,
        property: Object,
        allowAttachment: {
            default: true,
        },
        allowedCurrency: String,
        parentQuestion: Object
    },
    data(){
        return {
            loading: false,
            rules: formValidation.rules,
            form: {
                question: null,
                options: [],
                required: false,
                response_type: null,
                parent_question: null,
            },
            response_types: [
                {
                    label: 'Text',
                    value: 'text',
                },
                {
                    label: 'Number',
                    value: 'number',
                },
                {
                    label: 'Date',
                    value: 'date',
                },
                {
                    label: 'Time',
                    value: 'time',
                },
                {
                    label: 'Multiple choice',
                    value: 'options',
                }
            ]
        }
    },

    methods: {
        addOption(){
          this.form.options.push({ option: null});
        },

        submit(fullSubmit = true){
            if(!this.$refs.form.validate()) {
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Fields are not correctly filled`,
                    color: 'error'
                });
                return;
            }

            if(this.form.response_type === 'options' && this.form.options.length < 2) {
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Multiple choice question needs atleast two options`,
                    color: 'error'
                });
                return;
            }
            
            if(this.parentQuestion) this.form.parent_question = this.parentQuestion.id
            if(this.question) this.updateQuestion();
            else this.createQuestion();
        },
        
        createQuestion(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: CREATE_PROPERTY_CHECKIN_QUESTION,
                variables: {
                    property_id: this.property.id,
                    data: this.form
                }
            }).then(response => {
                this.$emit('created',  response.data.createPropertyCheckinQuestion);

                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Question created`,
                    color: 'success'
                });
                this.$refs.form.reset();
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.createQuestion(),
                    message: 'Could not create question. ',
                    exception: e
                })
                this.$emit('error', e);
            })
            .finally(() => {
                this.loading = false;
            })
        },

        updateQuestion(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: UPDATE_PROPERTY_CHECKIN_QUESTION,
                variables: {
                    property_id: this.property.id,
                    question_id: this.question.id,
                    data: this.form
                }
            }).then(response => {
                this.$emit('updated', response.data.updatePropertyCheckinQuestion );
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Question updated`,
                    color: 'success'
                });
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.updateQuestion(),
                    message: 'Could not update question. ',
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
        question: {
            immediate: true,
            handler(question){
                if(question) {
                    this.form = {
                        question: question.question,
                        options: question.options ? question.options : [],
                        required: question.required,
                        response_type: question.response_type,
                    };
                }
            }
        },
    }
}
</script>