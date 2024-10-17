import gql from 'graphql-tag';

export default gql`

    mutation createPropertyCheckinInstruction($property_id: ID!, $title: String, $body: String!){
        createPropertyCheckinInstruction(property_id: $property_id, title: $title, body: $body){
            id
            title
            body
        }
    }
`