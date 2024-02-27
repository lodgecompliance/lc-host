<template>
  <div>
    <slot name="head" />
    <data-container :loading="loading" class="mt-5">
      <template #loading>
        <v-skeleton-loader type="table" />
      </template>
      <v-tabs v-model="tab">
        <v-tab href="#checkin">Checkin</v-tab>
        <v-tab href="#history">History</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item value="checkin" class="pt-3">
          <property-checkin-point-history-for-checkin
          :history="pointUsage"
          :search="search"
          />
        </v-tab-item>
        <v-tab-item value="history">
          <property-checkin-point-history-list
          :history="history"
          :search="search"
          />
        </v-tab-item>
      </v-tabs-items>
    </data-container>
  </div>
</template>

<script>
import {mapActions, mapMutations} from "vuex";
import gql from "graphql-tag";
import DataContainer from '@/components/DataContainer.vue';
import PropertyCheckinPointHistoryList from "@/domain/Property/Components/PropertyCheckinPointHistoryList";
import PropertyCheckinPointHistoryForCheckin from "@/domain/Property/Components/PropertyCheckinPointHistoryForCheckin";

export default {
  name: "PropertyCheckinPointHistory",
  components: {
    PropertyCheckinPointHistoryForCheckin,
    PropertyCheckinPointHistoryList,
    DataContainer,
  },
  data() {
    return {
      loading: false,
      history: [],
      usageHeaders: [
        { text: 'Booking Name', align: 'start', value: 'booking.name', sortable: false },
        { text: 'Check in', align: 'left', value: 'checkin' },
        { text: 'Check-in point', align: 'center', value: 'points' },
        { text: 'Options', value: 'options', sortable: false  },
        { text: 'Status', value: 'status', sortable: false  },
      ],
      tab: 'checkin',
    }
  },
  props: {
    search: String,
    property: Object,
    periodFilter: Object,
  },
  computed: {
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
    },
  },
  methods: {
    ...mapActions([
      'query',
    ]),
    ...mapMutations([
      'TOAST_ERROR'
    ]),

    getCheckinPointHistory() {
      this.loading = true;
      this.query({
        query: gql`
              query getPropertyById($id: ID!) {
                getPropertyById(id: $id) {
                  checkin_point_history {
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
              }
            `,
        variables: {
          id: this.property.id
        }
      })
      .then(response => {
        this.history = response.data.getPropertyById?.checkin_point_history || []
      })
      .catch(e => {
        this.TOAST_ERROR({
          show: true,
          message: "Couldn't get checkin point history.",
          retry: () => this.getCheckinPointHistory(),
          exception: e
        })
      })
      .finally(() => {
        this.loading = false;
      })
    },

  },
  watch: {
    property: {
      immediate: true,
      handler(property){
        if(property) this.getCheckinPointHistory();
        else this.loading = true;
      }
    },
    periodFilter: {
      immediate: true,
      handler(filter) {
        if(filter){
          this.history = this.history.filter(h => this.momentFromTimestamp(h.created_at).isBetween(filter.start, filter.end))
        }
      }
    }
  }
}
</script>