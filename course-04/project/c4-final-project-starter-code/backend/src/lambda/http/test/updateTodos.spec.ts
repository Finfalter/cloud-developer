import { APIGatewayProxyResult } from 'aws-lambda'
import { testEvent, createLogger, testTodoItem, validUserId } from './test_utils.test'

const assert = require("assert");
const sinon = require("sinon");

const todos = require('../../../businessLogic/todos');
const logger = require('../../../utils/logger');
const utils = require('../../utils');

describe("updateTodos", function () {
	let getUserIdStub;
	let updateTodo;
  let createLoggerStub;

	beforeEach(function () {
		getUserIdStub = sinon.stub(utils, "getUserId");
		updateTodo = sinon.stub(todos, "updateTodo");
    createLoggerStub = sinon.stub(logger, "createLogger").returns(createLogger('updateTodos'));
	});

	afterEach(function () {
		getUserIdStub.restore();
		updateTodo.restore();
    createLoggerStub.restore();
	});

	describe("when the user id is invalid", function () {
		it("respond with a 401, 'User is not authorized'", async function () {
			getUserIdStub.returns(undefined);

			// embedded require to be able to mock createLogger
			const lambdas = require("../updateTodo");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 401);
			assert.equal(result.body, JSON.stringify({error: 'User is not authorized'}));
		});
	});

	describe("when the todo given to update does not exist", function () {
		it("respond with a 404, Not Found, and and empty body", async function () {
			getUserIdStub.returns(validUserId);
			updateTodo.returns(Promise.resolve(undefined));

			// embedded require to be able to mock createLogger
			const lambdas = require("../updateTodo");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 404);
			assert.equal(result.body, '');
		});
	});

	describe("when an existing todo is given to update", function () {
		it("respond with a 201, Created, and and empty body", async function () {
			getUserIdStub.returns(validUserId);
			updateTodo.returns(Promise.resolve(testTodoItem));

			// embedded require to be able to mock createLogger
			const lambdas = require("../updateTodo");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 201);
			assert.equal(result.body, '');
		});
	});

});