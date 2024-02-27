<template>
    <v-list>
        <property-agreement v-for="(agreement, i) in agreements" :key="i"
         :agreement="agreement">
            <template #list-item-content="{ agreement }">
                <slot name="list-item-content" v-bind="{ agreement }"></slot>
            </template>
        </property-agreement>
        <!-- <v-list-item >
            <v-list-item-icon>
                <v-icon>mdi-handshake</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
                <v-list-item-title>
                    {{ agreement.agreement }}
                </v-list-item-title>
                <v-list-item-subtitle v-if="agreement.link && agreement.link !== ''">
                    <a :href="agreement.link" target="_blank">Read agreement</a>
                </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
                <slot name="list-item-action" v-bind="{ agreement }"></slot>
            </v-list-item-action>
        </v-list-item> -->
    </v-list>
</template>

<script>
import PropertyAgreement from './PropertyAgreement.vue';
export default {
    name: "PropertyAgreementList",
    components: {
        PropertyAgreement
    },
    props:{
        agreements: Array
    }
}
</script>