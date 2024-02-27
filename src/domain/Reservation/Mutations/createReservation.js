import gql from 'graphql-tag';

export default gql`
    mutation createReservation($property_id: ID!, $data: ReservationInput!) {
        createReservation(property_id: $property_id, data: $data ){
            id
        }
    }`;