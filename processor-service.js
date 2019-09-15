const path = require('path')
require('dotenv').config({path: path.resolve(process.cwd(), '../.env')})
const amqp = require('amqplib')


const messageQueueConnectionString = process.env.CLOUDAMQP_URL


const listenForMessages = async () => {

    let connection = await amqp.connect(messageQueueConnectionString)

    let channel = await connection.createChannel()
    await channel.prefetch(1)

    let resultsChannel = await connection.createConfirmChannel()

    await consume({connection, channel, resultsChannel})

}

const publishToChannel = (channel, {routingKey, exchangeName, data}) => new Promise((resolve, reject) => {

    channel.sendToQueue(exchangeName, Buffer.from(JSON.stringify(data), 'utf-8'), {persistent: true}, (err, ok) => {

        if(err) return reject(err)

        resolve()

    })

})


const consume = ({connection, channel, resultChannel}) => new Promise((resolve, reject) => {

    channel.consume('processing', async msg => {


        let data = JSON.parse(msg.content.toString())
        let requestId = data.requestId
        let requestData = data.requestData
        console.log("Received a request message, requestId:", requestId);

        let processingResults = await processMessage(requestData)

        await publishToChannel(resultChannel, {exchangeName: 'processing', routingKey: 'result', data: {requestId, processingResults}})
        console.log("Published results for requestId:", requestId);

        await channel.ack(msg)
    })

    connection.on('close', err => reject(err))

    connection.on('error', err => reject(err))

})


const processMessage = requestData => new Promise((resolve, reject) => {
    setTimeout(()=> {
        resolve(requestData + '-processed')
    }, 5000)
})

listenForMessages()
