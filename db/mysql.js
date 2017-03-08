const Sequelize=require("sequelize");
const mysql=require("mysql");
global.mysqldb=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"root",
    port:"3306",
    database:"xlyblog"
});
global.sequelizeMySql=new Sequelize("xlyblog","root","root",{
    host:"localhost",
    dialect:"mysql",
    pool:{
        max:5,
        min:0,
        idle:30000
    }
});
