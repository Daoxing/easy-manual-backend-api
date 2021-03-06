export default `
type User{
    user_id: String!
    user_nme:String,
    display_nme:String,
    email_address:String,
    phone_nbr:String,
    icon_url:String,
    verify_code:String,
    verify_code_created_tms:Date,
    created_tms:Date,
    updated_tms:Date,
    last_login_tms:Date,
    read_recent_terms:Boolean,
    deleted:Boolean,
    gender:GENDERENUM,
    my_groups:[Group],
    my_articles:[Article],
    my_accessible_articles:[Article],
    my_public_articles:[Article],
    onboard:Boolean 
}

enum GENDERENUM{
    MALE
    FEMALE
    UNKNOWN
}

type verifyCodeResult{
    success: Boolean!
    result: User
    message: String
}

type UpdateUserResult{
    success: Boolean!
    result: User
    message: String
}

type searchUsersByNameResult{
    success: Boolean!
    result: [User!]
    message: String
}

type findUserResult{
    success: Boolean!
    result: User
    message: String
}

type usersInGroupResult{
    totalCount:Int!
    users:[User]
    page:pageInfo
}

input UpdateUserInput{
    user_nme:String,
    display_nme:String,
    email_address:String,
    phone_nbr:String,
    gender:GENDERENUM,
    icon_url:String,
}

input searchUsersByNameInput{
    name:String!
    group_id:ID
}

extend type Query{
    me: User
    findUserById(id:ID!):findUserResult
    searchUsersByName(searchInfo:searchUsersByNameInput):searchUsersByNameResult
    usersInGroup(group_id:ID!,sort:Order,page:Pagination):usersInGroupResult
}

extend type Mutation{
    verifyCode(code:String!): verifyCodeResult
    updateUser(userInfo:UpdateUserInput!): UpdateUserResult
}

`;
