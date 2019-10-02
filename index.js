const amqp = require('amqplib');
const {mail,Base, getCategory} = require('./config/mail');

const relatorios = require('./relatory/employee');

const contador = require('./mail/contador');
const marketing = require('./mail/marketing');

const MAIL_QUEUE = 'MAIL_QUEUE';
const RELATORY_QUEUE = 'RELATORY_QUEUE';


const MAIL_CATEGORY_CONTADOR = 'CONTADOR';
const MAIL_CATEGORY_MARKETING = 'MARKETING';

const RELATORIO_ANIVERSARIOS = 'RELATORIO_ANIVERSARIOS';
const RELATORIO_DADOS_BANCARIOS = 'RELATORIO_DADOS_BANCARIOS';
const RELATORIO_CONTATOS = 'RELATORIO_CONTATOS';
const RELATORIO_DEPENDENTES = 'RELATORIO_DEPENDENTES';
const RELATORIO_COLABORADORES_POR_VINCULO = 'RELATORIO_COLABORADORES_POR_VINCULO';
const RELATORIO_GESTORES = 'RELATORIO_GESTORES';
const RELATORIO_TEMPO_DE_CASA = 'RELATORIO_TEMPO_DE_CASA';
const RELATORIO_ANOTACOES = 'RELATORIO_ANOTACOES';
const RELATORIO_ATUALIZACOES_CARGOS_E_SALARIOS = 'RELATORIO_ATUALIZACOES_CARGOS_E_SALARIOS';
const RELATORIO_ADMISSOES = 'RELATORIO_ADMISSOES';
const RELATORIO_DESLIGAMENTOS = 'RELATORIO_DESLIGAMENTOS';



amqp.connect('amqp://localhost:5672').then( (conn) => {
    conn.createChannel().then(async (channel) => {

       await channel.assertQueue(MAIL_QUEUE, {durable: true});

        await channel.assertQueue(RELATORY_QUEUE, {durable: false});

        await channel.prefetch(1);


        await channel.consume(MAIL_QUEUE, msg => {

            const value = JSON.parse(msg.content.toString());
            console.log(value);

            switch (getCategory(value.type)) {
                case MAIL_CATEGORY_CONTADOR:
                    mail.send(new Base(value.destinatary, contador(value.type, value.data)));
                    break;
                case MAIL_CATEGORY_MARKETING:
                    mail.send(new Base(value.destinatary, marketing(value.type, value.data)));
                    break
            }
            channel.ack(msg)
        }, {noAck: false});


        await channel.consume(RELATORY_QUEUE, async msg => {

            const value = JSON.parse(msg.content.toString());
            console.log(value);

            let response;
            switch (value.relatorio) {
                case RELATORIO_ANIVERSARIOS:
                    response = await relatorios.birthdayRelatory(value.data);
                    break;
                case RELATORIO_DADOS_BANCARIOS:
                    response = await relatorios.bankDataRelatory(value.data);
                    break;
                case RELATORIO_CONTATOS:
                    response = await relatorios.contactData(value.data);
                    break;
                case RELATORIO_DEPENDENTES:
                    response = await relatorios.dependentData(value.data);
                    break;
                case RELATORIO_COLABORADORES_POR_VINCULO:
                    response = await relatorios.colaboradorPorVinculo(value.data);
                    break;
                case RELATORIO_GESTORES:
                    response = await relatorios.gestores(value.data);
                    break;
                case RELATORIO_TEMPO_DE_CASA:
                    response = await relatorios.tempoDeCasaColaborador(value.data);
                    break;
                case RELATORIO_ANOTACOES:
                    response = await relatorios.anotacoesColaborador(value.data);
                    break;
                case RELATORIO_ATUALIZACOES_CARGOS_E_SALARIOS:
                    response = await relatorios.atualizacoesCargoESalario(value.data);
                    break;
                case RELATORIO_ADMISSOES:
                    response = await relatorios.admissoes(value.data);
                    break;
                case RELATORIO_DESLIGAMENTOS:
                    response = await relatorios.desligamentos(value.data);
                    break;
            }

            channel.sendToQueue(msg.properties.replyTo, response, {correlationId: msg.properties.correlationId});
            channel.ack(msg)

        })

    })
}).catch(error => {
    throw error
});
