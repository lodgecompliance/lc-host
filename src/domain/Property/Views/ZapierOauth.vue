<template>
    <app-layer ref="app">
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6" class="mt-2">
              <div class="d-flex align-center justify-center">
                  <img src="../../../assets/img/logo.png" alt="Guest Registration Logo" width="80px" class="mx-2">
                  <img src="../../../assets/img/zapier.png" alt="Zapier Logo" width="80px" class="mx-2">
              </div>
              <div class="text-center mb-5">
                  <h1>Authorize Zapier</h1>
                  <p>Select property to authorize with Zapier</p>
              </div>

                  <v-select
                      outlined
                      class="mx-2"
                      :items="properties"
                      item-text="name"
                      item-value="id"
                      dense
                      v-model="selected"
                      label="Select property"
                  ></v-select>

              <error-handler :error="error" />

              <div class="text-center">
                  <v-btn color="primary" :disabled="selected == null" @click="authorize" :loading="authorizing">Authorize</v-btn>
              </div>
        </v-col>
      </v-row>
    </app-layer>
</template>

<script>
    import gql from 'graphql-tag';
    import {mapActions, mapGetters, mapMutations} from 'vuex';
    import AppLayer from '@/AppLayer.vue';
    import ErrorHandler from "@/components/ErrorHandler.vue";

    export default {
        name: 'ZapierOauth',
        components:{
          ErrorHandler,
           AppLayer
        },
        data(){
            return {
                loading: false,
                error: null,
                selected: null
            }
        },

        computed: {
          ...mapGetters(['properties']),
            redirect_uri(){
                return this.$route.query.redirect_uri
            }
        },
        methods: {
            ...mapActions([
                'mutate',
            ]),

            ...mapMutations([
                'SNACKBAR',
            ]),

            authorize() {
                const { client_id, redirect_uri, response_type, state } = this.$route.query;

                if(!client_id || !response_type || !state) {
                    this.SNACKBAR({
                        status: true,
                        text: "Incomplete request",
                        color: "error"
                    });
                    return;
                }
                this.loading = true;
                this.error = null;
                this.mutate({
                    mutation: gql `
                    mutation generateZapierOauthCode($property_id: ID!, $client_id: ID!, $redirect_uri: String, $response_type: String!, $state: String!){
                            generateZapierOauthCode(property_id: $property_id, client_id: $client_id, redirect_uri: $redirect_uri, response_type: $response_type, state: $state)
                        }
                    `,
                    variables: {
                        property_id: this.selected,
                        client_id, redirect_uri, response_type, state
                    }
                }).then(response => {
                    window.location.href = response.data.generateZapierOauthCode;
                })
                .catch(e => this.error = e )
                .finally(() => this.loading = false)
            }
        },
    }
</script>

