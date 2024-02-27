import gql from 'graphql-tag';

export default gql`
    query getPropertyUserInvite($property_id: ID!, $invite_id: ID!){
        getPropertyUserInvite(property_id: $property_id, invite_id: $invite_id){
            id
            email
            role
            permissions
            user_id
            created_at
            confirmed_at
            user {
                name {
                    first_name
                    last_name
                }
                image
            }
        }
    }`;