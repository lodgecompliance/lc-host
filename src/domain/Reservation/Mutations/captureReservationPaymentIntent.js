import gql from 'graphql-tag';

export default gql`
    mutation captureReservationPaymentIntent($property_id: ID!, $intent_id: ID!, $amount: Int){
        captureReservationPaymentIntent(property_id: $property_id, intent_id: $intent_id, amount: $amount) {
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