import gql from 'graphql-tag';

export default gql`
    query getPropertyUsers($property_id: ID!){
        getPropertyUsers(property_id: $property_id){
            id
            email
            role
            permissions
            user_id
            created_at
            confirmed_at
            invite_url
            active
            user {
                name {
                    first_name
                    last_name
                }
                image
            }
        }
    }`;