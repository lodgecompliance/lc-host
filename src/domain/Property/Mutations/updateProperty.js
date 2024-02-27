import gql from 'graphql-tag';

export default gql`

    mutation updateProperty($id: ID!, $data: PropertyInput!){
        updateProperty(id: $id, data: $data){
            id
            user_id
            name
            rules
            terms
            email
            phone
            phone_meta {
                country_code
                phone_number
                complete_phone
            }
            full_address
            address {
                street
                city
                country
                postal_code
            }
            subscription {
                status
                trial_start
                trial_end
                current_period_start
                current_period_end
            }
            active
            is_owner
            auth_access {
                role
                permissions
            }
            default_currency
            integrations
            stripe_connected
        }
    }
`