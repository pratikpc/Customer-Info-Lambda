import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';

// Import required AWS SDK clients and commands for Node.js
import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export default async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {

  const jwt = event.requestContext.authorizer?.jwt;
  const claims = jwt?.claims;
  const email = String(claims?.['email'] || 'email');

  const results = await client.send(
    new DeleteItemCommand({
      TableName: String(process.env['TABLE_NAME'] || 'Customers'),
      Key: { email: { S: email } },
      // ReturnValues: 'ALL_OLD',
    })
  );
  
  return { statusCode: 200, body: JSON.stringify(results) };
}