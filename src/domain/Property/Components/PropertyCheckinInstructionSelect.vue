<template>
    <v-autocomplete 
        :loading="loading"
        :items="items"
        item-text="title"
        item-value="id"
        @change="templateSelected"
        v-bind="$attrs"
        :menu-props="{closeOnContentClick:true}"
        :no-data-text="`${loading ? 'Please wait...': `No instruction.`}`"
    >
    
    <template v-slot:item="{ item }">

        <v-list-item  three-line>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.body }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
                <v-icon @click="templateSelected(item)" color="primary">mdi-content-copy</v-icon>
            </v-list-item-action>
        </v-list-item>

    </template>
    <!-- <template v-slot:selection="{ item }">

    </template> -->
    </v-autocomplete>
</template>

<script>

import GET_PROPERTY_CHECKIN_INSTRUCTION from '../Queries/getPropertyCheckinInstructions';

export default {
    name: "PropertyCheckinInstructionTemplateSelect",

    props: {
        property: Object,
        templates: Array,
    },

    data(){
        return {
            loading: false,
            items: [],
            selected: null
        }
    },

    computed: {
        
    },

    methods: {
        getPropertyTemplates(){
            if(this.templates){
                this.items = this.templates;
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
                this.items = response?.data?.getPropertyById?.checkin_instructions || []
            })
            .finally(() => {
                this.loading = false;
            })
        },

        templateSelected(template) {
            this.$emit('input', template);
            this.selected = null;
        }
    },

    watch: {
        
        property: {
            immediate: true,
            handler(property){
                if(property) this.getPropertyTemplates();
            }
        }
    }

}
</script>