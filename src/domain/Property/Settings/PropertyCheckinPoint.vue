<template>
    <section>
      <div class="d-flex flex-wrap justify-space-between">
        <slot name="heading" />
        <div class="d-flex align-center justify-space-between">
          <buy-property-credit
              :activator="{ outlined: true, color: 'secondary', 'class':'ma-1' }"
              @purchase="checkinPointsPurchased"
          ></buy-property-credit>
          <transfer-property-credit
              :activator="{ outlined: true, color: 'primary', 'class':'ml-3' }"
              @transfer="checkinPointTransferred"
          ></transfer-property-credit>
        </div>
      </div>
        <v-row>
          <v-col cols="4" class="py-0">
            <period-filter default-filter="Today" v-model="periodFilter" outlined dense />
          </v-col>
          <v-col cols="8" class="d-flex py-0">
            <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Search"
                dense
                outlined
            >
              <template #append>
                <v-btn text small color="primary">
                  <v-icon>mdi-filter-outline</v-icon>
                  <span class="d-none d-md-inline">Filter</span>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

      <property-checkin-point-history
      :period-filter="periodFilter"
      :property="property"
      :search="search"
      >
        <template #head>
          <div class="d-flex align-center">
            <h4 class="headline">Balance:  {{ property.checkin_points }}</h4>
          </div>
        </template>
      </property-checkin-point-history>
    </section>
</template>

<script>
import {mapActions, mapMutations} from 'vuex';
import PeriodFilter from "@/components/PeriodFilter";
import BuyPropertyCredit from "@/domain/Property/Components/BuyPropertyCredit";
import TransferPropertyCredit from "@/domain/Property/Components/TransferPropertyCredit";
import PropertyCheckinPointHistory from "@/domain/Property/Components/PropertyCheckinPointHistory";

export default {
    name: "PropertyCheckinPoint",
    components:{
      PropertyCheckinPointHistory,
      TransferPropertyCredit,
      BuyPropertyCredit,
      PeriodFilter,
    },
    data() {
        return {
            loading: false,
            search: null,
            history: [],
            statusFilter: [],
            periodFilter: null
        }
    },
    computed: {
      property() {
        return this.$store.getters.current_user.property
      },
      pointUsage() {
        return this.history.filter(h => h.type === 'checkin').map(h => {
          if(h.reservation) {
            h.reservation = {
              ...h.reservation,
              property: {
                id: this.property.id,
                property: this.property
              }
            }
          }
          return h;
        })
        .filter(h => h.reservation && this.statusFilter.length ? this.statusFilter.includes(h.reservation.status) : true);
      }
    },
    methods: {
        ...mapActions([
            'query',
            'mutate'
        ]),
      ...mapMutations([
          'TOAST_ERROR'
      ]),

      checkinPointTransferred(transfer) {
        this.$store.dispatch("getAuthGrProfile");
      },

      checkinPointsPurchased(purchase) {
          this.history.unshift(purchase);
          this.$store.dispatch("getAuthGrProfile");
      }
    },
    watch: {

    }
}
</script>