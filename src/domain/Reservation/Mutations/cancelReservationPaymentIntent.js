import gql from 'graphql-tag';
export default gql`
    mutation cancelReservationPaymentIntent($property_id: ID!, $intent_id: ID!, $reason: String){
        cancelReservationPaymentIntent(property_id: $property_id, intent_id: $intent_id, reason: $reason) {
            id
            currency
            amount
            status
            metadata {
                user_id
                reservation_id
                charge_id
                property_id
            }
            captured
            refunded
            amount_captured
            amount_refunded
            receipt_url
            net_captured
        }
    }`;