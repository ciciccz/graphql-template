const { graphqlHandler, graphqlError } = require('graphql-serverless')
const { makeExecutableSchema } = require('graphql-tools')
const { app } = require('webfunc')

const itemMocks = [
  { id: 1, name: 'Knock Bits', quantity: 88, price: 12.67, supplier_id: 1 },
  { id: 2, name: 'Widgets', quantity: 10, price: 35.50, supplier_id: 3 }]

const supplierMocks = [
  { id: 1, name: 'MRU', address: '4825 Mt Royal Gate SW' },
  { id: 3, name: 'UofC', address: '2500 University Dr NW' },]

const schema = `
  type Item {
    id: ID!
    name: String!
    quantity: Int
    price: Float
    supplier_id: Int
  }
  type Supplier {
    id: ID!
    name: String!
    address: String!
  }
  type Query {
      itemsById(id: Int): Item
      allItems: [Item]
      searchItemsByName(name: String!): [Item]
      supplierById(id: Int): Supplier
  }
  type Mutation {
    addItem(name: String!, quantity: Int, price: Float, supplier_id: Int): Item
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
    supplierById(root, { id }, context) {
      const supplier = supplierMocks.find(supplier => supplier.id === id);
      if (supplier) {
        return supplier;
      } else {
        throw graphqlError(404, `Supplier with id ${id} does not exist.`);
      }
    }
  },
  Mutation: {
    addItem(root, { name, quantity, price, supplier_id }, context) {
      if (!name) {
        throw graphqlError(400, 'Item name is required.');
      }
      if (quantity === undefined || quantity < 0) {
        throw graphqlError(400, 'Quantity is invalid.');
      }
      if (price === undefined || price < 0) {
        throw graphqlError(400, 'Price is invalid.');
      }
      if (supplier_id !== undefined && supplier_id < 0) {
        throw graphqlError(400, 'Supplier ID is invalid.');
      }

      const newItem = {
        id: itemMocks.length + 1,
        name,
        quantity,
        price,
        supplier_id
      };
      itemMocks.push(newItem);
      return newItem;
    }
  }
};

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
