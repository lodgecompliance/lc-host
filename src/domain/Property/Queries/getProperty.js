import gql from 'graphql-tag';

export default gql`
    query getPropertyById($id: ID!){
        getPropertyById(id: $id){
            id
            name
            rules
            term_url
            email
            phone
            image
            address
            active
            currency
            access {
                role
                is_admin
            }
            
        }
    }`;