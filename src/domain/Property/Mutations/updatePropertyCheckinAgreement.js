import gql from 'graphql-tag';

export default gql`

    mutation updatePropertyCheckinAgreement($property_id: ID!, $agreement_id: ID!, $data: PropertyCheckinAgreementInput){
        updatePropertyCheckinAgreement(property_id: $property_id, agreement_id: $agreement_id, data: $data){
            id
            agreement
            text
            link
        }
    }
`