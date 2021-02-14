import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
//import { parseUserId } from '../../auth/utils'
import { getTodosOfUser } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  logger.info('processing event', {key: event})

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  //const validUserId = parseUserId(jwtToken)
  const validUserId = "1"
  //const validUserId = await isUser(userId)  

  logger.info('identified user', {key: validUserId})

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

  const todos4user = await getTodosOfUser(validUserId)

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