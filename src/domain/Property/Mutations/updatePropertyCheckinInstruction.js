import gql from 'graphql-tag';

export default gql`

    mutation updatePropertyCheckinInstruction($property_id: ID!,  $instruction_id: ID!, $title: String, $body: String!){
        updatePropertyCheckinInstruction(property_id: $property_id,  instruction_id: $instruction_id, title: $title, body: $body){
            id
            title
            body
        }
    }
`