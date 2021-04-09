import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';

// Import required AWS SDK clients and commands for Node.js
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export default async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  const jwt = (event.requestContext.authorizer || { jwt: { claims: {} } }).jwt;
  const claims = jwt.claims || { email: 'email' };
  const email = String(claims['email'] || 'email');

  const customer_data = JSON.parse(event.body || '{}');
  customer_data['email'] = email;

  const results = await client.send(
    new UpdateItemCommand({
      TableName: 'Customers',
      Key: { email: { S: email } },
      ReturnValues: 'ALL_NEW',
      UpdateExpression: 'SET customer_data = :customer_data',
      ExpressionAttributeValues: { ':customer_data': { S: JSON.stringify(customer_data) } },
    })
  );
  return { statusCode: 200, body: JSON.stringify(results) };
};
