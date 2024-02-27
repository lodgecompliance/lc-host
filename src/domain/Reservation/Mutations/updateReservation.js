import gql from 'graphql-tag';

export default gql`
    mutation updateReservation($id: ID!, $data: ReservationInput!) {
        updateReservation(id: $id, data: $data){
            id
        }
    }`;