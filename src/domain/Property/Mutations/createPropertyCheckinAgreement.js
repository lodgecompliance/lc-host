import gql from 'graphql-tag';

export default gql`

    mutation createPropertyCheckinAgreement($property_id: ID!, $data: PropertyCheckinAgreementInput!){
        createPropertyCheckinAgreement(property_id: $property_id, data: $data){
            id
            agreement
            text
            link
        }
    }
`