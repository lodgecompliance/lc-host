<template>
  <data-container :loading="loading" :error="error" @retry="getSession">
    <v-row>
      <v-col cols="12">
        <google-map
        :latitude="locationObject.Latitude"
        :longitude="locationObject.Longitude"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-list v-if="infoList.length" dense>
          <metadata-list-item
              v-for="(meta, i) in infoList"
              :metadata="meta"
              :key="`meta-${i}`" />
        </v-list>
        <div v-else class="grey--text py-3">
          No information available
        </div>
        <template v-if="checkin">
          <reservation-checkin
              :reservation="reservation"
              :checkin="checkin"
              :user="session.user"
          />
          <confirm-checkin-session
              v-if="!reservation.checkedin"
              :reservation="reservation"
              :session="session"
              v-on="$listeners"
          />
        </template>
      </v-col>
      <v-col cols="12" md="6">
        <h4>Activities</h4>
        <v-timeline
            v-if="activities.length"
            class="ml-n8"
            align-top
            dense
        >
          <v-timeline-item
              v-for="(activity, i) in activities"
              :key="i"
              small fill-dot
              color="grey"
          >
            <v-sheet class="pa-2" outlined rounded>
              <h4>{{activity.title}}</h4>
              <small class="grey--text">
                {{ activity.timestamp | timestamp }}
              </small>
              <div>
                {{ activity.description }}
              </div>
            </v-sheet>
          </v-timeline-item>
        </v-timeline>
        <div v-else class="text-center grey--text py-3">
          No activity available
        </div>
      </v-col>
    </v-row>
  </data-container>
</template>

<script>
import {mapActions} from "vuex";
import gql from "graphql-tag";
import MetadataListItem from "@/components/MetadataListItem.vue";
import GoogleMap from "@/components/GoogleMap.vue";
import ReservationCheckin from "@/domain/Reservation/Widgets/ReservationCheckin.vue";
import DataContainer from "@/components/DataContainer.vue";
import ConfirmCheckinSession from "@/domain/Property/Components/ConfirmCheckinSession.vue";

export default {
  name: "ReservationSession",
  components: {
    ConfirmCheckinSession, DataContainer,
    ReservationCheckin, GoogleMap,
    MetadataListItem
  },
  data(){
    return {
      loading: false,
      error: null,
      session: null,
    }
  },
  props: {
    reservation: Object,
    id: String
  },
  computed: {
    activities() {
      return this.session?.activities || [];
    },
    info() {
      return this.session?.info || [];
    },
    browser() {
      return this.session?.browser || []
    },
    location() {
      return this.session?.location || [];
    },
    locationObject() {
      return this.convertMetaKeyValueToObj(this.location);
    },
    infoList() {
      return [].concat(this.info, this.browser, this.location);
    },
    checkin() {
      return this.session?.checkin
    }
  },
  methods: {
    ...mapActions(['query']),
    getSession() {
      this.loading = true;
      this.query({
        query: gql `query getReservationCheckinSession($reservation_id: ID!, $session_id: ID, $user_id: ID) {
            getReservationCheckinSession(reservation_id: $reservation_id, session_id: $session_id, user_id: $user_id) {
              id
              info {
                key
                value
              }
              browser {
                key
                value
              }
              location {
                key
                value
              }
              activities {
                title
                description
                timestamp
              }
              user {
                id
                first_name
                last_name
                full_name
              }
              completed_at
              timestamp {
                created_at
                updated_at
              }
              checkin {
                agreements {
                    id
                    agreement
                    link
                    text
                }
                questions {
                  id
                  question
                  response {
                      option
                      attachments {
                          agreements {
                              id
                              agreement
                              link
                          }
                          charges {
                              id
                              type
                              title
                              amount
                              description
                              enable
                              optional
                              currency
                              unit
                              multipliers {
                                  min
                                  max
                                  unit
                              }
                          }
                          questions {
                              id
                              question
                              response_type
                              required
                              options {
                                  option
                              }
                              response {
                                  option
                              }
                          }
                      }
                  }
                }
                credit_card {
                    stripe {
                      customer
                      card {
                          id
                          brand
                          customer
                          exp_month
                          exp_year
                          last4
                          name
                      }
                      payment_method {
                          id
                          type
                          card {
                              brand
                              exp_month
                              exp_year
                              last4
                          }
                      }
                    }
                    paystack {
                        card_type
                        authorization_code
                        exp_month
                        exp_year
                        last4
                        reusable
                    }
                }
                signature
              }
            }
          }`,
        variables: {
          reservation_id: this.reservation.id,
          session_id: this.id,
        }
      }).then(response => {
        this.session = response?.data?.getReservationCheckinSession
      })
      .catch(e => {
        this.error = e
      })
      .finally(() => {
        this.loading = false
      })
    }
  },
  watch: {
    id: {
      immediate: true,
      handler(id) {
        if(id) this.getSession()
      }
    }
  }
}
</script>

