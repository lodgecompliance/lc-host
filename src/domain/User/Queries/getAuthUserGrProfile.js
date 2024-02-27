import gql from 'graphql-tag';

export default gql`
    query getGrProfile{
        getAuthUser{
            guest_info {
                gender
                phone
                address
                email
                age
            }
            properties{
                id
                business_id
                name
                email
                phone
                address
                status
                image
                cover_image
                active
                currency
                checkin_points
                access {
                    role
                    enabled
                    is_admin
                    permissions
                }
                integrations {
                    api {
                        key
                    }
                    ezee {
                        integration_id
                    }
                    zapier {
                        authorized
                        last_poll
                    }
                    stripe {
                        integration_id
                        account {
                            business_profile {
                                name
                                url
                            }
                        }
                        payment {
                            always_use_3d_secure
                        }
                   }
                   paystack {
                       integration_id
                   }
                   smile {
                       integration_id
                   }
                   mailgun {
                       integration_id
                   }
                   message_bird {
                        integration_id
                        channels
                   }
                   remotelock {
                        integration_id
                        settings {
                            pin_strategy
                            start_time
                            end_time
                            days_in_advance
                        }
                    }
                }
                payment_integrations
                notifications {
                    id
                    type
                    title
                    text
                    time
                    timestamp
                    read_at
                    metadata {
                        key
                        value
                    }
                }
                timestamp {
                    created_at
                    updated_at
                }
            }
        }
    }`;