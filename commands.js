const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const token = 'YOUR TOKEN';
const User = require('./models.js').User;
const Tese = require('./models.js').Tese;
const bot = require('./app.js');



var telegramId;
var firstName;
var lastName;

exports.startCommand = function(telegramId, firstName, lastName){
  User.findOne({telegramId: telegramId}, function (err, user) {
    if(user){
      let response = `Bem vindo de volta, ${firstName}.`;
      bot.sendMessage(telegramId,response);
    } else {
      let user = new User({telegramId: telegramId, firstName: firstName, lastName: lastName});
      user.save(function(err, user){
        if(err){
          console.log(err);
        } else {
          let response = `${user.firstName}, bem vindo ao Congresso`;
          bot.sendMessage(user.telegramId, response);
          console.log(`${user.firstName} acaba de se cadastrar`);
        }
      });
    }
  });
}

exports.resultadosCommand = function(telegramId){
  let response = `Escolha um Eixo:`;
  let opts = {
    parse_mode: "Markdown",
    reply_markup: JSON.stringify(
    {
      inline_keyboard: [
      [{ text:'EIXO 1', callback_data: `eixo1`}],
      [{ text:'EIXO 2', callback_data: `eixo2`}],
      [{ text:'EIXO 3', callback_data: `eixo3`}],
      [{ text:'EIXO 4', callback_data: `eixo4`}],
      [{ text:'EIXO 5', callback_data: `eixo5`}],
      [{ text:'EIXO 6', callback_data: `eixo6`}],
      [{ text:'EIXO 7', callback_data: `eixo7`}]
      ]
      })
    }
  bot.sendMessage(telegramId, response, opts);
};
