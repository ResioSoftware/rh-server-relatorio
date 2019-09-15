const util = require('../config/util')


const MAIL_CONTADOR_SOLICITAR_FERIAS = 'MAIL_CONTADOR_SOLICITAR_FERIAS'
const MAIL_CONTADOR_DESLIGAR_FUNCIONARIO = 'MAIL_CONTADOR_DESLIGAR_FUNCIONARIO'

function SolicitacaoFerias(data) {

    const {empresa, colaborador, contador, ferias} = data

    this.subject = `[${empresa.nome}] - Solicitação de férias - ${colaborador.nome}`
    this.html = `
    Olá ${contador.nome} <br/>
    <br/>
    A empresa ${empresa.nome} está enviando as informações do colaborador(a) ${colaborador.nome} para dar continuidade no processo de solicitação de férias dele(a). <br/>
    <br/>
    Nome: ${colaborador.nome} <br/>
    <br/>
    CPF: ${util.getValue(colaborador.cpf)} <br/>
    <br/>
    Periodo de: ${util.parseDate(ferias.inicioPeriodoAquisitivo)} até ${util.parseDate(ferias.finalPeriodoAquisitivo)} <br/>
    <br/>
    Total de dias: ${util.getValue(ferias.totalDias)} dia(s) <br/>
    <br/>
    Abono pecuniário (dias): ${util.getValue(ferias.diasDeAbono)} <br/>
    <br/>
    Antecipar 13°? ${ferias.anteciparParcelaDecimoTerceiro ? 'Sim' : 'Nao'} <br/>
    <br/>
    Justificativa: ${util.getValue(ferias.justificativa)} <br/>
    <br/>
    Comentário: ${util.getValue(ferias.comentarioParaContador)} <br/>
    <br/>
    Se houver dúvidas, fale diretamente com o RH da ${empresa.nome}. <br/>
    <br/>
    Obrigado, <br/>
    <br/>
    Equipe RH Inteligente
    `
}

function DesligamentoFuncionario({empresa, colaborador, contador}) {

    function mapBeneficios() {
        if (!colaborador.beneficios || !colaborador.beneficios.length) return ''
        let data = ''
        colaborador.beneficios.forEach(v => {
               data = data + `
Nome: ${v.nome} <br/>
<br/>
Categoria: ${v.categoria} <br/>
<br/>
<hr />
<br/>
<br/>
        `
            })

        return data
    }

    this.subject = `[${empresa.nome}] - Desligamento de funcionário - ${colaborador.nome}`
    this.html = `
Olá ${contador.nome}, <br/>
<br/>
Seguem informações necessárias para o desligamento do(a) colaborador(a) abaixo: <br/>
<br/>
Nome: ${colaborador.nome} <br/>
<br/>
Departamento: ${util.extractValue('nome', colaborador.departamento, '-')} <br/>
<br/>
Cargo: ${util.extractValue('nome', colaborador.cargo, '-')} <br/>
<br/>
Salário atual: ${util.getValue(colaborador.salario)} <br/>
<br/>
Funcionário desde: ${util.parseDate(colaborador.dataAdmissao)} <br/>
<br/>
Saldo de férias em aberto: ${''} <br/>
<br/>
Saldo de férias proporcionais: ${''} <br/>
<br/>
Aviso prévio: ${util.extractValue('aviso', colaborador.desligamento, '-')} <br/>
<br/>
Tipo de desligamento: ${util.extractValue('tipo', colaborador.desligamento, '-')} <br/>
<br/>
Data do desligamento: ${util.parseDate(util.extractValue('dataDesligamento', colaborador.desligamento))} <br/>
<br/>
Data do aviso prévio: ${util.extractValue('dataAviso', colaborador.desligamento)} <br/>
<br/>
Exame demissional realizado?: ${util.extractValue('exameDemissional', colaborador.desligamento) ? 'Sim' : 'Nao'} <br/>
<br/>
Data do exame demissional: ${util.parseDate(util.extractValue('dataExameDemissional', colaborador.desligamento))} <br/>
<br/>
Observações: ${util.extractValue('observacoes', colaborador.desligamento, '-')} <br/>
<br/>
<br/>
<strong>Benefícios</strong> <br/>
<br/>
<br/>
    `.concat(mapBeneficios())
}

module.exports = function (type, data) {
    switch (type) {
        case MAIL_CONTADOR_SOLICITAR_FERIAS:
            return new SolicitacaoFerias(data)
        case MAIL_CONTADOR_DESLIGAR_FUNCIONARIO:
            return new DesligamentoFuncionario(data)
    }
}
