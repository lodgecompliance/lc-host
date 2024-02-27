import gql from 'graphql-tag';

export default gql`

    mutation createPropertyCheckinQuestion($property_id: ID!, $data: PropertyCheckinQuestionInput){
        createPropertyCheckinQuestion(property_id: $property_id, data: $data){
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
`