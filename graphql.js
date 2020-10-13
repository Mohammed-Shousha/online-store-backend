const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')

const schema = buildSchema(`
  type Query {
    name: String,
    age: Int,
    study: Field,
    hobbies : [Hobby]
  }
  type Hobby {
    name: String,
    occ: String
  }
  type Field {
    name: String,
    started: Int
  }
`)

const root = { 
    name: () => 'mo',
    age: () => 20 ,
    hobbies: ()=> [{name:'Reading', occ: 'Daily'},{name:'Swimming', occ:'Weekly'}, {name:'Running', occ:'Daily'}],
    study: ()=> [{name: 'Mechatronics', started :2018}]
}

const app = express()

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}))

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'))