import gql from 'graphql-tag';

export default gql`
query getReservationFields {
    getReservationFields {
        id
        label
        placeholder
    }
}
`
