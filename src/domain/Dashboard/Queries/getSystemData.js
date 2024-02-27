import gql from 'graphql-tag';

export default gql`
    query getSystemData {
    
        getSystemData {
            properties {
                id
                user_id
                name
                email
                phone
                image
                phone_meta {
                    country_code
                    phone_number
                    complete_phone
                }
                full_address
                address {
                    street
                    city
                    country
                    postal_code
                }
                subscription {
                    status
                    trial_start
                    trial_end
                    current_period_start
                    current_period_end
                }
                active
                default_currency
                integrations
                reservations {
                    id
                    name
                    checkin_date
                    checkout_date
                }
                checkin_points
                status
                timestamp {
                    created_at
                    updated_at
                }
                
            }
            users {
                id
                email
                phone
                name{
                    first_name
                    last_name
                }
                full_name
                image
                phone_meta{
                    country_code
                    phone_number
                }
                guest_info {
                    gender
                    phone
                    address
                    email
                    age
                }
                properties {
                    id
                    name
                    image
                    address
                }
                reservations {
                    id
                    name
                    property_id
                    property_name
                    property_address
                    property_image
                    checkin_date
                    checkout_date
                }
                status
                roles
                timestamp {
                    created_at
                    updated_at
                }
            }
            reservations {
                id
                user_id
                name
                balance
                currency
                room
                booking_reference
                booking_channel {
                    id
                    label
                }
                status
                active
                checkedin
                checkedin_at
                already_checkedin
                approved
                approved_at
                checkin_date
                checkout_date
                cancelled
                cancelled_at
                checkedout
                checkedout_at
                instruction
                checkin_url
                property_id
                property{
                    id
                    name
                    address
                    image
                }
                guests {
                    name
                }
                require_id_verification
                timestamp {
                    created_at
                    updated_at
                }
            }
            system {
                main {
                  key
                  value
                }
            }
          }
    }`;