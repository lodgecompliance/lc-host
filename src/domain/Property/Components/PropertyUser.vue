<template>
    <v-list-item
    v-if="dataUser"
    >
        <v-list-item-avatar>
                <v-avatar color="primary" size="40">
                <span class="white--text headline">{{avatarText}}</span>
            </v-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
            <v-list-item-title> {{ userName }} <span v-if="confirmed && !dataUser.active" class="red--text">Not active</span></v-list-item-title>
            <v-list-item-subtitle> {{ dataUser.role }} - {{ dataUser.permissions.length }} permissions <span v-if="!confirmed" class="red--text">Awaiting confirmation</span> </v-list-item-subtitle>
            <clip-board v-if="!confirmed" v-model="dataUser.invite_url" />
            <property-user-form
             ref="propertyUserForm"
             :property="property"
             :user="dataUser"
             @updated="userUpdated"
             @removed="userRemoved"
              />
        </v-list-item-content>
        <v-list-item-icon>
            <v-btn @click="$refs.propertyUserForm.open()" icon>
                <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
        </v-list-item-icon>
</v-list-item>
</template>

<script>
import ClipBoard from '../../../components/Utilities/ClipBoard.vue';
import PropertyUserForm from './PropertyUserForm.vue';
export default {
    name: "PropertyUser",
    components: { PropertyUserForm, ClipBoard },
    data() {
        return {
            dataUser: null
        }
    },
    props: {
        property: Object,
        user: Object
    },
    computed: {
        userName() {
            if(!this.dataUser) return null;
             if (this.dataUser.user && this.dataUser.user.name) {
                return [this.dataUser.user.first_name, this.dataUser.user.last_name].join(' ');
            }
            return this.dataUser.email
        },
        avatarText() {
            if(!this.userName) return '';
            return this.userName.substring(0,1);
        },
        confirmed() {
            return this.dataUser && this.dataUser.confirmed_at ? true : false;
        }
    },
    methods: {
        userUpdated(user) {
            this.dataUser = user;
            this.$refs.propertyUserForm.close();
        },
        userRemoved(user) {
            this.$emit('user-removed', user);
        }
    },
    watch: {
        user: {
            immediate: true,
            handler(user) {
                if (user) this.dataUser = user;
            }
        }
    }
}
</script>