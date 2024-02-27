<template>
    <v-card v-bind="$attrs" flat :loading="loading">
        <slot name="header" />
        <v-card-text>
          <v-form ref="form" @submit.prevent="submit">
            <v-radio-group v-model="form.type"
            dense
            label="Charge Type"
            :rules="[rules.required]"
            :readonly="readOnly.includes('type')">
                <v-radio
                    label="Instant"
                    value="instant"
                ></v-radio>
                <v-radio
                    label="Pre-authorize"
                    value="pre-authorize"
                ></v-radio>
            </v-radio-group>
            <v-text-field
                outlined dense
                label="Title"
                :rules="[rules.required]"
                type="text"
                v-model="form.title"
                :readonly="readOnly.includes('title')"
            ></v-text-field>
            <v-row>
                <v-col cols="12" md="4">
                    <currency-select
                    :rules="[rules.required]"
                    labellabel="Currency"
                    v-model="form.currency"
                    outlined dense
                    :readonly="readOnly.includes('currency')" />
                </v-col>

                <v-col  cols="12" md="8">
                    <v-text-field
                        outlined dense
                        label="Amount"
                        :prefix="form.currency"
                        type="number"
                        :rules="[rules.required, (value) => value > 0 || 'Enter a valid amount']"
                        v-model="form.amount"
                        :readonly="readOnly.includes('amount')"
                    >
                    </v-text-field>
                </v-col>
            </v-row>

            <v-textarea
            outlined dense
            label="Description"
            :rules="[rules.required]"
            v-model="form.description"
            :readonly="readOnly.includes('description')"
            ></v-textarea>
            <v-select
            v-model="form.unit"
            :items="units"
            item-text="label"
            item-value="value"
            outlined dense
            label="Charge unit"
            ></v-select>

            <v-card v-for="(multiplier, i) in form.multipliers" :key="i"
            outlined
            class="my-2"
            >
                <v-card-text>
                     <v-text-field
                        outlined dense
                        label="Label"
                        type="text"
                        :rules="[rules.required]"
                        v-model="form.multipliers[i].unit"
                        prefix="per"
                    >
                    </v-text-field>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field
                                outlined dense
                                label="Min. quantity"
                                type="number"
                                :rules="[rules.required, (value) => value > 0 || 'Enter a valid number']"
                                :value="form.multipliers[i].min"
                                @input="(v) => form.multipliers[i].min = parseInt(v)"
                            >
                            </v-text-field>
                        </v-col>
                         <v-col cols="12" md="6">
                            <v-text-field
                                outlined dense
                                label="Max quantity"
                                type="number"
                                :rules="[rules.required, (value) => value > 0 || 'Enter a valid number']"
                                :value="form.multipliers[i].max"
                                @input="(v) => form.multipliers[i].max = parseInt(v)"
                            >
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-btn @click="form.multipliers.splice(i, 1)"
                    color="red"
                    dark
                    icon
                    small>
                    <v-icon>mdi-delete</v-icon>
                    </v-btn>

                </v-card-text>
            </v-card>

            <v-btn
            v-if="!form.multipliers.length"
            color="primary" small text
            @click="form.multipliers.push({min: 1, max: 10})">
                <v-icon>mdi-plus</v-icon> Add multiplier
            </v-btn>

            <v-row>
                <v-col cols="12" md="6">
                    <v-switch dense v-model="form.enable" label="Enable" color="primary" inset></v-switch>
                </v-col>
                <v-col cols="12" md="6">
                     <v-switch dense v-model="form.optional" label="Make payment optional" color="primary" inset></v-switch>
                </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn text color="red" @click="$emit('cancel')">Cancel</v-btn>
            <v-btn type="submit" color="primary" :loading="loading" depressed>Save Charge</v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
import CREATE_PROPERTY_CHARGE from '../Mutations/createPropertyCharge';
import UPDATE_PROPERTY_CHARGE from '../Mutations/updatePropertyCharge';

import CurrencySelect from './PropertyCurrencySelect.vue'

import formValidation from '@/helper/formValidation';

export default {
    name: "PropertyChargeForm",
    components: {
        CurrencySelect
    },
    props: {
        property: Object,
        charge: Object,
        prefill: Object,
        readOnly: {
            type: Array,
            default: () => []
        },
    },
    data(){
        return {
            loading: false,
            rules: formValidation.rules,
            form: {
                title: null,
                description: null,
                enable: true,
                amount: null,
                type: 'instant',
                optional: false,
                currency: null,
                unit: null,
                multipliers: []
            },
            units: [
                {
                    label: 'Per Stay',
                    value: 'Stay'
                },
                {
                    label: 'Per Night',
                    value: 'Night'
                },
                {
                    label: 'Per Guest',
                    value: 'Guest'
                }
            ]
        }
    },
    methods: {
        submit(){
            if(!this.$refs.form.validate()) return;

            this.form.amount = parseInt(this.form.amount, 10);
            if(this.charge) this.updatePropertyCharge();
            else this.createPropertyCharge();
        },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
        createPropertyCharge(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: CREATE_PROPERTY_CHARGE,
                variables: {
                    property_id: this.property.id,
                    data: this.form
                }
            }).then(response => {
                this.$emit('created',  response.data.createPropertyCharge)
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `${response.data.createPropertyCharge.title} charge created`,
                    color: 'success'
                })
                this.$refs.form.reset();
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.createPropertyCharge(),
                    message: 'Could not create charge. ',
                    exception: e
                })
                this.$emit('error', e);
            })
            .finally(() => {
                this.loading = false;
            })
        },

        updatePropertyCharge(){
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: UPDATE_PROPERTY_CHARGE,
                variables: {
                    property_id: this.property.id,
                    charge_id: this.charge.id,
                    data: this.form
                }
            }).then(response => {
                this.$emit('updated',  response.data.updatePropertyCharge)
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `${response.data.updatePropertyCharge.title} charge updated`,
                    color: 'success'
                })
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.updatePropertyCharge(),
                    message: 'Could not update charge. ',
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
        charge: {
            immediate: true,
            handler(charge){
                if(charge) {
                    this.form = {
                        ...charge,
                        currency: charge.currency ? charge.currency : this.property.default_currency,
                        unit: charge.unit ? charge.unit : this.units[0].value,
                        multipliers: charge.multipliers ? charge.multipliers : []
                    }
                } else {
                    this.form = {
                        title: null,
                        description: null,
                        enable: true,
                        amount: null,
                        type: 'instant',
                        optional: false,
                        currency: this.property.default_currency,
                        unit: this.units[0].value,
                        multipliers: []
                    }
                }
            }
        },
        
        prefill: {
            immediate: true,
            handler(charge){
                if(charge){
                    this.form = {
                        ...charge,
                        currency: charge.currency ? charge.currency : this.property.default_currency,
                        unit: charge.unit ? charge.unit : this.units[0].value,
                        multipliers: charge.multipliers ? charge.multipliers : []
                    }
                }
            }
        }
    }
}
</script>