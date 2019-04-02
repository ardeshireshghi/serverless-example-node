const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Set in `environment` of serverless.yml
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const users = require('./users');

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

const passwordMatch = (rawPassword, hashedPassword) => {
  const shasum = crypto.createHash('sha1');
  shasum.update(rawPassword);
  return shasum.digest('base64') === hashedPassword;
};

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.auth = (event, context, callback) => {
  console.log('event', event);
  if (!event.authorizationToken) {
    return callback('Unauthorized');
  }

  const tokenParts = event.authorizationToken.split(' ');
  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    return callback('Unauthorized');
  }

  try {
    jwt.verify(tokenValue, PUBLIC_KEY, {}, (verifyError, decoded) => {
      if (verifyError) {
        console.log('verifyError', verifyError);
        // 401 Unauthorized
        console.log(`Token invalid. ${verifyError}`);
        return callback('Unauthorized');
      }
      // is custom authorizer function
      console.log('valid from customAuthorizer', decoded);
      return callback(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
    });
  } catch (err) {
    console.log('catch error. Invalid token', err);
    return callback('Unauthorized');
  }
};

// Public API
module.exports.publicEndpoint = (event, context, callback) => callback(null, {
  statusCode: 200,
  headers: {
      /* Required for CORS support to work */
    'Access-Control-Allow-Origin': '*',
      /* Required for cookies, authorization headers with HTTPS */
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify({
    message: 'Hi ⊂◉‿◉つ from Public API',
  }),
});

// Private API
module.exports.privateEndpoint = (event, context, callback) => callback(null, {
  statusCode: 200,
  headers: {
      /* Required for CORS support to work */
    'Access-Control-Allow-Origin': '*',
      /* Required for cookies, authorization headers with HTTPS */
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify({
    message: 'Hi ⊂◉‿◉つ from Private API. Only logged in users can see this',
  }),
});

module.exports.login = (event, context, callback) => {
  console.log(event);
  const { email, password } = JSON.parse(event.body);
  const user = users.find(user => user.email === email && passwordMatch(password, user.password));

  if (!user) {
    return callback(null, {
      statusCode: 200,
      headers: {
          /* Required for CORS support to work */
        'Access-Control-Allow-Origin': '*',
          /* Required for cookies, authorization headers with HTTPS */
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: true,
        message: 'Invalid email and/or password'
      })
    });
  }

  const privateKey = process.env.PRIVATE_KEY;

  const accessToken = jwt.sign({
    name: user.name,
    email: user.email,
    sub: user.id,
  }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '1 day'
  });

  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      accessToken
    })
  });
};
