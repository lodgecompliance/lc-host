import gql from 'graphql-tag';

export default gql`

    mutation deletePropertyCheckinInstructionTemplate($property_id: ID!, $template_id: ID!){
        deletePropertyCheckinInstructionTemplate(property_id: $property_id, template_id: $template_id)
    }
`