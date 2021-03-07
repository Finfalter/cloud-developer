import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../../requests/CreateTodoRequest'
const assert = require("assert");
const sinon = require("sinon");
const todos = require('../../../businessLogic/todos');
const lambdas = require("../createTodo");
import { TodoItem } from '../../../models/TodoItem'
const utils = require('../../utils');

const myRequest: CreateTodoRequest = {
	name: 'fake',
	dueDate: '2222-02-22'
}

const myEvent: APIGatewayProxyEvent = {
	body: JSON.stringify(myRequest),
	headers: {'Authorization': ""},
	multiValueHeaders: {},
	httpMethod: '',
	isBase64Encoded: false,
	path: null,
	pathParameters: null,
	queryStringParameters: null,
	multiValueQueryStringParameters: null,
	stageVariables: null,
	requestContext: null,
	resource: ''
};

const todoItem: TodoItem = {
  userId: "123",
  todoId: "321",
  createdAt: '2020-01-01',
  name: myRequest.name,
  dueDate: myRequest.dueDate,
  done: false
}

describe("createTodo", function () {
	let getUserIdStub;
	let createTodoStub;

	beforeEach(function () {
		getUserIdStub = sinon.stub(utils, "getUserId");
		createTodoStub= sinon.stub(todos, "createTodo");
	});

	afterEach(function () {
		getUserIdStub.restore();
		createTodoStub.restore();
	});

	describe("when the user id is invalid", function () {
		it("should return a 401 'User is not authorized'", async function () {
			getUserIdStub.returns(undefined);

			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(myEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 401);
			assert.equal(result.body, JSON.stringify({error: 'User is not authorized'}));
		});
	});

	describe("when the user id is valid", function () {
		it("a new todo is created and returned in a 201 response", async function () {
			getUserIdStub.returns("123");
			createTodoStub.returns(Promise.resolve(todoItem));

			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(myEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 201);
			assert.equal(result.body, JSON.stringify({
				item : todoItem
			}));

		}); 
	});

});
