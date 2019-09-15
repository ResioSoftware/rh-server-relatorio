const mail = require('@sendgrid/mail');

const MAIL_DEFAULT_SENDER = 'sistema@rh-pro.xyz'

mail.setApiKey('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');

function Base(to, {subject, html}) {
    this.to = to
    this.from = MAIL_DEFAULT_SENDER
    this.subject = subject
    this.html = html
}

function getCategory(category) {
    return  category.match(/^MAIL_\w+_/)[0].substring(5).split('_')[0]
}

module.exports = {mail, Base, getCategory}
