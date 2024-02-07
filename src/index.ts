import { connect } from 'amqplib';

const topic_exchange = 'tutorial.public.customers';

const initialize = async () => {
  const connection = await connect({
    username: 'guest',
    password: 'guest',
    hostname: 'localhost',
    vhost: 'vhost',
  });
  const channel = await connection.createChannel();
  await channel.assertExchange(topic_exchange, 'topic', { durable: true });

  const queue = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(queue.queue, topic_exchange, 'inventory_customers');
  console.log('RabbitMQ is initialized.....');
  return { channel, queue };
};

const main = async () => {
  const { channel, queue } = await initialize();
  await channel.consume(queue.queue, async (msg) => {
    if (msg) {
      const { routingKey } = msg.fields;
      const content = JSON.parse(msg.content.toString());
      console.log(`Received message from ${routingKey}`, content);
      await channel.ack(msg);
    }
  });
};

main();
