import gql from 'graphql-tag';

export default gql`
    mutation approveReservationCheckin($id: ID! ) {
        approveReservationCheckin(id: $id) {
            id
        }
    }`;