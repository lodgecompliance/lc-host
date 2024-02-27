import gql from 'graphql-tag';

export default gql`

    mutation deletePropertyCheckinQuestion($property_id: ID!, $question_id: ID!){
        deletePropertyCheckinQuestion(property_id: $property_id, question_id: $question_id)
    }
`