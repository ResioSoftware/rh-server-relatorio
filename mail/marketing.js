
const MAIL_MARKETING_BOAS_VINDAS = 'MAIL_MARKETING_BOAS_VINDAS'

function EmailBoasVindas({nome}) {
    this.subject = `${nome}, vamos modernizar o seu RH!`
    this.html = `
Oi Davi, <br />
<br />
<br />
Que legal que você se interessou em experimentar o RH Inteligente por 7 dias gratuitamente. \\o/ <br />
<br />
Para começar, quero que você saiba que o link direto de acesso a plataforma é: https://www.convenia.com.br/login. <br />
<br />
Temos também conteúdos em nosso canal do youtube. Lá você poderá assistir tutoriais do nosso sistema e webinars variados.<br />
<br />
A partir de agora, trabalharemos juntos para "turbinar" o seu RH. Tornar ele mais moderno, integrado e acabar com a burocracia. <br />
<br />
Estamos aqui para ajudar !<br />
Nossa equipe está aqui para te ajudar ao longo de todo o processo, desde a configuração até a gestão em si. Nesses 7 dias de teste gratuito, enviarei conteúdos que façam sentido para você extrair ao máximo o produto. <br />
<br />
Nossa biblioteca de documentos, está sempre a sua disposição.<br />
<br />
E se você quiser falar com a gente, dentro da plataforma você possui um chat e no horário comercial (e ás vezes fora dele) estamos a disposição! <br />
<br />
Um abraço! <br />
<br />
Davi Resio <br />
    `
}

module.exports = function (type, data) {
    switch (type) {
        case MAIL_MARKETING_BOAS_VINDAS:
            return new EmailBoasVindas(data)
    }
}
