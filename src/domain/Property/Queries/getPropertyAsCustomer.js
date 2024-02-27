import gql from 'graphql-tag';

export default gql`
    query getBusinessById($id: ID!){
        getBusinessById(id: $id){
            stripe_customer {
                customer {
                    id
                    object
                    address {
                        city
                        country
                        line1
                        line2
                        postal_code
                        state
                    }
                    balance
                    created
                    currency
                    description
                    email
                    livemode
                    name
                    phone
                    default_source
                }
                sources {
                    has_more
                    data {
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
        }
    }`;