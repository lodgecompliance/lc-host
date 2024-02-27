import gql from 'graphql-tag';

export default gql`
    mutation checkoutReservation($id: ID! ) {
        checkoutReservation(id: $id) {
            id
            active
            checkedout
            checkedout_at
            checkedout_by {
                id
                email
                first_name
                last_name
            }
            host_actions {
                key
                value
            }
        }
    }`;