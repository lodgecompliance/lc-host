import gql from 'graphql-tag';

export default gql`

    mutation createPropertyCustomerSetupIntent($property_id: ID!, $customer_id: ID!, $description: String, $card: StripeCustomCardInput){
        createPropertyCustomerSetupIntent(property_id: $property_id, customer_id: $customer_id, description: $description, card: $card){
            id
            status
            client_secret
            next_action {
                type
            }
        }
    }
`