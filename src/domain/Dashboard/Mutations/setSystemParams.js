import gql from 'graphql-tag';

export default gql`
    mutation setSystemParams($params: [MetaDataInput]){
        setSystemParams(params: $params)
    }
`