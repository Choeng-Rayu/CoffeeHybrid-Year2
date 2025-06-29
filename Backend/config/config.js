const { sequelize} = require('sequelize'); 

const sequelize = new Sequelize('coffe_db','root','',{
    host : 'localhost',
    dialect : 'mysql',
});
module.exports = sequelize;