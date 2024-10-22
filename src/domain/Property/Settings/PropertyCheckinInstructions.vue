<template>
    <section>
      <div class="d-flex flex-wrap justify-space-between">
        <slot name="heading" />
        <v-dialog v-model="createNew" width="400px" scrollable>
          <template #activator="{ on }">
            <v-btn
                color="primary"
                title="New Instruction"
                v-on="on" depressed>
              <v-icon dark> mdi-plus</v-icon> Create New
            </v-btn>
          </template>
          <property-checkin-instruction-form
              class="my-2"
              :property="property"
              @created="instructionCreated"
              @cancel="createNew = false" >
            <template #header>
              <v-card-title>
                <h2 class="headline">New Instruction</h2>
                <v-spacer></v-spacer>
                <v-btn icon @click="createNew = false"><v-icon>mdi-close</v-icon></v-btn>
              </v-card-title>
            </template>
          </property-checkin-instruction-form>
        </v-dialog>
      </div>
       <data-container :loading="loading" :error="error" @retry="getInstructions">
            <template v-slot:loading>
                <div  v-for="i in 4" :key="i">
                    <v-skeleton-loader
                        type="card"
                        height="50"
                        class="my-2"
                    ></v-skeleton-loader>
                </div>
            </template>

            <template v-if="instructions.length">
                <property-checkin-instruction
                    v-for="template in instructions" :key="template.id"
                    :property="property"
                    :instruction="template"
                    @deleted="instructionDeleted"
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
import PropertyCheckinInstructionForm from '../Components/PropertyCheckinInstructionForm.vue';
import PropertyCheckinInstruction from '../Components/PropertyCheckinInstruction.vue';

import GET_PROPERTY_CHECKIN_INSTRUCTIONS from '../Queries/getPropertyCheckinInstructions';

export default {
    name: "PropertyCheckinInstructionTemplates",
    components: {
        DataContainer,
        PropertyCheckinInstruction,
        PropertyCheckinInstructionForm,
    },

    props: {
        property: Object
    },

    data(){
        return {
            loading: false,
            error: null,
            createNew: false,
            instructions: [],
        }
    },  

    methods: {
        getInstructions(){
            this.loading = true;
             this.$store.dispatch('query', {
                query: GET_PROPERTY_CHECKIN_INSTRUCTIONS,
                variables: {
                    id: this.property.id
                }
            })
            .then(response => {
                this.instructions = response.data.getPropertyById?.checkin_instructions
            })
            .catch(e => {
                this.error = e
            })
            .finally(() => {
                this.loading = false;
            })
        },

        instructionCreated(template){
            this.instructions.unshift(template);
            this.createNew = false;
        },

        instructionDeleted(template) {
            const index = this.instructions.findIndex(t => t.id === template.id);
            if(index >= 0) this.instructions.splice(index, 1);
        }
    },

    watch: {
        property: {
            immediate: true,
            handler(property){
                if(property) this.getInstructions()
                else this.loading = false;
            }
        }
    }
}
</script>