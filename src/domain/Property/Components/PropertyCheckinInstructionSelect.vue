<template>
  <div>
    <property-instruction-list v-if="preview" :instructions="selected" >
      <template #list-item-content="{ instruction }">
        <slot name="list-item-content" v-bind="{ instruction }"></slot>
      </template>
    </property-instruction-list>

    <slot name="after-selected" v-bind="{ selected }" />
    <div v-if="changeable">
      <v-autocomplete
          :loading="loading"
          :items="items"
          v-on="$listeners"
          v-bind="$attrs"
          v-model="selected"
          :no-data-text="`${loading ? 'Please wait...': `No instruction.`}`"
      >

        <template v-slot:item="{ item, on }">
          <v-list-item v-on="on">
            <v-list-item-action>
              <v-checkbox :input-value="selected.map(s => s.id).includes(item.id)"></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
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
              title="create new instruction"
              small text
              class="mt-n10"
          >
            <v-icon>mdi-plus</v-icon> Add New Instruction
          </v-btn>
        </template>
        <property-instruction-form
            :property="property"
            @created="instructionCreated"
            @cancel="createDialog = false"
            class="mt-2"
        >
          <template #header>
            <v-card-title>
              <h4>New Instruction</h4>
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
        </property-instruction-form>
      </v-dialog>
    </div>
  </div>
</template>

<script>

import GET_PROPERTY_CHECKIN_INSTRUCTION from '../Queries/getPropertyCheckinInstructions';
import PropertyInstructionList from "@/domain/Property/Components/PropertyInstructionList.vue";
import PropertyInstructionForm from "@/domain/Property/Components/PropertyInstructionForm.vue";

export default {
    name: "PropertyCheckinInstructionTemplateSelect",
  components: {PropertyInstructionList, PropertyInstructionForm},

    props: {
      property: Object,
      instructions: Array,
      value:{},
      createNew: Boolean,
      preview: Boolean,
      changeable: Boolean
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
    },

    methods: {

      getPropertyInstructions(){
        if(this.instructions){
          this.items = this.instructions;
          return;
        }
        this.loading = true;
        this.$store.dispatch('query', {
          query: GET_PROPERTY_CHECKIN_INSTRUCTION,
          variables: {
            id: this.property.id
          }
        })
            .then(response => {
              this.items = response?.data?.getPropertyById?.checkin_instructions || [];
            })
            .finally(() => {
              this.loading = false;
            })
      },

      instructionCreated(instruction) {
        this.items.push(instruction);
        if("multiple" in this.$attrs){
          this.selected.push(instruction);
        } else {
          this.selected = [instruction];
        }
        this.createDialog = false;
      },

    },

  watch: {
    value: {
      immediate: true,
      handler(instructions) {
        if(!instructions) this.selected = [];
        else this.selected = instructions instanceof Array ? instructions : [instructions]
      }
    },

    property: {
      immediate: true,
      handler(property){
        if(property) this.getPropertyInstructions();
      }
    }
  }

}
</script>