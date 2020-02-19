// note - this function MUST be named `identity-signup` to work
// we do not yet offer local emulation of this functionality in Netlify Dev
//
// more:
// https://www.netlify.com/blog/2019/02/21/the-role-of-roles-and-how-to-set-them-in-netlify-identity/
// https://www.netlify.com/docs/functions/#identity-and-functions

exports.handler = async function(event, context) {
  const data = JSON.parse(event.body)
  const { user } = data

  const responseBody = {
    app_metadata: {
      roles: user.email.split('@')[1] === 'trust-this-company.com' ? ['editor'] : ['visitor'],
      my_user_info: 'this is some user info'
    },
    user_metadata: {
      ...user.user_metadata, // append current user metadata
      custom_data_from_function: 'hurray this is some extra metadata'
    }
  }
  const response = axios.post({
    url:'https://hasura-graphql-backend.herokuapp.com/v1/graphql',
    headers:{
      ["x-hasura-admin-secret"]: "notsecretanymore"
    },
    body:{
      query:
        `mutation insert_usersAuth($id:String, $email:String, $name:String) {
        insert_usersAuth(objects: {id:$id,email:$email,name:$name}){
          affected_rows
        }
      }`
    },
    variables:{
      id:user.data,
      email:user.email,
      name:user.user_metadata.full_name
    }
  }).then(response=>{
    return {
      statusCode: 200,
      body: JSON.stringify(responseBody)
    }
  })
  

}
