import gql from 'graphql-tag';

export default gql`
    query getAuthUser {
        getAuthUser {
            id
            email
            phone
            first_name
            last_name
            full_name
            image
            status
            account_type
        }
    }`;