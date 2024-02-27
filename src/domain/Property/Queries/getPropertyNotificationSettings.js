import gql from 'graphql-tag';

export default gql`
query getPropertyById($id: ID!) {
    getPropertyById(id: $id) {
        notification_settings {
           allow {
                type
                channels
           }
           blocked {
                type
                channels
           }
           email
       }
    }
}
`
