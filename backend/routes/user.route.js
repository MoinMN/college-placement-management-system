const express = require('express');
const User = require('../models/user.model');

// router after /user/
const router = express.Router();

const authenticateToken = require('../middleware/auth.middleware');

// details of users student
router.get('/detail', authenticateToken, (req, res) => {
  res.json({
    id: `${req.user.id}`,

    // common data
    first_name: `${req.user.first_name}`,
    middle_name: `${req.user.middle_name}`,
    last_name: `${req.user.last_name}`,
    email: `${req.user.email}`,
    number: `${req.user.number}`,
    password: `${req.user.password}`,
    profile: `${req.user.profile}`,
    gender: `${req.user.gender}`,
    dataOfBirth: `${req.user.dataOfBirth}`,
    createdAt: `${req.user.createdAt}`,

    address: `${req.user.fullAddress.address}`,
    pincode: `${req.user.fullAddress.pincode}`,

    role: `${req.user.role}`,
    isProfileCompleted: `${req.user.isProfileCompleted}`,

    // student data
    rollNumber: `${req.user.studentProfile.rollNumber}`,
    uin: `${req.user.studentProfile.UIN}`,
    department: `${req.user.studentProfile.department}`,
    year: `${req.user.studentProfile.year}`,
    addmissionYear: `${req.user.studentProfile.addmissionYear}`,
    sem1: `${req.user.studentProfile.SGPA.sem1}`,
    sem2: `${req.user.studentProfile.SGPA.sem2}`,
    sem3: `${req.user.studentProfile.SGPA.sem3}`,
    sem4: `${req.user.studentProfile.SGPA.sem4}`,
    sem5: `${req.user.studentProfile.SGPA.sem5}`,
    sem6: `${req.user.studentProfile.SGPA.sem6}`,
    sem7: `${req.user.studentProfile.SGPA.sem7}`,
    sem8: `${req.user.studentProfile.SGPA.sem8}`,
    sscBoard: `${req.user.studentProfile.pastQualification.ssc.board}`,
    sscPercentage: `${req.user.studentProfile.pastQualification.ssc.percentage}`,
    sscPassingYear: `${req.user.studentProfile.pastQualification.ssc.year}`,
    hscBoard: `${req.user.studentProfile.pastQualification.hsc.board}`,
    hscPercentage: `${req.user.studentProfile.pastQualification.hsc.percentage}`,
    hscPassingYear: `${req.user.studentProfile.pastQualification.hsc.year}`,
    diplomaBoard: `${req.user.studentProfile.pastQualification.diploma.department}`,
    diplomaPercentage: `${req.user.studentProfile.pastQualification.diploma.percentage}`,
    diplomaPassingYear: `${req.user.studentProfile.pastQualification.diploma.year}`,
  });
});

router.get('/all-users', async (req, res) => {
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
});


module.exports = router;