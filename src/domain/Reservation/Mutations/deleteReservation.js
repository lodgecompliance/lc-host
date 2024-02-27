import gql from 'graphql-tag';

export default gql`
    mutation deleteReservation ($id: ID!) {
        deleteReservation(id: $id) 
    }`;