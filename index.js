const amqp = require('amqplib')
const {mail,Base, getCategory} = require('./config/mail')

const contador = require('./mail/contador')
const marketing = require('./mail/marketing')

const MAIL_QUEUE = 'MAIL_QUEUE'

const QUEUES = [MAIL_QUEUE]

const MAIL_CATEGORY_CONTADOR = 'CONTADOR'
const MAIL_CATEGORY_MARKETING = 'MARKETING'


amqp.connect('amqp://localhost:5672').then( (conn) => {
    conn.createChannel().then(async (channel) => {

        await QUEUES.forEach(async v => await channel.assertQueue(v, {durable: true}))

        await channel.prefetch(1)

        channel.consume(MAIL_QUEUE, msg => {

            const value = JSON.parse(msg.content.toString())
            console.log(value)

            switch (getCategory(value.type)) {
                case MAIL_CATEGORY_CONTADOR:
                    mail.send(new Base(value.destinatary, contador(value.type, value.data)))
                    break
                case MAIL_CATEGORY_MARKETING:
                    mail.send(new Base(value.destinatary, marketing(value.type, value.data)))
            }

            channel.ack(msg)

        }, {noAck: false})
    })
}).catch(error => {
    throw error
})

