import moment from 'moment';
import CHECKOUT_RESERVATION from "@/domain/Reservation/Mutations/checkoutReservation";
import CANCEL_RESERVATION from "@/domain/Reservation/Mutations/cancelReservation";
import DELETE_RESERVATION from "@/domain/Reservation/Mutations/deleteReservation";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            actionsLoading: []
        }
    },
    computed: {
        property() {
            return this.reservation?.property
        },

        propertyInAuthUser() {
            return (this.$store.getters.properties || [])
                .find(p => p.id === this.reservation.property_id);
        },

        propertyAccess() {
            return this.propertyInAuthUser?.access || {}
        },

        propertyPermissions() {
            if(!this.propertyInAuthUser) return [];
            if(!this.propertyInAuthUser.access) return [];
            if(!this.propertyInAuthUser.access.permissions) return [];
            return this.propertyInAuthUser.access.permissions;
        },

        hasPermissionToEdit() {
            return (this.propertyAccess.is_admin) || this.propertyPermissions.includes('reservation.update')
        },

        hasPermissionToDelete() {
            return this.propertyAccess.is_admin || this.propertyPermissions.includes('reservation.delete')
        },

        hasPermissionToManageGuest() {
            return this.propertyAccess.is_admin || this.propertyPermissions.includes('reservation.guest.manage')
        },
        hasPermissionToManageCharge() {
            return this.propertyAccess.is_admin || this.propertyPermissions.includes('reservation.charge.manage')
        },
        hasPermissionToApprove() {
            return this.propertyAccess.is_admin || this.propertyPermissions.includes('reservation.checkin.approve')
        },

        hasPermissionToUpdate() {
            return this.propertyAccess.is_admin || this.propertyPermissions.includes('reservation.update')
        },

        checkinPassed() {
            if(!this.checkinMoment) return true;
            return this.checkinMoment.isBefore(moment().format('YYYY-MM-DD'))
        },

        checkoutPassed() {
            if(!this.checkoutMoment) return true;
            return !this.checkoutMoment.isSameOrAfter(moment().format('YYYY-MM-DD'));
        },

        checkinMoment() {
            return this.reservation ? moment(this.reservation.checkin_date) : null;
        },

        checkoutMoment() {
            return this.reservation ? moment(this.reservation.checkout_date) : null;
        },

        checkedinAtMoment() {
            return moment.unix(this.reservation.checkedin_at);
        },

        approvedAtMoment() {
            return moment.unix(this.reservation.approved_at);
        },

        checkedoutAtMoment() {
            return moment.unix(this.reservation.checkedout_at);
        },

        createdAtMoment() {
            return moment.unix(this.reservation.timestamp.created_at);
        },

        updatedAtMoment() {
            return this.reservation.timestamp.updated_at ? moment.unix(this.reservation.timestamp.updated_at) : null
        },

        cancelledAtMoment() {
            return moment.unix(this.reservation.cancelled_at);
        },

        noOfNight() {
            if(this.reservation && this.checkinMoment && this.checkoutMoment) {
                return this.checkoutMoment.diff(this.checkinMoment, 'days');
            }
            return 0;
        },

        noOfGuest() {
            if(this.guests) return this.guests.length;
            if(this.reservation && this.reservation.guests) {
                return this.reservation.guests.length
            }
            return 1;
        },

        bookingChannel() {
            return this.reservation?.booking_channel?.label === 'Other'
                    ? this.reservation.booking_channel.id
                    : this.reservation?.booking_channel?.label
        }
    },
    methods: {
        ...mapActions([
            'query',
            'mutate'
        ]),
        checkoutReservation() {
            this.actionsLoading.push('checkingout');
            this.$store.commit('SNACKBAR', {
                status: true,
                text: `Checkin out ${this.reservation.name}'s reservation ${this.reservation.id}...`,
                color: "info",
                timeout: -1
            })
            this.mutate({
                mutation: CHECKOUT_RESERVATION,
                variables: {
                    id: this.reservation.id
                }
            }).then(response => {
                const checkout = response.data.checkoutReservation;
                if(checkout) {
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        text: `${this.reservation.name}'s reservation ${this.reservation.id} checked out successfully`,
                        color: "success"
                    })
                    this.$emit("reservation-updated", checkout)
                }
            })
            .catch(e => {
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Could not checkout reservation. ${e.message}`,
                    color: "error"
                })
            })
            .finally(() => {
                this.actionsLoading.splice(this.actionsLoading.indexOf('checkingout'));
            })
        },
        cancelReservation() {
            this.$store.commit('SNACKBAR', {
                status: true,
                text: `Cancelling ${this.reservation.name}'s reservation ${this.reservation.id}...`,
                color: "info",
                timeout: -1
            })
            this.mutate({
                mutation: CANCEL_RESERVATION,
                variables: {
                    id: this.reservation.id
                }
            }).then(response => {
                const cancellation = response.data.cancelReservation;
                if(cancellation) {
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        text: `${this.reservation.name}'s reservation ${this.reservation.id} cancelled successfully`,
                        color: "success"
                    })
                    this.$emit("reservation-updated", cancellation)
                }
            })
            .catch(e => {
                this.$store.commit('SNACKBAR', {
                    status: true,
                    text: `Could not cancel reservation. ${e.message}`,
                    color: "error"
                })
            })
        },
        deleteReservation() {
            this.$store.commit('SNACKBAR', {
                status: true,
                text: `Deleting ${this.reservation.name}'s reservation ${this.reservation.id}...`,
                color: "info",
                timeout: -1
            })
            this.mutate({
                mutation: DELETE_RESERVATION,
                variables: {
                    id: this.reservation.id
                }
            })
            .then(response => {
                if(response.data.deleteReservation) {
                    this.$store.commit("SNACKBAR", {
                        status: true,
                        text: "Reservation deleted.",
                        color: "success"
                    });
                    this.$emit('reservation-deleted', this.reservation)
                }
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    message: `Could not delete reservation.`,
                    retry: () => this.deleteReservation(),
                    exception: e
                })
            })
        },
    }
}