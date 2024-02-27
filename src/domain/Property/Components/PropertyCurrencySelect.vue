<template>
    <v-autocomplete 
        :loading="loading"
        :items="items"
        v-on="$listeners"
        v-bind="$attrs"
        :no-data-text="`${loading ? 'Please wait...': `No currency.`}`"
    >
    </v-autocomplete>
</template>

<script>

import GET_CURRENCIES from '../../Reservation/Queries/getPropertyCurrencies';

export default {
    name: "PropertyCurrencies",

    data(){
        return {
            loading: false,
            items: [],
        }
    },

    props: {
       customItems: Array
    },

    methods: {
        getCurrencies(){
            if(this.customItems) {
              this.items = this.customItems;
              return;
            }
            this.loading = true;
            this.$store.dispatch('query', {
                query: GET_CURRENCIES,
            })
            .then(response => {
                this.items = response.data.getPropertyCurrencies ? response.data.getPropertyCurrencies  : [];
            })
            .finally(() => {
                this.loading = false;
            })
        }
    },

    mounted() {
        this.getCurrencies();
    }

}
</script>