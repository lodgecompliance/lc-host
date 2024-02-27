import gql from 'graphql-tag';

export default gql`
    mutation updatePropertyUser($property_id: ID!, $invite_id: ID!, $data: PropertyUserInput! ){
        updatePropertyUser(property_id: $property_id, invite_id: $invite_id, data: $data){
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
    }
`