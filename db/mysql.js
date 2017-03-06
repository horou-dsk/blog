const Sequelize=require("sequelize");
global.sequelizeMySql=new Sequelize("xlyblog","root","root",{
    host:"localhost",
    dialect:"mysql",
    pool:{
        max:5,
        min:0,
        idle:30000
    }
});
