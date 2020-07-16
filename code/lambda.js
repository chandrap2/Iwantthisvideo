"use strict";

const awsServerless = require("aws-serverless-express");
const app = require("./server-test.js");
const server = awsServerless.createServer(app);

exports.handler = (event, context) => awsServerless.proxy(server, event, context);
