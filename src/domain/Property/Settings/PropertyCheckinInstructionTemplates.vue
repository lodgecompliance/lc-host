<template>
    <section>
      <div class="d-flex flex-wrap justify-space-between">
        <slot name="heading" />
        <v-dialog v-model="createNewTemplate" width="400px" scrollable>
          <template #activator="{ on }">
            <v-btn
                color="primary"
                title="New Instruction"
                v-on="on" depressed>
              <v-icon dark> mdi-plus</v-icon> Create New
            </v-btn>
          </template>
          <property-checkin-instruction-template-form
              class="my-2"
              :property="property"
              @created="templateCreated"
              @cancel="createNewTemplate = false" >
            <template #header>
              <v-card-title>
                <h2 class="headline">New Agreement</h2>
                <v-spacer></v-spacer>
                <v-btn icon @click="createNewTemplate = false"><v-icon>mdi-close</v-icon></v-btn>
              </v-card-title>
            </template>
          </property-checkin-instruction-template-form>
        </v-dialog>
      </div>
       <data-container :loading="loading" :error="error" @retry="getTemplates">
            <template v-slot:loading>
                <div  v-for="i in 4" :key="i">
                    <v-skeleton-loader
                        type="card"
                        height="50"
                        class="my-2"
                    ></v-skeleton-loader>
                </div>
            </template>

            <template v-if="templates.length">
                <property-checkin-instruction-template 
                v-for="template in templates" :key="template.id"
                :property="property"
                :template="template"
                @deleted="templateDeleted"
                class="my-1" />
            </template>
            <template v-else>
                <div class="py-5 text-center">
                    <p class="grey--text">No instruction yet</p>
                </div>
            </template>
        </data-container>
    </section>

</template>
<script>
import DataContainer from '../../../components/DataContainer.vue';
import PropertyCheckinInstructionTemplateForm from '../Components/PropertyCheckinInstructionTemplateForm';
import PropertyCheckinInstructionTemplate from '../Components/PropertyCheckinInstructionTemplate';

import GET_PROPERTY_CHECKIN_INSTRUCTION_TEMPLATES from '../Queries/getPropertyCheckinInstructionTemplates';

export default {
    name: "PropertyCheckinInstructionTemplates",
    components: {
        DataContainer,
        PropertyCheckinInstructionTemplate,
        PropertyCheckinInstructionTemplateForm,
    },

    props: {
        property: Object
    },

    data(){
        return {
            loading: false,
            error: null,
            createSecurityDeposit: false,
            createNewTemplate: false,
            templates: [],
        }
    },  

    methods: {
        getTemplates(){
            this.loading = true;
           
             this.$store.dispatch('query', {
                query: GET_PROPERTY_CHECKIN_INSTRUCTION_TEMPLATES,
                variables: {
                    id: this.property.id
                }
            })
            .then(response => {
                this.templates = response.data.getPropertyById?.checkin_instructions
            })
            .catch(e => {
                this.error = e
            })
            .finally(() => {
                this.loading = false;
            })
        },

        templateCreated(template){
            this.templates.unshift(template);
            this.createNewTemplate = false;
        },

        templateDeleted(template) {
            const index = this.templates.findIndex(t => t.id === template.id);
            if(index >= 0) this.templates.splice(index, 1);
        }
    },

    watch: {
        property: {
            immediate: true,
            handler(property){
                if(property) this.getTemplates()
                else this.loading = false;
            }
        }
    }
}
</script>