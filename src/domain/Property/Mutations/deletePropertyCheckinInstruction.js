import gql from 'graphql-tag';

export default gql`

    mutation deletePropertyCheckinInstruction($property_id: ID!, $instruction_id: ID!){
        deletePropertyCheckinInstruction(property_id: $property_id, instruction_id: $instruction_id)
    }
`