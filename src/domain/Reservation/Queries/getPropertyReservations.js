import gql from 'graphql-tag';

export default gql`
    query getPropertyReservations($id: ID!, $pagination: PaginationInput, $includes: [String]){
        getPropertyReservations(id: $id, pagination: $pagination, includes: $includes){
            data {
                id
                user_id
                property_id
                name
                balance
                currency
                room
                booking_reference
                booking_channel {
                    id
                    label
                }
                active
                status
                checkedin
                already_checkedin
                checkedin_at
                approved
                approved_at
                checkin_date
                checkout_date
                checkedout
                checkedout_at
                cancelled
                cancelled_at
                instruction
                checkin_url
                property{
                    id
                    name
                    address
                    image
                }
                guests{
                    name
                }
                require_id_verification
                require_credit_card
                host_actions {
                    key
                    value
                }
                charges{
                    id
                    title
                    amount
                    description
                    type
                    enable
                    optional
                    currency
                    unit
                    multipliers {
                        min
                        max
                        unit
                    }
                }
                timestamp {
                    created_at
                    updated_at
                }
            }
            pagination {
                page
                size
                offset
                total
            }
        }
    }`;