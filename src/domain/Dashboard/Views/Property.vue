<template>
  <dashboard :class="`${!$vuetify.breakpoint.mdAndUp ? 'white' : ''}`">
    <template #header>
      <div class="d-flex justify-space-between">
        <h4 class="headline">Properties</h4>
        <v-spacer></v-spacer>
        <v-btn icon @click="queryProperty" class="ml-2" title="Refresh"> <v-icon>mdi-refresh</v-icon> </v-btn>
        <property-admin-options
            v-if="property && !$vuetify.breakpoint.mdAndUp"
            :property="property"
            @checkin-point-transferred="queryProperty"
        />
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
          <property-admin-options
              v-if="property && $vuetify.breakpoint.mdAndUp"
              :property="property"
              @checkin-point-transferred="queryProperty"
          />
        </div>
        <data-container :loading="loading">
          <template v-if="property">
            <div class="d-flex justify-space-between">
              <div class="d-flex align-content-center">
                <v-avatar size="60">
                  <img :alt="property.name"
                       :src="property.image"
                  >
                </v-avatar>
                <div class="ml-3">
                  <h4>{{ property.name }}</h4>
                  <p> {{ property.full_address }} </p>
                </div>
              </div>
              <v-chip color="success" outlined small>{{ property.status }}</v-chip>
            </div>

            <v-row>
              <v-col cols="12" md="8">
                <reservations-chart
                    title="Checkin Statistics"
                    :reservations="propertyReservations"
                    class="mb-3"
                />
                <v-card outlined>
                  <v-card-text>
                    <v-list>
                      <template v-for="(info, i) in listInfo">
                        <v-list-item :key="`info-${i}`">
                          <v-list-item-content>
                            <div class="d-flex justify-space-between">
                              <div>{{ info.label }}</div>
                              <div>
                                <router-link
                                    v-if="info.route" :to="info.route"
                                    class="text-decoration-none"
                                >
                                  <strong>{{info.content}}</strong>
                                </router-link>
                                <strong v-else> {{ info.content }} </strong>
                              </div>
                            </div>
                          </v-list-item-content>
                        </v-list-item>
                        <v-divider :key="`divider-${i}`" v-if="i < (listInfo.length - 1)"></v-divider>
                      </template>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <credit-card-carousel :cards="stripeCards" class="mb-3">
                  <template #card="{ card }">
                    <stripe-credit-card :card="card" color="accent" outlined />
                  </template>
                </credit-card-carousel>
                <property-credit
                    :property="property"
                    :vCard="{outlined: true, color: 'primary', dark: true}"
                    class="mb-3"
                >
                  <template #actions>
                    <add-property-credit
                        :property="property"
                        :activator="{elevation: 0, color: 'white', class: 'primary--text'}"
                        @credited="queryProperty"
                    />
                  </template>
                </property-credit>

                <property-credit-history
                    :card="{flat: true, class: 'transparent'}"
                    :property="property"
                />

              </v-col>
            </v-row>
            <v-card class="mt-5">
              <v-tabs
                  v-model="tab"
              >
                <v-tabs-slider></v-tabs-slider>

                <v-tab href="#reservations">
                  Property Reservations
                </v-tab>

                <v-tab href="#users">
                  Property Users
                </v-tab>
              </v-tabs>
<!--              <v-row justify="start">-->
<!--                <v-col md="6">-->
<!--                  <v-text-field-->
<!--                      v-model="search"-->
<!--                      append-icon="mdi-magnify"-->
<!--                      label="Search"-->
<!--                      dense outlined-->
<!--                      class="mx-3 mt-6"-->
<!--                  ></v-text-field>-->
<!--                </v-col>-->
<!--              </v-row>-->
              <v-tabs-items v-model="tab">
                <v-tab-item value="reservations">
                  <reservations-table
                      dense
                      min-height="500"
                      :reservations="propertyReservations"
                      :search="search"
                      class="striped"
                  />
                </v-tab-item>
                <v-tab-item value="users">
                  <property-users-table
                      :users="propertyUsers"
                      :search="search"
                      class="striped"
                  />
                </v-tab-item>
              </v-tabs-items>
            </v-card>
          </template>
          <div v-else class="py-5 text-center grey--text">
            <h5 class="headline">{{id}}</h5>
            <p>Property not found</p>
          </div>
        </data-container>
      </v-col>
    </v-row>

  </dashboard>
</template>

