import gql from 'graphql-tag';

export default gql`
    mutation refundReservationCharge($property_id: ID!, $charge_id: ID!, $amount: Int, $reason: String){
        refundReservationCharge(property_id: $property_id, charge_id: $charge_id, amount: $amount, reason: $reason) {
            id
            currency
            amount
            status
            metadata {
                customer_note
            }
            reason
            charge {
                id
                description
                currency
                amount
                status
                captured
                refunded
                amount_captured
                amount_refunded
                receipt_url
                net_captured
                metadata {
                    user_id
                    reservation_id
                    charge_id
                    property_id
                    refundable
                    base_multiplier {
                        unit
                        quantity
                    }
                    custom_multipliers {
                        unit
                        quantity
                    }
                }
                source {
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
}`;