<template>
<div>
    <property-charge-list v-if="preview" :charges="selected">
        <template #list-item-action="charge">
            <v-icon  v-if="charge.type === 'pre-authorize' && stayDuration > 7" v-on="on" color="warning">
                mdi-alert
            </v-icon>
            <slot name="list-item-action" v-bind="{ charge }"></slot>
        </template>
        <template #list-item-content="{ charge }">
            <slot name="list-item-content" v-bind="{ charge }"></slot>
        </template>
    </property-charge-list>

    <slot name="after-selected" v-bind="{ selected }" /> 
    
    <div v-if="changeable">
        <v-autocomplete 
        :loading="loading"
        :items="filterdItems"
        item-text="title"
        v-on="$listeners"
        v-bind="$attrs"
        v-model="selected"
        :no-data-text="`${loading ? 'Please wait...' : `${allowedCurrency ? `No charge in ${allowedCurrency}` : `Select a currency first`}` }`"
        >
    
            <template v-slot:item="{ item, on }">

                <v-list-item v-on="on" :disabled="!item.enable || ( item.type === 'pre-authorize' && disallowPreauthorized)">
                    <v-list-item-action>
                    <v-checkbox :input-value="selected.map(s => s.id).includes(item.id)"></v-checkbox>
                    </v-list-item-action>

                    <v-list-item-content>
                        <v-list-item-title> {{ item.title }} - {{ item.type }} <span v-show="item.optional"> (optional) </span></v-list-item-title>
                        <v-list-item-subtitle>{{ item.description }}</v-list-item-subtitle>
                        <v-list-item-subtitle>{{ getUnit(item) }}</v-list-item-subtitle>
                        <slot name="dropdown-list-item-content" v-bind="{ item }"></slot>
                    </v-list-item-content>

                    <h4 class="mt-2">{{ item.currency }}{{ item.amount }}</h4>
                </v-list-item>

            </template>

        </v-autocomplete>
        <v-dialog
            v-if="createNew"
            v-model="createDialog"
            max-width="450"
            scrollable
            persistent
            >
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
                title="create new charge"
                small text
                class="mt-n10"
                >
                <v-icon>mdi-plus</v-icon> Add New Charge
                </v-btn>
            </template>
          <property-charge-form
              :property="property"
              @created="chargeCreated"
              @cancel="createDialog = false"
              :prefill="{
                        type: 'instant',
                        enable: true,
                        currency: allowedCurrency ? allowedCurrency : property.currency,
                        }"
              :read-only="newChargeReadOnly"
              class="mt-2" >
            <template #header>
              <v-card-title>
                <h4>New Charge</h4>
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
          </property-charge-form>
        </v-dialog>
    </div>
</div>
 
</template>

<script>

import GET_PROPERTY_CHARGES from '../Queries/getPropertyCharges';
import PropertyChargeForm from './PropertyChargeForm.vue';
import PropertyChargeList from './PropertyChargeList.vue';

export default {
    name: "PropertyChargesSelect",
    components: {
        PropertyChargeForm, PropertyChargeList
    },
    props: {
        property: Object,
        charges: Array,
        value:{},
        createNew: Boolean,
        allowedCurrency: String,
        preview: Boolean,
        changeable: Boolean,
        disallowPreauthorized: {
            type: Boolean,
            default: () => false
        }
    },

    data(){
        return {
            loading: false,
            items: [],
            selected: [],
            createDialog: false,
            units: {
                one_off: 'One Off',
                per_night: 'Night',
                per_day: 'Day',
                per_guest: 'Guest'
            }
        }
    },

    computed: {
        filterdItems() {
            if(!this.allowedCurrency) return [];
            let items = this.items
            items = this.items.filter(item => item.currency === this.allowedCurrency);
            return items.filter(item => item.enable);
        },

        newChargeReadOnly() {
            const ro = [];
            if(this.allowedCurrency) ro.push('currency');
            if(this.disallowPreauthorized) ro.push('type');
            return ro;
        },

          
    },

    methods: {
        getPropertyCharges(){
            if(this.charges){
                this.items = this.charges;
                return;
            }
            this.loading = true;
            this.$store.dispatch('query', {
                query: GET_PROPERTY_CHARGES,
                variables: {
                    id: this.property.id
                }
            })
            .then(response => {
                this.items = response?.data?.getPropertyById?.charges || [];
            })
            .finally(() => {
                this.loading = false;
            })
        },

        chargeCreated(charge) {
            this.items.push(charge);
            if("multiple" in this.$attrs){
                this.selected.push(charge);
            } else {
                this.selected = [charge];
            }
            this.createDialog = false;
            this.$emit('input', this.selected)
        },

        getUnit(charge) {
            let multipliers = [];
            
            if(charge.unit && charge.unit !== 'Stay') {
                multipliers.push({
                    unit: charge.unit
                })
            }
            if(charge.multipliers) {
                multipliers = multipliers.concat(charge.multipliers);
            }
            return multipliers.map(m => `per ${m.unit}`).join(', ');
        } 
    },

    mounted(){
        
    },

    watch: {
        value: {
            immediate: true,
            handler(charges) {
                if(!charges) this.selected = []
                else this.selected = charges instanceof Array ? charges : [charges]
            }
        },
        property: {
            immediate: true,
            handler(property){
                if(property) this.getPropertyCharges();
            }
        }
    }

}
</script>