<script>
import moment from "moment";
import gql from "graphql-tag";
import Dashboard from "@/views/Dashboard";
import {mapActions, mapGetters, mapMutations} from "vuex";
import PropertyCredit from "@/domain/Property/Components/PropertyCredit";
import AddPropertyCredit from "@/domain/Dashboard/Widgets/AddPropertyCredit";
import DataContainer from "@/components/DataContainer";
import PropertyUsersTable from "@/domain/Dashboard/Widgets/PropertyUsersTable";
import ReservationsTable from "@/domain/Dashboard/Widgets/ReservationsTable";
import ReservationsChart from "@/domain/Dashboard/Components/ReservationsChart";
import PropertyCreditHistory from "@/domain/Dashboard/Components/PropertyCreditHistory";
import PropertyAdminOptions from "@/domain/Dashboard/Components/PropertyOptions";
import CreditCardCarousel from "@/components/CreditCardCarousel";
import StripeCreditCard from "@/components/Utilities/StripeCreditCard";
export default {
  name: "DashboardProperty",
  components: {
    StripeCreditCard,
    CreditCardCarousel,
    PropertyAdminOptions,
    PropertyCreditHistory,
    ReservationsChart, PropertyUsersTable, DataContainer, AddPropertyCredit, PropertyCredit, Dashboard,
    ReservationsTable },
  data() {
    return {
      tab: null,
      search: null,
      property: null,
      loading: false,
      cardCarousel: 0
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
          text: "Properties",
          to: { name: 'dashboard.properties' }
        },
        {
          text: this.property ? this.property.name : this.id,
          to: this.$route
        }
      ]
    },
    id() {
      return this.$route.params.id;
    },
    listInfo() {
      if(!this.property) return [];
      return [
        {
          label: "Phone",
          content: this.property.phone
        },
        {
          label: "Email",
          content: this.property.email
        },
        {
          label: "Credit",
          content: 0
        },
        {
          label: "Owner",
          content: this.property.owner ? this.property.owner.full_name : "",
          route: this.property.owner ? { name: 'dashboard.user.show', params: { id: this.property.owner.id } } : null
        },
        {
          label: "Integrations",
          content: this.property && this.property.integrations.length
              ? this.property.integrations.map(i => this.$options.filters.ucfirst(i)).join(", ")
              : 'None'
        },
        {
          label: "Subscription status",
          content: this.$options.filters.nullable(this.property.subscription?.status)
        },
        {
          label: "Created",
          content: this.createdAtMoment.format("L")+", "+this.createdAtMoment.fromNow()
        },
      ]
    },
    createdAtMoment() {
      return this.property ? moment.unix(this.property.timestamp.created_at) : moment();
    },
    propertyReservations() {
      return (this.$store.getters.dashboard?.reservations || []).filter(r => r.property_id === this.id);
    },
    stripeCustomer() {
      return this.property?.stripe_customer?.customer;
    },
    stripeCards() {
      return this.property?.stripe_customer?.sources?.data || [];
    },
    propertyUsers() {
      return this.property?.users || [];
    }

  },
  methods: {
    ...mapActions(['query']),
    ...mapMutations(['TOAST_ERROR']),
    queryProperty() {
      this.loading = true;
      this.query({
        query: gql `
          query getProperty($id: ID!){
              getProperty(id: $id){
                  id
                  name
                  rules
                  terms
                  email
                  phone
                  image
                  status
                  full_address
                  checkin_points
                  subscription {
                      status
                      trial_start
                      trial_end
                      current_period_start
                      current_period_end
                  }
                  active
                  default_currency
                  integrations
                  owner {
                    id
                    full_name
                  }
                  reservations {
                    id
                    name
                    checkin_date
                    checkout_date
                }
                timestamp {
                    created_at
                    updated_at
                }
                stripe_customer {
                    customer {
                        id
                        object
                        address {
                            city
                            country
                            line1
                            line2
                            postal_code
                            state
                        }
                        balance
                        created
                        currency
                        description
                        email
                        livemode
                        metadata {
                            property_id
                            user_id
                        }
                        name
                        phone
                        default_source
                    }
                    sources {
                        has_more
                        data {
                            id
                            name
                            brand
                            exp_month
                            exp_year
                            last4
                            customer
                        }
                    }
                }
                users {
                  email
                  role
                  permissions
                  confirmed_at
                  active
                  user {
                    id
                    full_name
                    image
                  }
                }
              }
          }
      `,
        variables: {
          id: this.id
        }
      }).then(response => {
        this.property = response.data.getProperty;
      })
        .catch(e => {
          this.TOAST_ERROR({
            show: true,
            message: "Couldn't get property.",
            retry: () => this.queryProperty(),
            exception: e
          })
        }).finally(() => {
          this.loading = false
      })
    },
    getPropertyFromSystem() {
      if(this.dashboard) {
        this.property = this.dashboard.properties.find(p => p.id === this.id);
      }
    },
    propertyCredited(history) {
      console.log("credit--->", history);
      this.queryProperty()
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.queryProperty()
      }
    }
  }
}

</script>