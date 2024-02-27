import gql from 'graphql-tag';

export default gql`

    mutation deletePropertyCharge($property_id: ID!, $charge_id: ID!){
        deletePropertyCharge(property_id: $property_id, charge_id: $charge_id)
    }
`