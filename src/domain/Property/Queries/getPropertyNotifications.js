import gql from 'graphql-tag';

export default gql`
    query getPropertyNotifications($property_id: ID!, $notification_ids:[ID], $mark_as_read: Boolean){
        getPropertyNotifications(property_id: $property_id, notification_ids: $notification_ids, mark_as_read: $mark_as_read){
            id
            type
            title
            text
            time
            read
            read_at
            timestamp {
                created_at
            }
            metadata {
                key
                value
            }
        }
    }`;