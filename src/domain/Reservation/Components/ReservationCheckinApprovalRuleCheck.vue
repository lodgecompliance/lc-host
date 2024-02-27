<template>
  <data-container>
    <template #loading >
      <div>
        <small class="grey--text">checking if checkin can be approved...</small>
      </div>
    </template>
    <div v-if="rules.length">
      <v-list dense>
        <v-list-item v-for="rule in rules" :key="rule.value">
          <v-list-item-icon class="mr-1">
            <v-icon v-if="rule.warning" color="warning">mdi-alert-circle</v-icon>
            <v-icon v-else-if="rule.pass" color="success">mdi-check-circle</v-icon>
            <v-icon v-else v-text="'mdi-close-circle'" color="error"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ rule.label }}
            <v-list-item-subtitle v-if="rule.warning"><small>{{rule.warning}}</small></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
    <div v-else class="my-2">
      <small  class="grey--text">No restriction rule for approving checkin</small>
    </div>
  </data-container>
</template>

<script>
    import gql from "graphql-tag";
    import DataContainer from "@/components/DataContainer";

    export default {
      name: "ReservationCheckinApprovalRuleCheck",
      components: {DataContainer},
      data() {
        return {
          loading: false,
          rules: [],
        }
      },

      props: {
        reservation: Object,
        checkin: Object,
      },
      computed:{

        verification() {
          return this.checkin.verification || {};
        },

        guests() {
          return this.reservation.guests && this.reservation.guests.length ? this.reservation.guests : []
        },

        primaryGuest() {
          return this.guests.find(g => g.user_id === this.reservation.user_id);
        },

        otherGuests() {
          return this.guests.filter(g => g.user_id !== this.reservation.user_id)
        },

        approvalRules() {
          return this.reservation
              && this.reservation.setting
              && this.reservation.setting.checkin_approval_rules ? this.reservation.setting.checkin_approval_rules
              : [];
        }
      },

      methods: {
         getRules() {
             this.loading = true;
             this.$store.dispatch('query', {
               query: gql`
                  query getReservationCheckinApprovalRules {
                      getReservationCheckinApprovalRules {
                          value
                          label
                      }
                  }
                `,
             })
             .then(response => {
               this.rules = response.data.getReservationCheckinApprovalRules ? response.data.getReservationCheckinApprovalRules  : []
               this.computeResult();
             })
             .finally(() => {
               this.loading = false;
             })
         },

        computeResult() {
          this.rules = this.rules.filter(rule => this.approvalRules.includes(rule.value))
              .map(rule => {
                const result = typeof this[rule.value] === 'function' ? this[rule.value]() : { pass:false }
                return { ...rule, ...result }
              })
        },

        verificationStatus(verification) {
          const submission = {
            stripe: verification && verification.stripe,
            smile: verification && verification.smile,
            upload: verification && verification.upload && verification.upload.url
          };
          return {
            stripe: submission.stripe
                && verification.stripe.status
                && verification.stripe.status === 'verified',
            smile: submission.smile
                && verification.smile.response_code
                && !["1020", "1021"].includes(verification.smile.response_code),
            upload: submission.upload && verification.upload.verified_at
          }
        },

        IDVerified(verification) {
          const providerStatuses = this.verificationStatus(verification);
          return Object.values(providerStatuses).some(status => status);
        },

        primary_guest_id_verified() {
           if(!this.reservation.require_id_verification) {
             return {
               pass: true,
               warning: "ID verification is not enabled for reservation"
             }
           }
           return {
             pass: this.IDVerified(this.verification)
           }
        },

        other_guests_id_verified() {
          if(!this.reservation.require_id_verification) {
            return {
              pass: true,
              warning: "ID verification is not enabled for reservation"
            }
          }
          if(!this.otherGuests.length){
            return {
              pass: true,
              warning: "No other guests"
            }
          }
          return {
            pass: this.otherGuests.filter(guest => guest.can_verify_id)
                .every(guest => this.IDVerified(guest.verification))
          }
        },

        all_guest_checked_in() {
          if(!this.guests.length) {
            return {
              pass: true,
              warning: "No other guests"
            }
          }
          return {
            pass: this.otherGuests.every(guest => guest.checkedin_at != null)
          }
        }
      },

      mounted() {
        this.getRules()
      },

      watch: {
        verification: {
          immediate: true,
          handler() {
            this.computeResult();
          }
        },
        guests: {
          immediate: true,
          handler() {
            this.computeResult();
          }
        },
        rules: {
          immediate: true,
          handler(rules) {
            this.$emit('rules', rules);
          }
        }
      }
    }
</script>
