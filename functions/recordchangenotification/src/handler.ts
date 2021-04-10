import type { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';

// Import required AWS SDK clients and commands for Node.js
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new SESClient({});

function ExtractEmails(records: DynamoDBRecord[], eventT: 'INSERT' | 'REMOVE') {
  // Only send emails for insertions
  const insertions = records.filter(({ eventName }) => eventName === eventT);
  console.log('Records', eventT, 'are', insertions);
  if (insertions.length === 0) {
    throw new Error(`No items ${eventT}`);
  }

  const emails = insertions
    .map(({ dynamodb }) => dynamodb?.Keys?.['email']?.S)
    .filter((email) => typeof email !== 'undefined')
    .map((email) => String(email));

  console.log(eventT, 'users are ', emails);
  if (emails.length === 0) {
    throw new Error('No users added/removed');
  }
  return emails;
}

export default async (event: DynamoDBStreamEvent): Promise<string> => {
  try {
    const destinationAddress = process.env['DESTINATION_EMAIL'];
    if (destinationAddress == null) throw new Error('Destination email needs to be not null');

    const verifiedSenderAddress = process.env['SENDER_EMAIL_VERIFIED'];
    if (verifiedSenderAddress == null) throw new Error('Sender email needs to be not null');

    const newUserEmails = ExtractEmails(event.Records, 'INSERT');
    const removedUserEmails = ExtractEmails(event.Records, 'REMOVE');

    await client.send(
      new SendEmailCommand({
        Destination: {
          ToAddresses: [destinationAddress],
        },
        Message: {
          Subject: { Data: 'New users have joined' },
          Body: {
            Text: {
              Data: `
The following users have joined ${newUserEmails.join(', ')}
The following users have left ${removedUserEmails.join(', ')}`,
            },
          },
        },
        Source: verifiedSenderAddress,
      })
    );
    return 'All actions finished successfully';
  } catch (err) {
    console.error(err);
    return 'Exception thrown. Maybe there was an issue';
  }
};
