<template>
  <data-container :loading="loading">
    <v-card v-bind="$attrs.card">
      <v-card-title>
        <h5> Checkin Credit Transactions </h5>
      </v-card-title>
      <v-divider></v-divider>
      <property-checkin-point-history-list
        v-if="transactions.length"
        :history="transactions"
      />
      <v-card-text v-else>
        <p class="grey--text text-center">No transaction</p>
      </v-card-text>
    </v-card>
  </data-container>
</template>

<script>
import {mapActions} from "vuex";
import gql from "graphql-tag";
import PropertyCheckinPointHistoryList from "@/domain/Property/Components/PropertyCheckinPointHistoryList";
import DataContainer from "@/components/DataContainer";

export default {
  name: "PropertyCreditHistory",
  components: {DataContainer, PropertyCheckinPointHistoryList},
  data(){
    return {
      transactions: [],
      error: null,
      loading: false,
    }
  },
  props: {
    property: Object
  },
  methods: {
    ...mapActions([
        'query'
    ]),
    getTransactionHistory() {
      this.loading = true;
      this.query({
        query: gql`
              query getPropertyCheckinPointHistory($property_id: ID!) {
                getPropertyCheckinPointHistory(property_id: $property_id) {
                  title
                  opening_balance
                  closing_balance
                  reference
                  points
                  type
                  description
                  created_at
                  reservation {
                    id
                    name
                    checkin_date
                    status
                    checkedin_at
                    approved
                    approved_at
                    cancelled
                    cancelled_at
                    property_id
                    timestamp {
                      created_at
                      updated_at
                    }
                  }
                  from_property {
                    id
                    name
                    image
                  }
                  to_property {
                    id
                    name
                    image
                  }
                }
              }
            `,
        variables: {
          property_id: this.property.id
        }
      })
          .then(response => {
        this.transactions = response.data.getPropertyCheckinPointHistory || []
      })
      .catch(e => {
        this.error = e
      })
      .finally(() => {
        this.loading = false;
      })
    }
  },
  watch: {
    property: {
      immediate: true,
      handler(property) {
        if(property) this.getTransactionHistory()
      }
    }
  }
}
</script>