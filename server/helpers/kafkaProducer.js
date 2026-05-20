const { Kafka , Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'pet-adoption-app',
  brokers: ['127.0.0.1:9092'],
});

// const producer = kafka.producer();

const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner, 
  });

const sendAdoptionApplication = async (application) => {
  try {
    await producer.connect();
    await producer.send({
      topic: 'adoption-applications',
      messages: [
        {
          value: JSON.stringify(application), // Convert application to string
        },
      ],
    });
    console.log('Adoption application sent successfully');
  } catch (error) {
    console.error('Error sending adoption application:', error);
  } finally {
    await producer.disconnect();
  }
};

module.exports = sendAdoptionApplication;
