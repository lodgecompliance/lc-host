import gql from 'graphql-tag';

export default gql`
mutation setPropertyReservationSettings($property_id: ID!, $data: PropertyReservationSettingsInput!) {
    setPropertyReservationSettings(property_id: $property_id, data: $data) {
        booking_channels
        fields
        guest_info
        allow_additional_guest
        auto_checkin_approval
        payment_gateway
        send_checkin_mail
        checkin_mail
        checkin_approval_rules
        max_period_for_charge_authorization
    }
}
`