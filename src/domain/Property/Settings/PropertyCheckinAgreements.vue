<template>
    <section>
        <div class="d-flex flex-wrap justify-space-between">
          <slot name="heading" />
          <v-dialog v-model="createNew" width="400px" scrollable>
            <template #activator="{ on }">
              <v-btn
                  color="primary"
                  title="New Agreement"
                  v-on="on" depressed>
                <v-icon dark> mdi-plus</v-icon> Create New
              </v-btn>
            </template>
            <property-checkin-agreement-form
                :property="property"
                @created="agreementCreated"
                @cancel="createNew = false"
                class="my-1"
            >
              <template #header>
                <v-card-title>
                  <h2 class="headline">New Agreement</h2>
                  <v-spacer></v-spacer>
                  <v-btn icon @click="createNew = false"><v-icon>mdi-close</v-icon></v-btn>
                </v-card-title>
              </template>
            </property-checkin-agreement-form>
          </v-dialog>
        </div>
        <data-container :loading="loading" :error="error" @retry="getAgreements">
            <template v-slot:loading>
                <div  v-for="i in 4" :key="i">
                    <v-skeleton-loader
                        type="card"
                        height="50"
                        class="my-2"
                    ></v-skeleton-loader>
                </div>
            </template>

            <div  v-if="agreements.length" class="mt-5">
                <property-checkin-agreement v-for="agreement in agreements" 
                :key="agreement.id"
                :agreement="agreement"
                :property="property"
                @removed="agreementRemoved"
                class="my-1" />
            </div>
            <div v-else class="py-5 text-center">
                <p class="grey--text">No agreement</p>
            </div>
        </data-container>
    </section>

</template>
<script>
import DataContainer from '../../../components/DataContainer.vue';
import PropertyCheckinAgreement from '../Components/PropertyCheckinAgreement.vue';
import PropertyCheckinAgreementForm from '../Components/PropertyAgreementForm.vue';

import GET_PROPERTY_CHECKIN_AGREEMENTS from '../Queries/getPropertyCheckinAgreements';
import formValidation from '@/helper/formValidation';

export default {
    name: "PropertyCheckinAgreements",
    components: {
        DataContainer, PropertyCheckinAgreement,
        PropertyCheckinAgreementForm
    },

    props: {
        property: Object
    },

    data(){
        return {
            loading: false,
            error: null,
            rules: formValidation.rules,
            agreements: [],
            collapseAll: false,
            createNew: false,
        }
    },  

    methods: {
        getAgreements(){
            this.loading = true;
            this.error= null;
             this.$store.dispatch('query', {
                query: GET_PROPERTY_CHECKIN_AGREEMENTS,
                variables: {
                    id: this.property.id
                }
            })
            .then(response => {
                this.agreements  = response.data.getPropertyById?.checkin_agreements;
            })
            .catch(e => {
                this.error = e
            })
            .finally(() => {
                this.loading = false;
            })
        },

        agreementCreated(agreement) {
            this.agreements.push(agreement);
            this.createNew = false;
        },

        agreementRemoved(agreement) {
            const index = this.agreements.findIndex(a => a.id === agreement.id);
            if(index >= 0) this.agreements.splice(index, 1);
        }
    },

    watch: {
        property: {
            immediate: true,
            handler(property){
               if(property) this.getAgreements()
                else this.loading = false;
            }
        }
    }
}
</script>