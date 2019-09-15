const path = require('path')
require('dotenv').config({path: path.resolve(process.cwd(), '../.env')})
const express = require('express')
const app = express()
const http = require('http')
const bodyParser = require('body-parser')
const amqp = require('amqplib')

app.use(bodyParser.json())

let lastRequestId = 1

const messageQueueConnectionString = 'amqp://localhost:5672'

app.post('/api/v1/processData', async (req, res) => {

    let requestId = lastRequestId

    let connection = await amqp.connect(messageQueueConnectionString)
    let channel = await connection.createConfirmChannel()

    let requestData = req.body.data
    console.log("Published a request message, requestId:", requestId);

  await channel.assertQueue('processing')

    await publishToChannel(channel, {routingKey: 'request', exchangeName: 'processing', data: {requestId, requestData}})

    res.send({requestId})

})


const publishToChannel = (channel, {routingKey, exchangeName, data}) => new Promise((resolve, reject) => {


    channel.sendToQueue(exchangeName, Buffer.from(JSON.stringify(data)), {persistent: true}, (err, ok) => {

        if(err) return reject(err)

        resolve()

    })
})


const listenForResults = async () => {
    let connection = await amqp.connect(messageQueueConnectionString)

    let channel = await connection.createChannel()
    await channel.prefetch(1)

    await consume({connection, channel})

}


const consume = ({connection, channel, resultChannel}) => new Promise((resolve, reject) => {

    /*channel.consume('processing', async msg => {

        let msgBody = msg.content.toString()
        let data = JSON.parse(msgBody)
        let requestId = data.requestId
        let processingResults = data.processingResults

        console.log("Received a result message, requestId:", requestId, "processingResults:", processingResults);

        await channel.ack(msg)

    })
*/
    connection.on('close', err => reject(err))

    connection.on('error', err => reject(err))

})



const PORT = 3000
server = http.createServer(app)

server.listen(PORT, ()=> console.log('server ON'))

listenForResults()
