import gql from 'graphql-tag';

export default gql`
    mutation createPropertyUser($property_id: ID!, $data: PropertyUserInput! ){
        createPropertyUser(property_id: $property_id, data: $data){
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