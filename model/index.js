const Sequelize=require("sequelize");
module.exports={
    users:sequelizeMySql.define("user",{
        id:{
            type:Sequelize.INTEGER(11),
            primaryKey:true
        },
        name:Sequelize.STRING(10),
        age:Sequelize.INTEGER(3)
    },{
        timestamps:false
    })
};
