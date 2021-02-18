import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const logger = createLogger('deleteTodo')

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('processing event', {key: event})
  const todoId = event.pathParameters.todoId
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

  const result  = await deleteTodo(userId, todoId)

  if(result == undefined) {
    logger.warn('tried to delete a non-existing item', {key: result})
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }

  if(result != undefined && result.todoId == todoId) {
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }

  logger.warn('should really never happen', {key: result})

  if(result != undefined && result.todoId != todoId) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }

}
