const Users = require('../Models/UserModel')

const Test = async (req,res) => {

    try{    

        const {email, NewPass} = req.body;
        const user = await Users.findOne({email});
        user.password = NewPass;
       await user.save();
        res.status(200).json({message: "test connectopn successful"});
    } catch(error) {
        res.json({errormsg : error});
    }

}


// Simple response messages so you can quickly test connections
const getAllUsers = async (req, res) => {
    const Allusers = await Users.find();
    console.log(req.user);
	res.status(200).json({ message: 'getAllUsers: connection OK', users: Allusers});
};

const getUserById = (req, res) => {
	const { id } = req.params;
	res.status(200).json({ message: `getUserById: connection OK`, id });
};

const createUser = async (req, res) => {

    const {uname: name,email,password} = req.body;
    const newUser = new Users({name,email,password});
   try{
    await newUser.save();
    
	res.status(201).json({ message: 'createUser: connection OK', received: req.body });
   }
   catch(error){
    res.json({message: error})
   }
};

const updateUser = (req, res) => {
	const { id } = req.params;
	res.status(200).json({ message: 'updateUser: connection OK', id, received: req.body });
};

const deleteUser = (req, res) => {
	const { id } = req.params;
	res.status(200).json({ message: 'deleteUser: connection OK', id });
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, Test };