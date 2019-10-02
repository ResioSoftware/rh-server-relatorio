const db = require('../config/db');
const Sequelize = require('sequelize');
const xlxs = require('xlsx');

const extensaoExcel = 'xlsx';

const params = {raw: true, type: Sequelize.QueryTypes.SELECT};


async function birthdayRelatory({idEmpresa}) {

    const colaborador = await db.query('SELECT matricula, nome, dataNascimento FROM Colaborador WHERE idEmpresa = ?', {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa);

    return writeFile(['Empresa', 'Matricula', 'Nome', 'Data de Nascimento'], colaborador.map(v => [empresa, v.matricula, v.nome, v.dataNascimento])[0], 'Aniversarios')
}


async function bankDataRelatory({idEmpresa}) {
    const colaborador = await db.query('SELECT matricula, nome, banco, agencia, conta, digito FROM Colaborador C LEFT JOIN Banco B ON C.BancoId = B.id WHERE C.idEmpresa = ?', {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa);

    return writeFile(['Empresa', 'Matricula', 'Nome', 'Banco', 'Agencia', 'Conta', 'Digito'], colaborador.map(v => [empresa, v.matricula, v.nome, v.banco, v.agencia, v.conta, v.digito])[0], 'Dados Bancarios')
}

async function contactData({idEmpresa}) {
    const colaborador = await db.query(`SELECT matricula, Colaborador.nome as nome, Contato.nome as contato_nome, Contato.email, 
    Contato.telefone, Contato.telefoneTrabalho, Contato.celular, relacao FROM Colaborador RIGHT JOIN Contato on Colaborador.id = Contato.ContatoId 
    WHERE Colaborador.idEmpresa = ?`, {...params, replacements: [idEmpresa]});

    const empresa = await getNomeEmpresa(idEmpresa);

    return writeFile(['Empresa', 'Matricula', 'Colaborador', 'Nome do contato', 'E-mail', 'Telefone', 'Telefone do trabalho', 'Celular', 'Relacao'],
        colaborador.map(v => [empresa, v.matricula, v.nome, v.contato_nome, v.email, v.telefone, v.telefoneTrabalho, v.celular, v.relacao], 'Contatos')[0], 'Contatos')
}

async function dependentData({idEmpresa}) {
    const colaborador = await db.query(`SELECT matricula, C.nome as nome, D.nome as dependente_nome, D.cpf,
     D.dataNascimento, D.nomeMae, D.relacao, D.incluirParaFinsDeImpostoRenda FROM Colaborador C RIGHT JOIN Dependente D
      on C.id = D.DependenteId WHERE C.idEmpresa = ?`, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa);

    return writeFile(['Empresa', 'Matricula', 'Colaborador', 'Dependente', 'CPF', 'Data de Nascimento', 'Nome da mae', 'Relacao', 'Usa para Imposto de Renda?'],
        colaborador.map(v => [empresa, v.matricula, v.nome, v.dependente_nome, v.cpf, v.dataNascimento, v.nomeMae, v.relacao, v.incluirParaFinsDeImpostoRenda ? 'Sim' : 'Nao'], 'Contatos')[0], 'Dependentes')
}



async function colaboradorPorVinculo({idEmpresa}) {
    const colaborador = await db.query(`SELECT matricula, C.nome, V.nome as vinculo_nome FROM Colaborador C LEFT JOIN Vinculo V on C.VinculoId = V.id WHERE C.idEmpresa = ?`, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa);

    return writeFile(['Empresa', 'Matricula', 'Nome', 'Vinculo'], colaborador.map(v => [empresa, v.matricula, v.nome, v.vinculo_nome])[0], 'Colaboradores por Vinculo')
}


async function gestores({idEmpresa}) {
    const colaborador = await db.query(`SELECT matricula, nome, email FROM Colaborador WHERE idEmpresa = ?`, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa);

    return writeFile(['Empresa', 'Matricula', 'Nome do colaborador', 'E-mail do colaborador', 'Supervisor', 'E-mail do supervisor'], colaborador.map(v => [empresa, v.matricula, v.nome, v.email, 'Nao informado', 'Nao informado'])[0], 'Gestores')
}


async function tempoDeCasaColaborador({idEmpresa}) {

    const getTempo = d => {
        const currentDate = new Date();
        const dataAdmissao = new Date(Date.parse(d));
        const years = currentDate.getFullYear() - dataAdmissao.getFullYear();
        const month = currentDate.getMonth() - dataAdmissao.getMonth();
        const day = currentDate.getDate() - dataAdmissao.getDate();
        return '0' + years + ' anos, ' + '0' + month + ' meses e ' + '0' + day + ' dias'
    };

    const colaborador = await db.query(`SELECT matricula, nome, dataAdmissao FROM Colaborador WHERE idEmpresa = ?`, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa);
    return writeFile(['Empresa', 'Matricula', 'Nome', 'Data de admissao', 'Tempo de casa'], colaborador.map(v => [empresa, v.matricula, v.nome, v.dataAdmissao, getTempo(v.dataAdmissao)])[0], 'Tempo de casa')
}


async function anotacoesColaborador({idEmpresa}) {
    const colaborador = await db.query(`SELECT matricula, nome, titulo, anotacao, categoria, A.createdAt FROM Colaborador RIGHT JOIN Anotacao A ON Colaborador.id = A.AnotacaoId WHERE idEmpresa = ?`, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa);

    return writeFile(['Empresa', 'Matricula', 'Nome', 'Titulo', 'Categoria', 'Anotacao', 'Data cadastro'], colaborador.map(v => [empresa, v.matricula, v.nome, v.titulo, v.categoria, v.anotacao, v.createdAt])[0], 'Anotacao colaborador')
}



async function atualizacoesCargoESalario({idEmpresa}) {
    const colaborador = await db.query(`SELECT matricula, Colaborador.nome, salario, C.nome as cargo, cbo, dataAdmissao, 
                                               D.nome as departamento, V.nome as vinculo FROM Colaborador LEFT JOIN Cargo C on Colaborador.CargoId = C.id LEFT JOIN 
                                               Departamento D on Colaborador.DepartamentoId = D.id LEFT JOIN Vinculo V on Colaborador.VinculoId = V.id WHERE Colaborador.idEmpresa = ?`, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa);

    return writeFile(['Empresa', 'Matricula', 'Nome', 'Salario', 'Cargo', 'CBO', 'Departamento', 'Motivo', 'Vinculo', 'Descricao', 'Data de', 'Data ate'],
        colaborador.map(v => [empresa, v.matricula, v.nome, v.salario, v.cargo, v.cbo, v.departamento, '', v.vinculo, '', v.dataAdmissao, ''])[0], 'Atualizacao cargo e salario')
}



async function admissoes({idEmpresa}) {
    const colaborador = await db.query(`SELECT matricula, Colaborador.nome, C.nome as cargo, salario, dataNascimento,
       dataAdmissao, status, preenchimentoPeloColaborador FROM Colaborador LEFT JOIN Cargo C ON Colaborador.CargoId = C.id
       WHERE Colaborador.idEmpresa = ?`, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa);

    return writeFile(['Empresa', 'Matricula', 'Nome', 'Cargo', 'Salario', 'Data de nascimento', 'Data de admissao', 'Status da admissao', 'Preenchido pelo colaborador'],
        colaborador.map(v => [empresa, v.matricula, v.nome, v.cargo, v.salario, v.dataNascimento, v.dataAdmissao, v.status, v.preenchimentoPeloColaborador ? 'Sim' : 'Nao'])[0], '')
}


async function desligamentos({idEmpresa}) {
    const colaborador = await db.query(`SELECT matricula, Colaborador.nome, email, rg, cpf, pis, nSerieCtps, sexo, dataNascimento, salario, celular, C.nome AS cargo,
       cbo, D.nome AS departamento, CDC.nome AS centroCusto, DES.aviso, DES.tipo, DES.dataDesligamento, DES.dataAviso, dataAdmissao,
       DES.observacoes, E.cep, E.endereco, E.numero, E.complemento, E.estado, E.cidade
       FROM Colaborador LEFT JOIN Cargo C ON Colaborador.CargoId = C.id LEFT JOIN Departamento D ON Colaborador.DepartamentoId = D.id
       LEFT JOIN CentroDeCusto CDC ON Colaborador.CentroDeCustoId = CDC.id LEFT JOIN Endereco E ON Colaborador.EnderecoId = E.id
           RIGHT JOIN Desligamento DES ON Colaborador.id = DES.DesligamentoId WHERE Colaborador.idEmpresa = ?`, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa);

    return writeFile(['Empresa', 'Matricula', 'Nome completo', 'E-mail', 'RG', 'CPF', 'PIS', 'CTPS', 'Sexo', 'Data de nascimento', 'Salario'
            , 'Celular', 'Cargo', 'CBO', 'Departamento', 'Centro de Custo', 'Aviso', 'Tipo', 'Data de desligamento', 'Data de aviso previo', 'Data de admissao',
            'Status do desligamento', 'Observacoes', 'CEP', 'Endereco', 'Numero', 'Complemento', 'Estado', 'Cidade'],
        colaborador.map(v => [empresa, v.matricula, v.nome, v.email, v.rg, v.cpf, v.pis, v.nSerieCtps, v.sexo, v.dataNascimento, v.salario
            , v.celular, v.cargo, v.cbo, v.departamento, v.centroCusto, v.aviso, v.tipo, v.dataDesligamento, v.dataAviso, v.dataAdmissao, '', v.observacoes,
            v.cep, v.endereco, v.numero, v.complemento, v.estado, v.cidade])[0], '')
}


async function faltas({idEmpresa}) {
    const colaborador = await db.query(``, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa)

   // return writeFile(['Empresa', 'Matricula', 'Nome', 'De', 'Ate', 'Tipo', 'Motivo', 'CID', 'Cargo', 'Departamento', 'Centro de custo', 'Vinculo'],
   //     colaborador.map(v => [empresa, v.matricula, v.nome, v., v., v., v., v., v., v., v.])[0], '')
}


async function colaboradoresEmPeriodoExperiencia({idEmpresa}) {
    const colaborador = await db.query(``, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa)

   // return writeFile(['Empresa', 'Matricula', 'Nome', '', '', '', '', '', '', '', '', ''],
  //      colaborador.map(v => [empresa, v.matricula, v.nome, v., v., v., v., v., v., v., v.])[0], '')
}


async function idadePorCargo({idEmpresa}) {
    const colaborador = await db.query(``, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa)

  //  return writeFile(['Empresa', 'Matricula', 'Nome', '', '', '', '', '', '', '', '', ''],
 //       colaborador.map(v => [empresa, v.matricula, v.nome, v., v., v., v., v., v., v., v.])[0], '')
}


async function idadePorDepartamento({idEmpresa}) {
    const colaborador = await db.query(``, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa)

   // return writeFile(['Empresa', 'Matricula', 'Nome', '', '', '', '', '', '', '', '', ''],
   //     colaborador.map(v => [empresa, v.matricula, v.nome, v., v., v., v., v., v., v., v.])[0], '')
}


async function jornadasDeTrabalho({idEmpresa}) {
    const colaborador = await db.query(``, {...params, replacements: [idEmpresa]});
    const empresa = await getNomeEmpresa(idEmpresa)

   // return writeFile(['Empresa', 'Matricula', 'Nome', '', '', '', '', '', '', '', '', ''],
   //     colaborador.map(v => [empresa, v.matricula, v.nome, v., v., v., v., v., v., v., v.])[0], '')
}








module.exports = {birthdayRelatory, bankDataRelatory, contactData, dependentData, colaboradorPorVinculo, gestores,
    tempoDeCasaColaborador, anotacoesColaborador, atualizacoesCargoESalario, admissoes, desligamentos};


const getNomeEmpresa = async id => {
    const empresa = await db.query('SELECT nome FROM Empresa where id = ?', {...params, replacements: [id], plain: true});
    return empresa.nome
};

const getColunsSize = value => Object.keys(value[0]).map(() =>({wch: 20}));

const writeFile = (header, values, filename) => {

    const data = [];
    data.push(header);
    if(values) data.push(values);
    const wb = xlxs.utils.book_new();
    const ws = xlxs.utils.aoa_to_sheet(data);
    ws['!cols'] = getColunsSize(data);
    xlxs.utils.book_append_sheet(wb, ws, filename);
    return xlxs.write(wb, {type: 'buffer', bookType: extensaoExcel, bookSST: false})
};










/*   ws['A1'] = {
       w: 'Empresa',
       s: {
           font: {bold: true, size: 20, color: '#FF00FF'}
       }
   }*/