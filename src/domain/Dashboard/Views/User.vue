<template>
  <dashboard :class="`${!$vuetify.breakpoint.mdAndUp ? 'white' : ''}`">
    <template #header>
      <div class="d-flex justify-space-between">
        <h4 class="headline">Users</h4>
        <v-spacer></v-spacer>
        <v-btn icon @click="queryUser" class="ml-2" title="Refresh"> <v-icon>mdi-refresh</v-icon> </v-btn>
        <users-options v-if="user && !$vuetify.breakpoint.mdAndUp" :user="user" />
      </div>
    </template>
    <v-row justify="center">
      <v-col cols="12" md="11" lg="10">
        <div class="d-flex justify-space-between">
          <v-breadcrumbs v-if="$vuetify.breakpoint.mdAndUp"  :items="breadcrumbs">
            <template v-slot:divider>
              <v-icon>mdi-chevron-right</v-icon>
            </template>
          </v-breadcrumbs>
          <v-spacer></v-spacer>
          <users-options v-if="user && $vuetify.breakpoint.mdAndUp" :user="user" />
        </div>
        <data-container :loading="loading">
          <template  v-if="user">
            <div class="d-flex justify-space-between">
              <div class="d-flex align-content-center">
                <v-avatar size="60">
                  <img :alt="name"
                       :src="user.image"
                  >
                </v-avatar>
                <div class="ml-3">
                  <h4>{{ name }}</h4>
                  <p> {{ user.email }} </p>
                </div>
              </div>
              <div class="text-center">
                <v-chip color="success" outlined small>{{ user.status }}</v-chip>
                <div class="small">Since {{ createdAtMoment.format('MMM D, YYYY') }}</div>
              </div>
            </div>
            <v-row>
              <v-col md="8">
                <v-card>
                  <v-card-text>
                    <v-list>
                      <template v-for="(info, i) in listInfo">
                        <v-list-item :key="`info-${i}`">
                          <v-list-item-content>
                            <div class="d-flex justify-space-between">
                              <div>{{ info.label }}</div>
                              <div><strong>{{ info.content }}</strong> </div>
                            </div>
                          </v-list-item-content>
                        </v-list-item>
                        <v-divider :key="`divider-${i}`" v-if="i < (listInfo.length - 1)"></v-divider>
                      </template>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col md="4">
                <user-identity-verification
                    :user-id="user.id"
                    class="mb-3"
                />
                <v-card outlined>
                  <v-card-title>
                    <h6>Properties</h6>
                  </v-card-title>
                  <v-virtual-scroll
                      v-if="userProperties.length"
                      :items="userProperties"
                      height="250"
                      item-height="60"
                  >
                    <template #default="{ item: property, index }">
                      <v-list-item>
                        <v-list-item-avatar>
                          <v-img :src="property.image"></v-img>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title v-html="property.name"></v-list-item-title>
                          <v-list-item-subtitle><small>#{{ property.id }}</small></v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn icon>
                            <v-icon>mdi-delete-forever-outline</v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                      <v-divider v-if="index < (userProperties.length-1)"></v-divider>
                    </template>
                  </v-virtual-scroll>
                  <v-card-text v-else class="py-5">
                    <p class="grey--text text-center">No property</p>
                  </v-card-text>
                </v-card>
                <v-card class="mt-3" outlined>
                  <v-card-title>
                    <h6>Linked Reservations</h6>
                  </v-card-title>
                  <v-virtual-scroll
                      v-if="userReservations.length"
                      :items="userReservations"
                      height="250"
                      item-height="60"
                  >
                    <template #default="{ item: reservation, index }">
                      <v-list-item :to="{name: 'dashboard.reservation.show', params: { id: reservation.id } }">
                        <v-list-item-avatar>
                          <v-img :src="reservation.property.image"></v-img>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-subtitle class="text-right">
                            <small>{{ momentFromDate(reservation.checkin_date).format('MMM D, YYYY') }}</small>
                          </v-list-item-subtitle>
                          <v-list-item-title class="mt-n5" v-html="reservation.name" ></v-list-item-title>
                          <v-list-item-subtitle><small>#{{ reservation.id }}</small></v-list-item-subtitle>
                          <v-list-item-subtitle class="text-right mt-n5">
                            <reservation-status x-small :reservation="reservation" />
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-divider v-if="index < (userReservations.length-1)"></v-divider>
                    </template>
                  </v-virtual-scroll>
                  <v-card-text v-else class="py-5">
                    <p class="grey--text text-center">No reservation</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>
          <div v-else class="py-5 text-center grey--text">
            <h5 class="headline">{{id}}</h5>
            <p>User not found</p>
          </div>
        </data-container>
      </v-col>
    </v-row>
  </dashboard>
</template>

<script>
import moment from "moment";
import Dashboard from "@/views/Dashboard";
import {mapActions, mapGetters, mapMutations} from "vuex";
import gql from "graphql-tag";
import UserIdentityVerification from "@/domain/User/Components/IdentityVerification";
import DataContainer from "@/components/DataContainer";
import UsersOptions from "@/domain/Dashboard/Components/UsersOptions";
import ReservationStatus from "@/domain/Reservation/Components/ReservationStatus";

