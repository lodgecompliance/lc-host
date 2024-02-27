import gql from 'graphql-tag';

export default gql`
    query getPropertyById($id: ID!){
        getPropertyById(id: $id){
            checkin_questions {
                id
                question
                response_type
                required
                parent_question
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
        }
    }`;