import gql from 'graphql-tag';

export default gql`

    mutation removePropertyUser($property_id: ID!, $invite_id: ID!){
        removePropertyUser(property_id: $property_id, invite_id: $invite_id)
    }
`