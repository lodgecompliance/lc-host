import gql from 'graphql-tag';

export default gql`
    mutation setPropertyNotificationSettings($property_id: ID!, $settings: PropertyNotificationSettingsInput! ){
        setPropertyNotificationSettings(property_id: $property_id, data: $settings){
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
`