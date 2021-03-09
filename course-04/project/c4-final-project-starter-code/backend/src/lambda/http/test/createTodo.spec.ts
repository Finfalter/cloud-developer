import { APIGatewayProxyResult } from 'aws-lambda'
import { testEvent, testTodoItem, createLogger} from './test_utils.test'

const assert = require("assert");
const sinon = require("sinon");

const todos = require('../../../businessLogic/todos');
const logger = require('../../../utils/logger');
const utils = require('../../utils');

describe("createTodo", function () {
	let getUserIdStub;
	let createTodoStub;
  let createLoggerStub;

	beforeEach(function () {
		getUserIdStub = sinon.stub(utils, "getUserId");
		createTodoStub = sinon.stub(todos, "createTodo");
    createLoggerStub = sinon.stub(logger, "createLogger").returns(createLogger('createTodo'));
	});

	afterEach(function () {
		getUserIdStub.restore();
		createTodoStub.restore();
    createLoggerStub.restore();
	});

	describe("when the user id is invalid", function () {
		it("respond with a 401, 'User is not authorized'", async function () {
			getUserIdStub.returns(undefined);

			// embedded require to be able to mock createLogger
			const lambdas = require("../createTodo");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 401);
			assert.equal(result.body, JSON.stringify({error: 'User is not authorized'}));
		});
	});

	describe("when the user id is valid", function () {
		it("a new todo is created and returned in a 201 response", async function () {
			getUserIdStub.returns("123");
			createTodoStub.returns(Promise.resolve(testTodoItem));

			// embedded require to be able to mock createLogger
			const lambdas = require("../createTodo");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 201);
			assert.equal(result.body, JSON.stringify({
				item : testTodoItem
			}));

		}); 
	});

});
