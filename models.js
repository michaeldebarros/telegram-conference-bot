const mongoose = require('mongoose');

//Schemas

  //user
const userSchema = mongoose.Schema({
telegramId: { type: String, required: true},
firstName: { type: String, required: true },
lastName: { type: String }
});

const teseSchema = mongoose.Schema({
	eixo: { type: String, required: true},
	texto: { type: String, required: true},
	encaminhados : Number,
	sim: [String],
	nao: [String]
});

//Models

const User = mongoose.model('users', userSchema);
const Tese = mongoose.model('teses', teseSchema);




module.exports = {
	User : User,
	Tese : Tese
}
