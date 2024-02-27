import gql from 'graphql-tag';

export default gql`
    query getPropertyById($id: ID!){
        getPropertyById(id: $id){
            integrations {
                api {
                    key
                }
                
                ezee {
                    enabled
                    auth_code
                    hotel_code
                    last_poll
                    last_report
                }
    
                zapier {
                    authorized
                    last_poll
                }
    
                stripe {
                    access_token
                    scope
                    livemode
                    token_type
                    refresh_token
                    stripe_user_id
                    stripe_publishable_key
                    account {
                        business_profile {
                            name
                            url
                        }
                    }
                    setting {
                        payment {
                            always_use_3d_secure
                        }
                    }
               }
    
               paystack {
                   enabled
                   public_key
                   secret_key
               }
    
               smile {
                   enabled
                   partner_id
                   api_key
                   sid_server
               }
    
               mailgun {
                   enabled
                   api_key
                   domain
                   from_address
               }
    
               message_bird {
                    enabled
                    channels
                    account {
                        id
                        name
                    }
               }
    
               remotelock {
                    authorization {
                        token_type
                    }
                    settings {
                        pin_strategy
                        start_time
                        end_time
                        days_in_advance
                    }
                }
           }
        }
    }`;