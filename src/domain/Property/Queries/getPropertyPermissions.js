import gql from 'graphql-tag';

export default gql`
    query getPropertyPermissions {
        getPropertyPermissions {
            property {
                id
                label
                description
            }
            reservation {
                id
                label
                description
            }
        }
    }`;