const { graphqlHandler, graphqlError } = require('graphql-serverless')
const { makeExecutableSchema } = require('graphql-tools')
const { app } = require('webfunc')

const itemMocks = [
  { id: 1, name: 'Knock Bits', quantity: 88, price: 12.67, supplier_id: 1 },
  { id: 2, name: 'Widgets', quantity: 10, price: 35.50, supplier_id: 3 }]

const schema = `
  type Item {
    id: ID!
    name: String!
    quantity: Int
    price: Float
    supplier_id: Int
  }
 
  type Query {
      itemsById(id: Int): Item
      allItems: [Item]
      searchItemsByName(name: String!): [Item]
  }
  `

const itemResolver = {
  Query: {
    itemsById(root, { id }, context) {
      const results = id ? itemMocks.filter(p => p.id == id) : itemMocks
      if (results.length > 0)
        return results.pop()
      else
        throw graphqlError(404, `Item with id ${id} does not exist.`)
    },
    allItems(root, args, context) {
      const results = itemMocks;
      if (results.length > 0)
        return results
      else
        throw graphqlError(404, `Item does not exist.`)
    },
    searchItemsByName(root, { name }, context) {
      const results = itemMocks.filter(item => item.name.toLowerCase() === name.toLowerCase());
      if (results.length > 0)
        return results;
      else
        throw graphqlError(404, `No items found with name ${name}`);
    },
  }
}

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: itemResolver
})

const graphqlOptions = {
  schema: executableSchema,
  graphiql: {
    endpoint: '/graphiql'
  },
  context: {
    someVar: 'This variable is passed in the "context" object in each resolver.'
  }
}

app.all(['/', '/graphiql'], graphqlHandler(graphqlOptions))

eval(app.listen('app', 4000))
