<template>
  <dashboard class="white">
    <template #header>
      <div class="pb-5 pb-md-0 d-flex justify-space-between">
          <h4 class="headline">Verifications</h4>
          <v-btn icon @click="getVerifications" class="ml-2" title="Refresh"> <v-icon>mdi-refresh</v-icon> </v-btn>
      </div>
    </template>
    <data-container :loading="loading" :error="error" @retry="getVerifications">
      <v-row justify="center">
        <v-col cols="12" md="11" lg="10">
          <verifications
              :verifications="combinedVerifications"
              :table="{'class': 'striped', 'show-select': true}"
              :card="{flat: true, 'class': 'mt-n8 mt-md-0 transparent'}"
          />
        </v-col>
      </v-row>
    </data-container>

  </dashboard>
</template>
<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import gql from 'graphql-tag'
import Dashboard from "@/views/Dashboard";
import Verifications from "@/domain/Dashboard/Widgets/Verifications";
import moment from "moment";
import DataContainer from "@/components/DataContainer";
export default {
  name: "DashboardVerifications",
  components: {DataContainer, Verifications, Dashboard },
  data() {
    return {
      loading: false,
      error: null,
    }
  },
  computed: {
    ...mapGetters(['dashboard']),
    verifications() {
      return this.dashboard?.id_verifications
    },
    stripeVerifications() {
      return this.verifications && this.verifications.stripe && this.verifications.stripe.data
      ? this.verifications.stripe.data
      : [];
    },
    smileVerifications() {
      return this.verifications && this.verifications.smile
          ? this.verifications.smile
          : [];
    },
    combinedVerifications() {
      const verifications = this.stripeVerifications.map(verification => {
        return {
          reference: verification.id,
          provider: "Stripe",
          user: verification.user,
          status: verification.status == "requires_input" ? "abandoned" : verification.status,
          timestamp: verification.created,
          document_type: verification.last_verification_report && verification.last_verification_report.document ?
              verification.last_verification_report && verification.last_verification_report.document.type
              : null
        }
      })
      .concat(this.smileVerifications.map(verification => {
        return {
          reference: verification.SmileJobID,
          provider: "Smile",
          user: verification.user,
          status: null,
          timestamp: moment(verification.timestamp).unix(),
          document_type: null
        }
      }));
      return this.sortDataDesc(verifications, "timestamp");
    }
  },
  methods: {
    ...mapActions(['query']),
    ...mapMutations(['TOAST_ERROR', 'SET_DASHBOARD_DATA']),
    getVerifications() {
      this.error = null;
      this.loading = true;
      this.query({
        query: gql `
          query getSystemData {
            getSystemData {
              id_verifications{
                stripe {
                  object
                  has_more
                  data {
                    id
                    type
                    status
                    created
                    metadata {
                      user_id
                      property_id
                    }
                    last_verification_report {
                      document {
                        type
                      }
                    }
                    user {
                      id
                      full_name
                      image
                    }
                  }
                }
                 smile {
                   SmileJobID
                   timestamp
                    ResultCode
                    ResultText
                    Actions {
                      Selfie_Provided
                      Liveness_Check
                    }
                    PartnerParams {
                      user_id
                      property_id
                    }
                    user {
                      id
                      full_name
                      image
                    }
                  }
              }
            }
          }
 `
      })
      .then(response => {
        this.SET_DASHBOARD_DATA({
          ...this.dashboard,
          id_verifications: response.data.getSystemData?.id_verifications
        })
      })
      .catch(e => {
        this.error = e;
      })
      .finally(() => {
        this.loading = false
      })
    }
  },
  mounted() {
    if(this.dashboard?.id_verifications){
      return;
    }
    this.getVerifications();
  }
}
</script>