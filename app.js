const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const token = 'YOUR TOKEN';
const bot = new TelegramBot(token, {polling: true});
module.exports = bot; //export on top to avoid circular dependency problems
const startCommand = require('./commands.js').startCommand;
const resultadosCommand = require('./commands.js').resultadosCommand;
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

//Models:
const User = require('./models.js').User;
const Tese = require('./models.js').Tese;


// set the view engine to ejs
app.set('view engine', 'ejs');

//Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DataBase Connection

mongoose.connect('mongodb://localhost/yourdb');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(`Mongoose connected!!`);


  //rotas web para escrever teses
  app.get('/', (req, res) =>{
    res.render('novatese.ejs');
  });

  app.post('/', (req, res) =>{
    let eixo = req.body.eixo;
    let texto = req.body.texto;
    let tese = new Tese({eixo:eixo, texto:texto, encaminhados: 0});
    tese.save((err, tese) =>{
      if(err){
        console.log(err);
      } else {
          res.render('novatese.ejs');
          let teseId = tese._id;
          let eixoDestaque = '';
          if(tese.eixo === 'eixo1'){
            eixoDestaque = 'eixo1';
          } else if(tese.eixo ==='eixo2'){
            eixoDestaque = 'eixo2';
          } else if(tese.eixo ==='eixo3'){
            eixoDestaque = 'eixo3';
          } else if(tese.eixo ==='eixo4'){
            eixoDestaque = 'eixo4';
          } else if(tese.eixo ==='eixo5'){
            eixoDestaque = 'eixo5';
          } else if(tese.eixo ==='eixo6'){
            eixoDestaque = 'eixo6';
          } else if(tese.eixo ==='eixo7'){
            eixoDestaque = 'eixo7';
          }
          let teseTexto = `*${eixoDestaque}*: ${tese.texto}`;
          let callBackQuerySIM = `VOTO${teseId}S`;
          let callBackQueryNAO = `VOTO${teseId}N`;
          let opts = {
            parse_mode: "Markdown",
            reply_markup: JSON.stringify(
            {
              inline_keyboard: [
              [{ text:'SIM', callback_data: callBackQuerySIM}],
              [{ text:'NÃO', callback_data: callBackQueryNAO}],
              ]
              })
            }
          User.find({}, function(err, users){
            users.forEach(user => {
              bot.sendMessage(user.telegramId, teseTexto, opts);
              tese.encaminhados ++;
              tese.save();
            });
          });

        }
      })
    });


//Inscrição no Bot
bot.on('message', function (msg) {
  var telegramId = msg.from.id;
  var firstName = msg.chat.first_name;
  var lastName = msg.chat.last_name;
  if(msg.text === '/start'){
    startCommand(telegramId, firstName, lastName);
  } else if(msg.text === '/resultados'){
      bot.sendMessage(telegramId, `Insira a senha:`);
  } else if (msg.text === `givenPassword`){
    resultadosCommand(telegramId);
  } else {
    let response = `Inserção inválida`;
    bot.sendMessage(telegramId, response);
    }
});


//Voto
bot.on('callback_query', function (callbackQuery) {
  let fromId = callbackQuery.from.id;
  let cbqId = callbackQuery.id;
  if (callbackQuery.data.substring(0,4) === 'VOTO'){
    var voto = '';
    let callbackQuerySemVoto = callbackQuery.data.substring(4);
    let teseId = callbackQuerySemVoto.slice(0, -1);
    Tese.findOne({_id : teseId}, (err, tese) =>{
      if (tese.sim.includes(`${fromId}`) || tese.nao.includes(`${fromId}`)) {
        bot.answerCallbackQuery(cbqId, `Solicitação Inválida`);
        bot.sendMessage(fromId,`Você já votou.`);
      } else {
          if(callbackQuery.data.endsWith('S')){
            voto = 'SIM';
            tese.sim.push(fromId);
          } else {
            voto = 'NÃO';
            tese.nao.push(fromId);
          }
        }
        tese.save(function(err, tese, numAffected){
          if(err){
            console.log(err);
            bot.sendMessage(fromId, `Houve um problema com seu voto. Pressione novamente.`);
          } else if (numAffected === 1){
            let response = `Você votou ${voto}.`;
            bot.answerCallbackQuery(cbqId, `Voto computado com sucesso`);
            bot.sendMessage(fromId, response);
          }
        }); //tese save
      }); //tese findOne
  } else {
      let eixo = callbackQuery.data;
      let response = ``;
      let opts = {
        parse_mode: "Markdown"
      };
      Tese.find({eixo: eixo}, function (err, teses){
        teses.forEach(tese => {
          let body = `*${tese.texto}*
MENSAGENS ENVIADAS: ${tese.encaminhados}
VOTOS RECEBIDOS ${tese.sim.length + tese.nao.length}
SIM: ${tese.sim.length}
NÃO: ${tese.nao.length}

`
          response += body;
        });
        bot.sendMessage(fromId, response, opts);
        bot.answerCallbackQuery(cbqId, `Solicitação realizada com sucesso`);
      });
    }
});


}); //<-- end of database connection
app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening!')
});
