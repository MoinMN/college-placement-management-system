const Users = require('../../models/user.model');
const bcrypt = require('bcrypt');

const AddTPO = async (req, res) => {
  const email = req.body.email;
  
  try {
    if (await Users.findOne({ email }))
      return res.json({ msg: "User Already Exists!" });

    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new Users({ first_name: req.body.first_name, email: req.body.email, number: req.body.number, password: hashPassword, role: "tpo_admin" });
    await newUser.save();
    return res.json({ msg: "User Created!" });
  } catch (error) {
    console.log("management.add-tpo => ", error);
    return res.json({ msg: "Internal Server Error!" });
  }
}

module.exports = AddTPO;