export default {
  name: "DashboardUser",
  components: {ReservationStatus, UsersOptions, DataContainer, UserIdentityVerification, Dashboard },
  data() {
    return {
      user: null,
      tab: null,
      loading: false,
    }
  },
  computed: {
    ...mapGetters(['dashboard']),
    breadcrumbs() {
      return [
        {
          text: "Home",
          to: { name: 'home' }
        },
        {
          text: "Users",
          to: { name: 'dashboard.users' }
        },
        {
          text: this.user ? this.name : this.id,
          to: this.$route
        }
      ]
    },
    id() {
      return this.$route.params.id;
    },
    name() {
      return this.user
          ? [this.user.first_name, this.user.last_name ].join(" ")
          : ""
    },
    listInfo() {
      if(!this.user) return [];
      return [
        {
          label: "First Name",
          content: this.$options.filters.nullable(this.user.first_name)
        },
        {
          label: "Last Name",
          content: this.$options.filters.nullable(this.user.name.last_name)
        },
        {
          label: "Phone number",
          content: this.$options.filters.nullable(this.user.phone)
        },
        {
          label: "User ID",
          content: this.$options.filters.nullable(this.user.id)
        },
        {
          label: "Email",
          content: this.$options.filters.nullable(this.user.email)
        },
        {
          label: "Sex",
          content: this.$options.filters.nullable(this.user.guest_info?.gender)
        },
        {
          label: "Country",
          content: this.$options.filters.nullable(this.user.id_verification?.info?.country)
        },
        {
          label: "ID Type",
          content: this.$options.filters.nullable(this.user.id_verification?.info?.id_type)
        },
        {
          label: "ID Number",
          content: this.$options.filters.nullable(this.user.id_verification?.info?.id_number)
        },
        {
          label: "First name on ID",
          content: this.$options.filters.nullable(this.user.id_verification?.info?.first_name)
        },
        {
          label: "Last name on ID",
          content: this.$options.filters.nullable(this.user.id_verification?.info?.last_name)
        },
        {
          label: "Property to Account",
          content: this.$options.filters.nullable(this.userProperties.length)
        },
        {
          label: "Linked Reservations",
          content: this.$options.filters.nullable(this.userReservations.length)
        },

      ]
    },
    IdVerificationInfo() {
      if(!this.user) return []
      return [

      ]
    },
    userProperties() {
      return this.user && this.user.properties ? this.user.properties : []
    },
    userReservations() {
      return this.user && this.user.q_reservations ? this.user.q_reservations : []
    },
    createdAtMoment() {
      return this.user ? moment.unix(this.user.timestamp.created_at) : moment();
    }
  },
  methods: {
    ...mapActions(['query']),
    ...mapMutations(['TOAST_ERROR']),
    queryUser() {
      this.loading = true;
      this.query({
        query: gql`
          query getUserByID($id: ID!){
            getUserByID(id: $id){
                id
                email
                phone
                name{
                    first_name
                    last_name
                }
                image
                status
                phone_meta{
                    country_code
                    phone_number
                }
                guest_info {
                    gender
                    phone
                    address
                    email
                    age
                }
                properties {
                    id
                    name
                    image
                    address
                }
                reservations {
                    id
                    name
                    property_id
                    property_name
                    property_address
                    property_image
                    checkin_date
                    checkout_date
                }
                q_reservations {
                  id
                  name
                  status
                  checkin_date
                  checkout_date
                  property {
                    id
                    name
                    image
                  }
                }
                id_verification {
                     info {
                        first_name
                        last_name
                        country
                        id_type
                        id_number
                        dob
                        phone_number
                    }
                    stripe {
                        type
                        status
                        session
                        report
                        metadata {
                            user_id
                            property_id
                            reservation_id
                        }
                        last_updated
                    }
                    upload {
                        url
                        verified_at
                        verified_by {
                            property {
                                id
                                name
                            }
                            user {
                                id
                                first_name
                                last_name
                            }
                        }
                    }
                    smile {
                        result_id
                        result_text
                        result_code
                        last_updated
                        result {
                            ResultCode
                            ResultText
                            Actions {
                                Liveness_Check
                                Register_Selfie
                                Selfie_Provided
                                Verify_ID_Number
                                Human_Review_Compare
                                Return_Personal_Info
                                Selfie_To_ID_Card_Compare
                                Human_Review_Update_Selfie
                                Human_Review_Liveness_Check
                                Selfie_To_ID_Authority_Compare
                                Update_Registered_Selfie_On_File
                                Selfie_To_Registered_Selfie_Compare
                            }
                        }
                    }
                }
                timestamp {
                    created_at
                    updated_at
                }
            }
           }
        `,
        variables: {
          id: this.id
        }
      }).then(response => {
        this.user = response.data.getUserByID;
      })
      .catch(e => {
        this.TOAST_ERROR({
          show: true,
          message: "Couldn't get user.",
          retry: () => this.queryUser(),
          exception: e
        })
      }).finally(() => {
        this.loading = false
      })
    },
    getUserFromSystemData() {
      if(this.dashboard) {
        this.user = this.dashboard.users.find(r => r.id === this.id);
      }
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.queryUser()
      }
    }
  }
}

</script>