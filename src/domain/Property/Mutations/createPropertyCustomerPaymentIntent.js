import gql from 'graphql-tag';

export default gql`

    mutation createPropertyCustomerPaymentIntentForCard($property_id: ID!, $customer_id: ID!, $amount: Int, $currency: String, $description: String, $card: StripeCustomCardInput){
        createPropertyCustomerPaymentIntentForCard(property_id: $property_id, customer_id: $customer_id, amount: $amount, currency: $currency, description: $description, card: $card){
            id
            amount
            currency
            status
            client_secret
            next_action {
                type
            }
        }
    }
`