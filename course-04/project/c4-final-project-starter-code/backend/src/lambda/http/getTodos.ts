import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
//import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
//const AWSXRay = require('aws-xray-sdk');
//import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoAccess } from '../../dataLayer/todoAccess'
//import { getUserId } from '../utils'

//const XAWS = AWSXRay.captureAWS(AWS)
//const docClient: DocumentClient = createDynamoDBClient()
//const todosTable = process.env.TODOS_TABLE
//const userTable = process.env.USER_TABLE
const todoAccess = new TodoAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  console.log('Caller event', event)

  //const userId = getUserId(event)
  const userId = "1"
  const validUserId = await todoAccess.hasUser(userId)  

  if (!validUserId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'User does not exist'
      })
    }
  }

  // const todos4user = await getTodosPerUser(userId)
  const todos4user = "bla"

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todos4user
    })
  }
}

// async function hasUser(userId: string) {
//   const result = await docClient.query({
//     TableName: todosTable,
//     KeyConditionExpression: 'userId = :userId',
//     ExpressionAttributeValues: {
//       ':userId': userId
//     },
//     ScanIndexForward: false
//   }).promise()
// console.log('Get user: ', result)
// return result.Items.length > 0
// }

// async function hasUser(userId: string) {
//   const result = await docClient
//     .get({
//       TableName: userTable,
//       Key: {
//         id: userId
//       }
//     })
//     .promise()

//   console.log('Get user: ', result)
//   return !!result.Item
// }

// async function getTodosPerUser(userId: string) {
//   const result = await docClient.query({
//     TableName: todosTable,
//     KeyConditionExpression: 'userId = :userId',
//     ExpressionAttributeValues: {
//       ':userId': userId
//     },
//     ScanIndexForward: false
//   }).promise()

//   return result.Items
// }

// function createDynamoDBClient() {
// 	if (process.env.IS_OFFLINE) {
// 		console.log('Creating a local DynamoDB instance')
// 		return new XAWS.DynamoDB.DocumentClient({
// 			region: 'localhost',
// 			endpoint: 'http://localhost:8000'
// 		})
// 	}
// }