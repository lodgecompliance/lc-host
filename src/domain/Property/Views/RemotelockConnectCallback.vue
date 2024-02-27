<template>
    <app-layer ref="app">
        <v-row justify="center" align="center" style="height: 90vh">
            <v-col md="6">
                <page-loading v-if="loading" message="Finalizing Remotelock connection..." />
                <template v-else>
                    <div v-if="!property" class="text-center">
                        <h1>We could not find that property</h1>
                    </div>
                    <div v-else>
                        <v-alert 
                            v-if="authError && authError == 'access_denied'"
                            border="left"
                            colored-border
                            type="error">
                            Access was denied for Remotelock Connect
                        </v-alert>
                        <v-alert 
                            v-if="!code"
                            border="left"
                            colored-border
                            type="error">
                            Authorization failed
                        </v-alert>
                    </div>
                    <template v-if="error">
                        <v-alert 
                            border="left"
                            colored-border
                            type="error">
                            {{error.message}}
                        </v-alert>
                        <v-btn color="primary" @click="startConnect">Retry</v-btn>
                    </template>
                </template>
            </v-col>
        </v-row>
    </app-layer>
</template>

<script>
import gql from 'graphql-tag';
import AppLayer from '@/AppLayer';
import PageLoading from '../../../components/PageLoading.vue';
import GET_PROPERTY from '../Queries/getProperty';
import { mapMutations } from 'vuex';

export default {
    name: 'PropertyRemotelockConnectCallback',
    components: {
        AppLayer, PageLoading
    }, 
    data(){
        return {
            loading: false,
            property: null,
            error: null,
        }
    },

    computed:{
        pendingConnect(){
            const storage = window.localStorage.getItem('property-lockstate-connect');
            return storage ? JSON.parse(storage) : null;
        },
        authError(){
            return this.$route.query.error
        },
        code(){
            return this.$route.query.code
        }
    },

    methods:{

        ...mapMutations([
            'SET_APP_STATE',
            'SET_APP_PROCESS'
        ]),

        startConnect(){
            if(this.pendingConnect){
                this.loading = true;
                this.$store.dispatch('query', {
                    query: GET_PROPERTY,
                    variables: {
                        id: this.pendingConnect.id
                    }
                })
                .then(response => {
                    this.property = response.data.getProperty;
                    if(this.code){
                        return this.$store.dispatch('mutate', {
                            mutation: gql`
                                mutation setPropertyRemotelockAuthorization($property_id: ID!, $grant_type: String!, $code: String!, $redirect_uri: String!){
                                    setPropertyRemotelockAuthorization(property_id: $property_id, grant_type: $grant_type, code: $code, redirect_uri: $redirect_uri){
                                        access_token
                                        expires_in
                                        token_type
                                        refresh_token
                                    }
                                }
                            `,
                            variables: {
                                property_id: this.property.id,
                                grant_type: 'authorization_code',
                                code: this.code,
                                redirect_uri: this.pendingConnect.redirect_uri
                            }
                        })
                    }
                    return Promise.resolve(null);
                })
                .then(authResponse => {
                    window.localStorage.removeItem('property-lockstate-connect');
                    if(authResponse){
                        this.$store.commit("SNACKBAR", {
                            status: true,
                            text: "Remotelock connection completed.",
                            color: "success"
                        })
                        this.$router.push({name: 'property.settings', params: {id: this.property.id, tab: 'integrations', active: 'remotelock'}})
                    }else{
                        this.$store.commit("SNACKBAR", {
                            status: true,
                            text: "Remotelock connection could not be completed.",
                            color: "error"
                        })
                    }
                })
                .catch(e => {
                    this.error = e;
                })
                .finally(() => {
                    this.loading = false;
                })
            }else{
                this.$store.commit("SNACKBAR", {
                    status: true,
                    text: "No pending Remotelock authentication",
                    color: "info"
                })
                this.$router.push({name: 'home'});
            }
        },
    },

    mounted(){
        this.startConnect();
    }
}
</script>
