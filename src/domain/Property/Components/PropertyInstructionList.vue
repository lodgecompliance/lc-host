<template>
    <v-list>
        <property-instruction v-for="(instruction, i) in instructions" :key="i"
         :instruction="instruction">
            <template #list-item-content="{ instruction }">
                <slot name="list-item-content" v-bind="{ instruction }"></slot>
            </template>
        </property-instruction>
    </v-list>
</template>

<script>
import PropertyInstruction from './PropertyInstruction.vue';
export default {
    name: "PropertyInstructionList",
    components: {
      PropertyInstruction
    },
    props:{
      instructions: Array
    }
}
</script>