<template>
    <section>
      <div class="d-flex flex-wrap justify-space-between">
        <slot name="heading" />
        <v-dialog v-model="createNew" width="400px" scrollable>
          <template #activator="{ on }">
            <v-btn
                color="primary"
                title="New Question"
                v-on="on" depressed>
              <v-icon dark> mdi-plus</v-icon> Create New
            </v-btn>
          </template>
          <property-checkin-question-form
              :property="property"
              :allow-attachment="false"
              @created="questionCreated"
              @cancel="createNew = false"
              class="my-1">
            <template #header>
              <v-card-title>
                <h2 class="headline">New Question</h2>
                <v-spacer></v-spacer>
                <v-btn icon @click="createNew = false"><v-icon>mdi-close</v-icon></v-btn>
              </v-card-title>
            </template>
            <template #option-attachment>
              <small class="grey--text">You can attach charges, agreement and question when question is saved </small>
            </template>
          </property-checkin-question-form>
        </v-dialog>
      </div>
        <data-container :loading="loading" :error="error" @retry="getQuestions">
          <template v-slot:loading>
              <div  v-for="i in 4" :key="i">
                  <v-skeleton-loader
                      type="card"
                      height="50"
                      class="my-2"
                  ></v-skeleton-loader>
              </div>
          </template>
          <div v-if="questions.length">
              <property-checkin-question v-for="question in questions"
              :key="question.id"
              :question="question"
              :property="property"
              :active="lastCreated && question.id === lastCreated.id"
              @removed="questionRemoved" class="my-1" >
                <template #parent-question="{ id }">
                  <small v-show="!!id">Follow up question to {{ id }}</small>
                </template>
              </property-checkin-question>
          </div>
          <div  v-else class="py-5 text-center">
              <p class="grey--text">No question</p>
          </div>
        </data-container>
    </section>
</template>
<script>
import DataContainer from '../../../components/DataContainer.vue';
import PropertyCheckinQuestion from '../Components/PropertyCheckinQuestion.vue';
import PropertyCheckinQuestionForm from '../Components/PropertyQuestionForm.vue';
import GET_PROPERTY_CHECKIN_QUESTIONS from '../Queries/getPropertyCheckinQuestions';
import formValidation from '@/helper/formValidation';
export default {
    name: "PropertyCheckinQuestions",
    components: {
        DataContainer, PropertyCheckinQuestion,
        PropertyCheckinQuestionForm
    },
    props: {
        property: Object
    },

    data(){
        return {
            loading: false,
            error: null,
            questions: [],
            collapseAll: false,
            createNew: false,
            lastCreated: null,
        }
    },  

    methods: {
        getQuestions(){
            this.loading = true;
            this.error = null;
             this.$store.dispatch('query', {
                query: GET_PROPERTY_CHECKIN_QUESTIONS,
                variables: {
                    id: this.property.id
                }
            })
            .then(response => {
                this.questions  = (response?.data?.getPropertyById?.checkin_questions || [])
                    .filter(q => !q.parent_question);
            })
            .catch(e => {
                this.error = e
            })
            .finally(() => {
                this.loading = false;
            })
        },

        addNewQuestion(){
            this.questions.push({
                question: null,
                options: [],
                required: false,
            });
        },

        questionCreated(question) {
            this.questions.unshift(question);
            this.createNew = false;
            this.lastCreated = question;
        },

        questionRemoved(question) {
            const index = this.questions.findIndex(q => q.id === question.id);
            if(index >= 0) this.questions.splice(index, 1);
        }
    },

    watch: {
        property: {
            immediate: true,
            handler(property){
                if(property) this.getQuestions()
                else this.loading = false;
            }
        }
    }
}
</script>