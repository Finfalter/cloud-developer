import { APIGatewayProxyResult } from 'aws-lambda'
import {testEvent, createLogger, testTodoItem, validUserId } from './test_utils.test'

const assert = require("assert");
const sinon = require("sinon");

const todos = require('../../../businessLogic/todos');
const logger = require('../../../utils/logger');
const utils = require('../../utils');

describe("getTodos", function () {
	let getUserIdStub;
	let getTodosOfUser;
  let createLoggerStub;

	beforeEach(function () {
		getUserIdStub = sinon.stub(utils, "getUserId");
		getTodosOfUser = sinon.stub(todos, "getTodosOfUser");
    createLoggerStub = sinon.stub(logger, "createLogger").returns(createLogger('getTodos'));
	});

	afterEach(function () {
		getUserIdStub.restore();
		getTodosOfUser.restore();
    createLoggerStub.restore();
	});

	describe("when the user id is invalid", function () {
		it("respond with a 401, 'User is not authorized'", async function () {
			getUserIdStub.returns(undefined);

			// embedded require to be able to mock createLogger
			const lambdas = require("../getTodos");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 401);
			assert.equal(result.body, JSON.stringify({error: 'User is not authorized'}));
		});
	});

	describe("when the user id is valid", function () {
		it("respond with a 201, Created, and return an empty body in case no todos are assigned to given user", async function () {
			getUserIdStub.returns(validUserId);
			getTodosOfUser.returns(Promise.resolve([]));

			// embedded require to be able to mock createLogger
			const lambdas = require("../getTodos");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(getTodosOfUser.calledOnce, true);
			assert.equal(result.statusCode, 201);
			assert.equal(result.body, '{"items":[]}');
		}); 

		it("respond with a 201, Created, and return the one todo which is assigned to given user", async function () {
			getUserIdStub.returns(validUserId);
			getTodosOfUser.returns(Promise.resolve(testTodoItem));

			// embedded require to be able to mock createLogger
			const lambdas = require("../getTodos");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(getTodosOfUser.calledOnce, true);
			assert.equal(result.statusCode, 201);
			assert.equal(result.body, JSON.stringify({
				items : testTodoItem
			}));
		}); 

		it("respond with a 201, Created, and return multiple todos being assigned to given user", async function () {
			const multipleItems = [testTodoItem, testTodoItem]
			getUserIdStub.returns(validUserId);
			getTodosOfUser.returns(Promise.resolve(multipleItems));

			// embedded require to be able to mock createLogger
			const lambdas = require("../getTodos");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(getTodosOfUser.calledOnce, true);
			assert.equal(result.statusCode, 201);
			assert.equal(result.body, JSON.stringify({
				items : multipleItems
			}));
		});

	});


});