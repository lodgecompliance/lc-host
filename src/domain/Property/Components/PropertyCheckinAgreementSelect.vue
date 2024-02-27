<template>
    <div>
        <property-agreement-list v-if="preview" :agreements="selected" >
            <template #list-item-content="{ agreement }">
                <slot name="list-item-content" v-bind="{ agreement }"></slot>
            </template>
        </property-agreement-list>
        
        <slot name="after-selected" v-bind="{ selected }" /> 
        <div v-if="changeable">
            <v-autocomplete 
                :loading="loading"
                :items="items"
                v-on="$listeners"
                v-bind="$attrs"
                v-model="selected"
                :no-data-text="`${loading ? 'Please wait...': `No agreement.`}`"
            >
            
                <template v-slot:item="{ item, on }">

                    <v-list-item v-on="on">
                        <v-list-item-action>
                            <v-checkbox :input-value="selected.map(s => s.id).includes(item.id)"></v-checkbox>
                        </v-list-item-action>
                        <v-list-item-content>
                        <v-list-item-title>{{ item.agreement }}</v-list-item-title>
                        <v-list-item-subtitle v-if="item.link">{{ item.link }}</v-list-item-subtitle>
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
                    title="create new agreement"
                    small text
                    class="mt-n10"
                    >
                    <v-icon>mdi-plus</v-icon> Add New Agreement
                    </v-btn>
                </template>
                  <property-agreement-form
                  :property="property"
                  @created="agreementCreated"
                  @cancel="createDialog = false"
                  class="mt-2"
                  >
                    <template #header>
                      <v-card-title>
                        <h4>New Agreement</h4>
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
                  </property-agreement-form>
                </v-dialog>
        </div>
    </div>
</template>

<script>

import PropertyAgreementForm from './PropertyAgreementForm.vue';
import PropertyAgreementList from './PropertyAgreementList.vue'
import GET_PROPERTY_CHECKIN_AGREEMENTS from '../Queries/getPropertyCheckinAgreements';

export default {
    name: "PropertyCheckinAgreementSelect",
    components: {
        PropertyAgreementForm, PropertyAgreementList
    },
    props: {
        property: Object,
        agreements: Array,
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
        getPropertyAgreements(){
            if(this.agreements){
                this.items = this.agreements;
                return;
            }
            this.loading = true;
            this.$store.dispatch('query', {
                query: GET_PROPERTY_CHECKIN_AGREEMENTS,
                variables: {
                    property_id: this.property.id
                }
            })
            .then(response => {
                this.items = response.data.getPropertyCheckinAgreements ? response.data.getPropertyCheckinAgreements  : []
            })
            .finally(() => {
                this.loading = false;
            })
        },

        agreementCreated(agreement) {
            this.items.push(agreement);
            if("multiple" in this.$attrs){
                this.selected.push(agreement);
            } else {
                this.selected = [agreement];
            }
            this.createDialog = false;
        }
    },

    watch: {     
        value: {
            immediate: true,
            handler(agreements) {
                if(!agreements) this.selected = [];
                else this.selected = agreements instanceof Array ? agreements : [agreements]
            }
        },   
        
        property: {
            immediate: true,
            handler(property){
                if(property) this.getPropertyAgreements();
            }
        }
    }

}
</script>