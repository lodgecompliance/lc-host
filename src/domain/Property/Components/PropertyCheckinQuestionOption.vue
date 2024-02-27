<template>
    <v-card outlined>
        <v-card-text>
            <v-row v-if="data_option"
            align="center">
                <v-col cols="12" >
                    <v-text-field
                        :label="`Option ${index}`"
                        :rules="[rules.required]"
                        v-model="data_option.option"
                        outlined dense
                    >
                    </v-text-field>
                </v-col>

                <v-col cols="12">
                  <slot name="option-attachment">
                    <property-attachments
                        v-if="allowAttachment"
                        :property="property"
                        v-model="data_option.attachments"
                        :parent="{ question }"
                        :allowedCurrency="allowedCurrency"
                    >
                    </property-attachments>
                  </slot>

                </v-col>

            </v-row>
        </v-card-text>
        <v-card-actions>
            <slot name="actions" />
        </v-card-actions>
    </v-card>
    
</template>

<script>

import formValidation from '@/helper/formValidation';
import PropertyAttachments from './PropertyAttachments.vue';

export default {
    name: "PropertyCheckinQuestionOption",
    components: {
        PropertyAttachments
    },
    props: {
        index: Number,
        question: Object,
        option: Object,
        property: Object,
        allowAttachment: {
            default: true,
        },
        allowedCurrency: String
    },
    data() {
        return {
            data_option: null,
            rules: formValidation.rules,
        }
    },

    methods: {
        
    },

    watch:{
        option: {
            immediate: true,
            handler(option) {
                this.data_option = option;
            }
        },
        data_option: {
            immediate: true,
            handler(option) {
                this.$emit('input', option);
            }
        }
    }
}
</script>