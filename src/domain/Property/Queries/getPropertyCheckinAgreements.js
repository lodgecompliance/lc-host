import gql from 'graphql-tag';

export default gql`
    query getPropertyById($id: ID!){
        getPropertyById(id: $id){
            checkin_agreements {
                id
                agreement
                text
                link
            } 
        }
    }`;