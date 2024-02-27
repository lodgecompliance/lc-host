import gql from 'graphql-tag';

export default gql`
query getPropertyNotificationTypes {
    getPropertyNotificationTypes {
       id
       name
    }
}
`
