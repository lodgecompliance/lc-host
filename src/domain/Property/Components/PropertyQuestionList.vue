<template>
    <v-list>
        <v-list-item v-for="(question, i) in questions" :key="i">
            <v-list-item-icon>
                <v-icon>mdi-account-question</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
                <v-list-item-title>
                    {{ question.question }} <span v-show="question.required" class="text-italic">(required)</span>
                </v-list-item-title>
                <template v-if="question.options && question.options.length">

                    <v-list-item-subtitle  v-for="(option, i) in question.options" :key="i">
                        <span>{{ option.option }}</span> 
                        <span class="ml-3" v-if="option.agreement">
                            <v-icon>mdi-attachment</v-icon> <strong>{{ option.agreement.agreement }}</strong> 
                            <a class="ml-2" v-if="option.agreement.link" :href="option.agreement.link" target="_blank">Read agreement</a>
                        </span>
                    </v-list-item-subtitle>

                </template>
                <slot name="list-item-content" v-bind="{ question }"></slot>

            </v-list-item-content>
            <v-list-item-action>
                <slot name="list-item-action" v-bind="{ question }"></slot>
            </v-list-item-action>
        </v-list-item>
    </v-list>
</template>

<script>
export default {
    name: "PropertyQuestionList",
    props:{
        questions: Array
    }
}
</script>