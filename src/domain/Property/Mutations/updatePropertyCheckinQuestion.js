import gql from 'graphql-tag';

export default gql`

    mutation updatePropertyCheckinQuestion($property_id: ID!, $question_id: ID!, $data: PropertyCheckinQuestionInput){
        updatePropertyCheckinQuestion(property_id: $property_id, question_id: $question_id, data: $data){
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