<template>
    <data-container :loading="loading">
        <v-checkbox
            v-for="(item, i) in items"
            :key="i"
            v-model="selected"
            :value="item.value"
            :label="item.label" />
    </data-container>
</template>

<script>

import DataContainer from '../../../components/DataContainer.vue';
import gql from 'graphql-tag';

export default {
    name: "ReservationCheckinApprovalRuleSelect",
    components: { DataContainer },
    data(){
        return {
            loading: false,
            items: [],
            selected: []
        }
    },

    props: {
        value: Array,
        disabledFields: Array
    },

    methods: {
        getRules(){
            this.loading = true;
            this.$store.dispatch('query', {
                query: gql`
                  query getReservationCheckinApprovalRules {
                      getReservationCheckinApprovalRules {
                          value
                          label
                      }
                  }
                  `,
            })
            .then(response => {
                this.items = response.data.getReservationCheckinApprovalRules ? response.data.getReservationCheckinApprovalRules  : []
            })
            .finally(() => {
                this.loading = false;
            })
        }
    },

    mounted() {
        this.getRules();
    },

    watch: {
        value: {
            immediate: true,
            handler(val) {
                if(val) this.selected = val;
            }
        },
        
        selected: {
            immediate: true,
            handler(fields) {
                this.$emit('input', fields);
            }
        }
    }

}
</script>