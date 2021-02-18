import 'source-map-support/register'
import { todoExists, getUploadUrl, setImageUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const bucketName = process.env.TODOS_S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
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

  const validTodoId = await todoExists(userId, todoId)

  if (!validTodoId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }
  
  const url = await getUploadUrl(todoId)
  setImageUrl(todoId, userId, url)

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    })
  }
}
