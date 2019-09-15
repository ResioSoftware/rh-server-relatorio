

function parseDate(v) {

    const adicionaZero = value => value.toString().length > 1 ? value : '0' + value

    const date = new Date(Date.parse(v));
    return `${adicionaZero(date.getDate())}/${adicionaZero(date.getMonth() + 1)}/${date.getFullYear()}`
}


function getValue(v) {
    return v ? v : '-'
}

function extractValue(path, obj, defaul) {
    try {
        return path.split('.').reduce((value, el) => value[el], obj)
    } catch (e) {
        return defaul !== undefined ? defaul : null
    }
}


module.exports = {parseDate, getValue, extractValue}
