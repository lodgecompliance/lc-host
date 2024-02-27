import gql from 'graphql-tag';

export default gql`

    mutation createPropertyCharge($property_id: ID!, $data: PropertyChargeInput!){
        createPropertyCharge(property_id: $property_id, data: $data){
            id
            title
            amount
            description
            type   
            enable
            optional
            currency
            unit
            multipliers {
                min
                max
                unit
            }
        }
    }
`