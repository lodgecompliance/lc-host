<template>
    <v-list>
        <v-list-item v-for="(charge, i) in charges" :key="i">
            <v-list-item-icon>
                <v-icon>mdi-credit-card</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
                <v-list-item-title>
                    {{ charge.title }} <span v-show="charge.optional" class="text-italic">(optional)</span>
                </v-list-item-title>
                <v-list-item-subtitle>
                    {{ charge.currency }}{{ charge.amount }}, {{ charge.type }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>{{ getUnit(charge) }}</v-list-item-subtitle>

                <slot name="list-item-content" v-bind="{ charge }"></slot>

            </v-list-item-content>
            <v-list-item-action>
                <slot name="list-item-action" v-bind="{ charge }"></slot>
            </v-list-item-action>
        </v-list-item>
    </v-list>
</template>

<script>
export default {
    name: "PropertyChargeList",
    props:{
        charges: Array
    },

    methods: {
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
    }
}
</script>