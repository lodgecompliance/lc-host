import gql from 'graphql-tag';

export default gql`

    mutation deletePropertyCheckinAgreement($property_id: ID!, $agreement_id: ID!){
        deletePropertyCheckinAgreement(property_id: $property_id, agreement_id: $agreement_id)
    }
`