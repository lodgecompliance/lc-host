<template>
    <v-autocomplete
        v-if="!other"
        :loading="loading"
        :items="items.concat([
            {
                id: '',
                label: 'Other'
            }
        ])"
        item-value="id"
        item-text="label"
        v-on="$listeners"
        v-bind="$attrs"
        :no-data-text="`${loading ? 'Please wait...': `No booking channel.`}`"
        @change="channelChanged"
        placeholder="Select channel"
        clearable
    >
    </v-autocomplete>
    <v-text-field
    v-else
    type="text"
    @input="(v) => $emit('input', {id: v, label: 'Other'})"
    v-bind="$attrs"
    :value="$attrs.value.id"
    label="Other channel"
    outlined
    append-icon="mdi-close"
    @click:append="other = false"
    placeholder="Enter channel"
    >

    </v-text-field>
</template>

<script>

import GET_BOOKING_CHANNELS from '../../Reservation/Queries/getBookingChannels';

export default {
    name: "PropertyBookingChannelSelect",

    data(){
        return {
            loading: false,
            items: [],
            other: false,
        }
    },

    computed: {

    },

    props: {
        supported: Array,
    },

    methods: {
        getChannels(){
            this.loading = true;
            this.$store.dispatch('query', {
                query: GET_BOOKING_CHANNELS,
            })
            .then(response => {
                const channels = response.data.getBookingChannels ? response.data.getBookingChannels  : [];
                this.items = channels.filter(channel => this.supported.includes(channel.id));    
                this.other = this.$attrs.value && !this.items.map(i => i.id).includes(this.$attrs.value.id);
                
                // if(this.$attrs.value && !(this.$attrs.value instanceof Object)) {
                //     this.$emit('input', this.items.find(c => c.id == this.$attrs.value))
                // }

            })
            .finally(() => {
                this.loading = false;
            })
        },

        channelChanged(channel) {
            if(channel === '') {
                this.$emit('input', null);
                this.other = true;
            }
        }
    },

    mounted() {
        this.getChannels();
    },

    watch: {
        $attrs: {
            immediate: true,
            handler(attrs) {
                if(attrs.value) this.other = !this.items.map(i => i.id).includes(attrs.value instanceof Object ? attrs.value.id : attrs.value);
            }
        }
    }

}
</script>