import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { getTodosOfUser } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  logger.info('processing event', {key: event})

  const userId = getUserId(event)

  if (!userId) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'User is not authorized'
      })
    }
  }

  logger.info('identified user', {key: userId})

  if (!userId) {
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

  const todos4user = await getTodosOfUser(userId)

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