import gql from 'graphql-tag';

export default gql`
        mutation createReservationCharge($property_id: ID!, $source: String!, $customer: ID, $amount: Int!, $currency: String!, $description: String, $receipt_email: String, $metadata: ReservationPaymentMetadataInput, $capture: Boolean){
            createReservationCharge(property_id: $property_id, source: $source, customer: $customer, amount: $amount, currency: $currency, description: $description, receipt_email: $receipt_email, metadata: $metadata, capture: $capture) {
                id
                description
                currency
                amount
                status
                metadata {
                    user_id
                    reservation_id
                    charge_id
                    property_id
                    base_multiplier {
                        unit
                        quantity
                    }
                    custom_multipliers {
                        unit
                        quantity
                    }
                }
                captured
                refunded
                amount_captured
                amount_refunded
                receipt_url
                net_captured
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
    }`;