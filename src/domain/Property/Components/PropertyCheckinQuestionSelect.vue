<template>
    <div>
        <property-question-list v-if="preview" :questions="selected">
            <template #list-item-content="{ question }">
                <slot name="list-item-content" v-bind="{ question }"></slot>
            </template>
        </property-question-list>

        
        <div v-if="changeable">
            <v-autocomplete 
                :loading="loading"
                :items="filteredItems"
                v-on="$listeners"
                v-bind="$attrs"
                v-model="selected"
                :no-data-text="`${loading ? 'Please wait...': `No question.`}`"
            >
                <template v-slot:item="{ item, on }">
                    <v-list-item 
                    v-on="on" 
                    :disabled="!allowAttachment && withAttachments.map(q => q.id).includes(item.id)">
                        <v-list-item-action>
                            <v-checkbox :input-value="selected.map(s => s.id).includes(item.id)"></v-checkbox>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>{{ item.question }}</v-list-item-title>
                            <v-list-item-subtitle>
                              <span v-show="item.response_type !== 'options'">{{ item.response_type }}</span>
                              <span v-show="item.response_type === 'options'">{{ item.options.length }} options</span>
                            </v-list-item-subtitle>
                            <v-list-item-subtitle v-if="!allowAttachment && withAttachments.map(q => q.id).includes(item.id)" class="red--text">
                              <small>Can not use question with attachment</small>
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </template>
            </v-autocomplete>
            <v-dialog
                v-if="createNew"
                v-model="createDialog"
                max-width="350"
                scrollable
                persistent
                >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    color="primary"
                    dark
                    v-bind="attrs"
                    v-on="on"
                    title="create new question"
                    small text
                    class="mt-n10"
                    >
                    <v-icon>mdi-plus</v-icon> Add New Question
                    </v-btn>
                </template>
                  <property-question-form
                  :property="property"
                  :allowAttachment="allowAttachment"
                  :allowedCurrency="allowedCurrency"
                  :parent-question="parentQuestion"
                  @created="questionCreated"
                  @cancel="createDialog = false"
                  class="mt-2"
                  >
                    <template #header>
                      <v-card-title >
                        <h4>New Question</h4>
                        <v-spacer></v-spacer>
                        <v-btn
                            icon
                            dark
                            @click="createDialog = false"
                        >
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </v-card-title>
                    </template>
                  </property-question-form>
            </v-dialog>
        </div>
    </div>
</template>

<script>

import GET_PROPERTY_CHECKIN_QUESTIONS from '../Queries/getPropertyCheckinQuestions';
import PropertyQuestionForm from './PropertyQuestionForm.vue';
import PropertyQuestionList from './PropertyQuestionList.vue';

export default {
    name: "PropertyCheckinQuestionSelect",
    components: {
        PropertyQuestionForm, PropertyQuestionList
    },

    props: {
        property: Object,
        questions: Array,
        value:{},
        createNew: Boolean,
        preview: Boolean,
        changeable: Boolean,
        allowAttachment: {
            default: true
        },
        blacklist: {
            type: Array,
            default: ()  => []
        },
        allowedCurrency: String,
        isFollowUp: Boolean,
        parentQuestion: Object
    },

    data(){
        return {
            loading: false,
            items: [],
            selected: [],
            createDialog: false,
        }
    },

    computed: {
        filteredItems() {
            return this.items.filter(question => {
                return !this.blacklist.map(q => q.id).includes(question.id);
            }).filter(question => {
                if(!this.allowedCurrency) return true;
                if(question.response_type === 'options' && question.options.length) {
                    return question.options.every(option => {
                        if(option.attachments && option.attachments.charges &&  option.attachments.charges.length) {
                            return option.attachments.charges.every(charge => charge.currency === this.allowedCurrency)
                        }
                        return true;
                    })
                }
                return true;
            }).filter(question => {
              return this.parentQuestion
                  ? question.parent_question === this.parentQuestion.id
                  : !question.parent_question;
            })
        },

        withAttachments() {
            return this.filteredItems.filter(question => {
                if(question.response_type === 'options' && question.options.length) {
                    return question.options.some(option => {
                        return option.attachments 
                        && ((option.attachments.agreements && option.attachments.agreements.length)
                        || (option.attachments.charges &&  option.attachments.charges.length) 
                        || (option.attachments.questions && option.attachments.questions.length));
                    })
                }
                return false;
            })
        }
    },

    methods: {
        getPropertyQuestions(){
            if(this.questions){
                this.items = this.questions;
                return;
            }
            this.loading = true;
            this.$store.dispatch('query', {
                query: GET_PROPERTY_CHECKIN_QUESTIONS,
                variables: {
                    property_id: this.property.id
                }
            })
            .then(response => {
                this.items = response.data.getPropertyCheckinQuestions ? response.data.getPropertyCheckinQuestions  : []
            })
            .finally(() => {
                this.loading = false;
            })
        },

        questionCreated(question) {
            this.items.push(question);

           if("multiple" in this.$attrs){
                this.selected.push(question);
            } else {
                this.selected = [question];
            }
            this.createDialog = false;
        },

    },

    watch: {  
        value: {
            immediate: true,
            handler(questions) {
                if(!questions) this.selected = []
                else this.selected = questions instanceof Array ? questions : [questions]
            }
        },      
        property: {
            immediate: true,
            handler(property){
                if(property) this.getPropertyQuestions();
            }
        }
    }

}
</script>