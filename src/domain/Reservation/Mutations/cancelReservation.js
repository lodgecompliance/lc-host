import gql from 'graphql-tag';

export default gql`
    mutation cancelReservation($id: ID!) {
        cancelReservation(id: $id) {
            id
            active
            cancelled
            cancelled_at
            cancelled_by {
                id
                email
                name {
                    first_name
                    last_name
                }
            }
            host_actions {
                key
                value
            }
        }
    }`;