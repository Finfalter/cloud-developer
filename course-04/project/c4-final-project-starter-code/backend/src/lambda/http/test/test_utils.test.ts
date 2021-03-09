import { APIGatewayProxyEvent } from 'aws-lambda'
import { CreateTodoRequest } from '../../../requests/CreateTodoRequest'
import { TodoItem } from '../../../models/TodoItem'

import * as winston from 'winston'
export function createLogger(loggerName: string) {
	return winston.createLogger({
		level: 'error',
    format: winston.format.json(),
    defaultMeta: { name: loggerName },
    transports: [
			new winston.transports.Console()
    ]
  })
}

const todoId = '321';
const validUserId = '123';

const testRequest: CreateTodoRequest = {
	name: 'fake',
	dueDate: '2222-02-22'
}

const testEvent: APIGatewayProxyEvent = {
	body: JSON.stringify(testRequest),
	headers: {'Authorization': ""},
	multiValueHeaders: {},
	httpMethod: '',
	isBase64Encoded: false,
	path: null,
	pathParameters: {'todoId': todoId},
	queryStringParameters: null,
	multiValueQueryStringParameters: null,
	stageVariables: null,
	requestContext: null,
	resource: ''
};

const testTodoItem: TodoItem = {
  userId: validUserId,
  todoId: todoId,
  createdAt: '2020-01-01',
  name: testRequest.name,
  dueDate: testRequest.dueDate,
  done: false
}

export { testRequest, testEvent, testTodoItem, validUserId };