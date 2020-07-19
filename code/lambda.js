"use strict";

const awsServerless = require("aws-serverless-express");
const app = require("./server-test.js");
const server = awsServerless.createServer(app);

const aws = require("aws-sdk");
// console.log(aws.config.ac)

exports.handler = (event, context) => awsServerless.proxy(server, event, context);
