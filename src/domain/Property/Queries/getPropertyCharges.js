import gql from 'graphql-tag';

export default gql`
    query getPropertyById($id: ID!){
        getPropertyById(id: $id){
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
        }
    }`;