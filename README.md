<!--
title: 'AWS API Gateway Custom Authorizer Function with Auth0 example in NodeJS'
description: 'This is an example of how to protect API endpoints with Auth0, JSON Web Tokens (jwt) and a custom authorizer lambda function.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/erezrokah'
authorName: 'Erez Rokah'
authorAvatar: 'https://avatars0.githubusercontent.com/u/26760571?v=4&s=140'
-->
# API Gateway Custom Authorizer Function

This is an example of how to protect API endpoints with JSON Web Tokens (jwt) and a [custom authorizer lambda function](https://serverless.com/framework/docs/providers/aws/events/apigateway#http-endpoints-with-custom-authorizers).

Custom Authorizers allow you to run an AWS Lambda Function before your targeted AWS Lambda Function. This is useful for Microservice Architectures or when you simply want to do some Authorization before running your business logic.

## Use cases

- Protect API routes for authorized users

## Setup

1. `npm install` json web token dependencies

2. RUN `scripts/create_rs256_key.sh`to create public and parivate key pairs

3. Deploy the service with `serverless-deploy` and grab the public and private endpoints.

  ```js
  /* frontend/app.js */
  // replace these values in app.js
  // Change this based on local
  const baseApiUrl = 'http://localhost:3000';
  const PUBLIC_ENDPOINT = `${baseApiUrl}/api/public`;
  const PRIVATE_ENDPOINT = `${baseApiUrl}/api/private`;
  ```

4. Deploy Frontend to host of your choosing

## Custom authorizer functions

[Custom authorizers functions](https://aws.amazon.com/blogs/compute/introducing-custom-authorizers-in-amazon-api-gateway/) are executed before a Lambda function is executed and return an Error or a Policy document.

The Custom authorizer function is passed an `event` object as below:

```javascript
{
  "type": "TOKEN",
  "authorizationToken": "<Incoming bearer token>",
  "methodArn": "arn:aws:execute-api:<Region id>:<Account id>:<API id>/<Stage>/<Method>/<Resource path>"
}
```

## Frontend

The frontend is a bare bones vanilla javascript implementation.

You can replace it with whatever frontend framework you like =)

API calls are made with the browser's native `fetch` api.
