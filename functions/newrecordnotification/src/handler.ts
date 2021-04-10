import type { DynamoDBStreamEvent } from 'aws-lambda';

// Import required AWS SDK clients and commands for Node.js
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new SESClient({});

export default async (event: DynamoDBStreamEvent): Promise<string> => {
  try {
    const destinationAddress = process.env['DESTINATION_EMAIL'];
    if (destinationAddress == null) throw new Error('Destination email needs to be not null');

    const verifiedSenderAddress = process.env['SENDER_EMAIL_VERIFIED'];
    if (verifiedSenderAddress == null) throw new Error('Sender email needs to be not null');

    // Only send emails for insertions
    const insertions = event.Records.filter((record) => record.eventName === 'INSERT');
    console.log("New records are", insertions);
    if (insertions.length === 0) {
      throw new Error('No new items added');
    }

    const newUserEmails = insertions
      .map(({ dynamodb }) => dynamodb?.Keys?.['email']?.S)
      .filter((email) => typeof email !== 'undefined')
      .map((email) => String(email));

    console.log('New users are ', newUserEmails);
    if (newUserEmails.length === 0) {
      throw new Error('No new users added');
    }

    await client.send(
      new SendEmailCommand({
        Destination: {
          ToAddresses: [destinationAddress],
        },
        Message: {
          Subject: { Data: 'New users have joined' },
          Body: { Text: { Data: `The following users have joined ${newUserEmails.join(', ')}` } },
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
