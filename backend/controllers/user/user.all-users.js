const User = require("../../models/user.model");


const AllUsers = async (req, res) => {
  try {
    const studentUsers = (await User.find({ role: "student" })).length;
    const studentApprovalPendingUsers = (await User.find({ role: "student" })).filter(ele => !ele.studentProfile.isApproved).length;
    const tpoUsers = (await User.find({ role: "tpo_admin" })).length;
    const managementUsers = (await User.find({ role: "management_admin" })).length;
    const superUsers = (await User.find({ role: "superuser" })).length;

    // console.log(studentUsers.length)
    res.json({ studentUsers, studentApprovalPendingUsers, tpoUsers, managementUsers, superUsers });
  } catch (error) {
    console.log("user.route.js => ", error);
  }
}


module.exports = AllUsers;