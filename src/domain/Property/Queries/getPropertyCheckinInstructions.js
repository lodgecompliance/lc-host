import gql from 'graphql-tag';

export default gql`
    query getPropertyById($id: ID!){
        getPropertyById(id: $id){
            checkin_instructions{
                id
                title
                body
            }           
        }
    }`;