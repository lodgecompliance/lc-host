import gql from 'graphql-tag';

export default gql`
query getPropertyById($id: ID!) {
    getPropertyById(id: $id) {
        reservation_settings {
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
            channel_configurations {
                id
                label 
                options {
                    can_pay_balance
                    checkin_approval_rules
                }
                reservation_form {  
                    instruction 
                    currency       
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
                    agreements {
                        id
                        agreement
                        link
                        text
                    }
                    # Questions start
                    questions {
                        id
                        question
                        response_type
                        required
                        options {
                            option
                            attachments {
                                agreements {
                                    id
                                    agreement
                                    link
                                }
                                charges {
                                    id
                                    type
                                    title
                                    amount
                                    description
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
                                questions {
                                    id
                                    question
                                    response_type
                                    required
                                    options {
                                        option
                                    }
                                }
                            }
                        }
    
                    }
                    # Questions end
    
                    require_id_verification
                    require_credit_card
                    allow_additional_guest
                    auto_checkin_approval
                    send_checkin_mail
                    checkin_mail
                    
                }
            }
        }  
    }
}
`
