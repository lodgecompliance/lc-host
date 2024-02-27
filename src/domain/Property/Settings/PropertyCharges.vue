<template>
    <section>
      <div class="d-flex flex-wrap justify-space-between">
        <slot name="heading" />
        <v-dialog v-model="createNewCharge" width="500px" scrollable>
          <template #activator="{ on }">
            <v-btn
                color="primary"
                title="New Charge"
                v-on="on"
                depressed>
              <v-icon dark> mdi-plus</v-icon> Create New
            </v-btn>
          </template>
          <property-charge-form
              class="my-2"
              :property="property"
              @created="chargeCreated"
              @cancel="createNewCharge = false"
          >
            <template #header>
              <v-card-title>
                <h2 class="headline">New charge</h2>
                <v-spacer></v-spacer>
                <v-btn icon @click="createNewCharge = false"><v-icon>mdi-close</v-icon></v-btn>
              </v-card-title>
            </template>
          </property-charge-form>
        </v-dialog>
      </div>
      <data-container :loading="loading" :error="error" @retry="getPropertyCharges">
            <template v-slot:loading>
                <div  v-for="i in 4" :key="i">
                    <v-skeleton-loader
                        type="card"
                        height="50"
                        class="my-2"
                    ></v-skeleton-loader>
                </div>
            </template>
            <template v-if="charges.length">
                <property-charge
                v-for="charge in charges" :key="charge.id"
                :property="property"
                :charge="charge"
                @deleted="chargeDeleted"
                class="my-1" />
            </template>
            <template v-else>
                    <div class="py-5 text-center">
                        <p class="grey--text">No charge yet</p>
                    </div>
                    <template v-if="!createNewCharge">
                        <div class="text-center">
                            <v-btn color="primary" @click="createSecurityDeposit = !createSecurityDeposit" class="my-1" depressed>Set security deposit</v-btn>
                        </div>
                        <div v-if="createSecurityDeposit"  class="my-1">
                            <p>Set security deposit charge</p>
                            <h4 class="">Create Security deposit</h4>
                            <property-charge-form
                                class="mt-2"
                                :property="property"
                                :prefill="security_deposit.form"
                                :read-only="security_deposit.read_only"
                                :title="security_deposit.form.title" @created="chargeCreated"
                                @cancel="createSecurityDeposit = false"
                            />
                        </div>
                    </template>
                </template>
        </data-container>
    </section>
</template>
<script>
import DataContainer from '../../../components/DataContainer.vue';

import PropertyChargeForm from '../Components/PropertyChargeForm.vue';
import PropertyCharge from '../Components/PropertyCharge.vue';
import GET_PROPERTY_CHARGES from '../Queries/getPropertyCharges';

export default {
    name: "PropertyCharges",
    components: {
        DataContainer,
        PropertyChargeForm,
        PropertyCharge
    },

    props: {
        property: Object
    },

    data(){
        return {
            loading: false,
            error: null,
            stripe_authorization: null,
            createSecurityDeposit: false,
            createNewCharge: false,
            security_deposit: {
                form: {
                    title: 'Security Deposit',
                    description: 'Initial security deposit to be paid at checkin in',
                    enable: false,
                    amount: 100,
                    type: 'Instant',
                    currency: this.property.currency,
                },
                read_only: [
                    'title'
                ]
            },
            charges: [],
        }
    },
    methods: {
        getPropertyCharges(){
            this.loading = true;
            this.error = null;
             this.$store.dispatch('query', {
                query: GET_PROPERTY_CHARGES,
                variables: {
                    id: this.property.id
                }
            })
            .then(response => {
                this.charges = response.data.getPropertyById?.charges
            })
            .catch(e => {
                this.error = e;
            })
            .finally(() => {
                this.loading = false;
            })
        },

        chargeCreated(charge){
            this.charges.unshift(charge);
            this.createNewCharge = false;
        },

       chargeDeleted(charge) {
            const index = this.charges.findIndex(c => c.id === charge.id);
            if(index >= 0) this.charges.splice(index, 1);
        }

    },

    watch: {
        property: {
            immediate: true,
            handler(property){
                if(property && property.active) this.getPropertyCharges()
                else this.loading = false;
            }
        }
    }
}
</script>