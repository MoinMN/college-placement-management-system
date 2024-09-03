import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Toast from '../components/Toast';

function UserDetails() {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:4518";

  const { studentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(`http://localhost:4518/admin/user/${studentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        setStudentData(response.data);
        // console.log(response.data)
      } catch (error) {
        if (error.response.data) {
          setToastMessage(error.response.data.msg);
          setShowToast(true);
          if (error.response.data.msg === "Student not found")
            navigate("../404")
        }
        console.error("Error fetching student data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [studentId]);


  const handleDataChange = (e) => setStudentData({ ...studentData, [e.target.name]: e.target.value })

  // console.log(studentData)

  const handleDataChangeForSGPA = (e) => {
    setStudentData({
      ...studentData,
      studentProfile: {
        ...studentData?.studentProfile,
        SGPA: {
          ...studentData?.studentProfile?.SGPA,
          [e.target.name]: e.target.value
        }
      }
    })
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:4518/admin/update-profile',
        studentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      // console.log(response.data);
      if (response.data) {
        if (response.data.msg) {
          setToastMessage(response.data.msg);
          setShowToast(true);
        }
        //   navigate("../student/dashboard");
      }
    } catch (error) {
      console.log("UserDetails => ", error);
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImgs', file);
      formData.append('userId', studentData._id);

      try {
        const response = await axios.post("http://localhost:4518/student/upload-photo", formData);
        setStudentData({ ...studentData, profile: response.data.file });
        if (response.data) {
          if (response.data.msg) {
            setToastMessage(response.data.msg);
            setShowToast(true);
          }
        }
      } catch (error) {
        setToastMessage(error.msg);
        setShowToast(true);
        console.error('Error uploading photo:', error);
      }
    }
  }

  // for formating date of birth
  const formatDate = (isoString) => {
    if (!isoString || isoString === "undefined") return "";
    const date = new Date(isoString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };
  // console.log(studentData)

  return (
    <>
      {
        loading ? (
          <div className="flex justify-center h-72 items-center">
            <i className="fa-solid fa-spinner fa-spin text-3xl" />
          </div>
        ) : (
          <>
            {/*  any message here  */}
            < Toast
              show={showToast}
              onClose={() => setShowToast(false)}
              message={toastMessage}
              delay={3000}
              position="bottom-end"
            />


            <div className="ml-60 px-4 py-10">
              <h1 className='text-4xl'>
                {studentData?.first_name + " "}
                {studentData?.middle_name === undefined ? "" : studentData?.middle_name + " "}
                {studentData?.last_name === undefined ? "" : studentData?.last_name}
              </h1>
              <form onSubmit={handleSubmit}>
                {/* personal info  */}
                <div className=" my-8 backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400 p-6">
                  <span className='text-2xl'>Personal Details</span>
                  <div className="grid grid-cols-3">
                    <div className="px-2 py-3 flex flex-col gap-3">
                      <FloatingLabel controlId="floatingFirstName" label="First Name">
                        <Form.Control type="text" placeholder="First Name" name='first_name' value={studentData?.first_name} onChange={handleDataChange} />
                      </FloatingLabel>
                      <FloatingLabel controlId="floatingMiddleName" label="Middle Name">
                        <Form.Control type="text" placeholder="Middle Name" name='middle_name' value={studentData?.middle_name} onChange={handleDataChange} />
                      </FloatingLabel>
                      <FloatingLabel controlId="floatingLastName" label="Last Name">
                        <Form.Control type="text" placeholder="Last Name" name='last_name' value={studentData?.last_name} onChange={handleDataChange} />
                      </FloatingLabel>
                      <FloatingLabel controlId="floatingEmail" label="Email address">
                        <Form.Control type="email" placeholder="Email address" name='email' value={studentData?.email} onChange={handleDataChange} disabled />
                      </FloatingLabel>
                      <FloatingLabel controlId="floatingNumber" label="Mobile Number" name='number' value={studentData?.number} onChange={handleDataChange} >
                        <Form.Control
                          type="number"
                          placeholder="Mobile Number"
                          name='number'
                          value={studentData?.number}
                          onChange={handleDataChange}
                          maxLength={10}
                          pattern="\d{10}"
                          onInput={(e) => {
                            if (e.target.value.length > 10) {
                              e.target.value = e.target.value.slice(0, 10);
                            }
                          }}
                        />
                      </FloatingLabel>
                    </div>
                    <div className="px-2 py-3 flex flex-col gap-3">
                      <FloatingLabel controlId="floatingSelectGender" label="Gender">
                        <Form.Select aria-label="Floating label select gender" className='cursor-pointer' name='gender' value={studentData?.gender === undefined ? "undefined" : studentData?.gender} onChange={handleDataChange} >
                          <option disabled value="undefined" className='text-gray-400'>Enter Your Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </FloatingLabel>
                      <FloatingLabel controlId="floatingBirthDate" label="Date of Birth">
                        <Form.Control
                          type="date"
                          placeholder="Date of Birth"
                          name='dateOfBirth'
                          value={formatDate(studentData?.dateOfBirth)}
                          onChange={handleDataChange}
                        />
                      </FloatingLabel>
                      <FloatingLabel className='w-full' controlId="floatingTextareaAddress" label="Address">
                        <Form.Control
                          as="textarea"
                          placeholder="Enter Full Address here..."
                          style={{ height: '150px', resize: "none" }}
                          name='address'
                          value={studentData?.fullAddress?.address}
                          onChange={(e) => {
                            setStudentData({
                              ...studentData,
                              fullAddress: {
                                ...studentData?.fullAddress,
                                address: e.target.value
                              }
                            });
                          }}
                        />
                      </FloatingLabel>
                      <Form.Control
                        type="number"
                        placeholder="Pincode"
                        maxLength={6}
                        name='pincode'
                        value={studentData?.fullAddress?.pincode}
                        onChange={(e) => {
                          setStudentData({
                            ...studentData,
                            fullAddress: {
                              ...studentData?.fullAddress,
                              pincode: e.target.value
                            }
                          });
                        }}
                        pattern="\d{6}"
                        onInput={(e) => {
                          if (e.target.value.length > 6) {
                            e.target.value = e.target.value.slice(0, 6);
                          }
                        }}
                      />
                    </div>

                    <div className="px-2 py-3 flex flex-col items-center gap-4 my-1">
                      <Col xs={8} md={4}>
                        <Image src={BASE_URL + studentData?.profile} roundedCircle />
                      </Col>
                      <span className='text-xl'>
                        {studentData?.first_name + " "}
                        {studentData?.middle_name === undefined ? "" : studentData?.middle_name + " "}
                        {studentData?.last_name === undefined ? "" : studentData?.last_name}
                      </span>
                      <FloatingLabel controlId="floatingFirstName" label="Change Profile Image">
                        <Form.Control type="file" accept='.jpg, .png, .jpeg' placeholder="Change Profile Image" name='profile' onChange={handlePhotoChange} />
                      </FloatingLabel>
                    </div>

                  </div>
                </div>

                {
                  studentData?.role === "student" &&
                  (
                    <>
                      {/* college info  */}
                      <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400 p-6 my-8">
                        <span className='text-2xl'>College Information</span>
                        <div className="grid grid-cols-3">
                          <div className="px-2 py-3 flex flex-col gap-3">
                            <FloatingLabel controlId="floatingUIN" label="UIN" >
                              <Form.Control
                                type="text"
                                placeholder="UIN"
                                name='uin'
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      UIN: e.target.value
                                    }
                                  });
                                }}
                                value={studentData?.studentProfile?.UIN} />
                            </FloatingLabel>
                            <FloatingLabel controlId="floatingRollNumber" label="Roll Number" >
                              <Form.Control
                                type="number"
                                placeholder="Roll Number"
                                name='rollNumber'
                                value={studentData?.studentProfile?.rollNumber}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      rollNumber: e.target.value
                                    }
                                  });
                                }}
                              />
                            </FloatingLabel>
                          </div>

                          <div className="px-2 py-3 flex flex-col gap-3">
                            <FloatingLabel controlId="floatingSelectDepartment" label="Department">
                              <Form.Select
                                aria-label="Floating label select department"
                                className='cursor-pointer'
                                name='department'
                                value={studentData?.studentProfile?.department || "undefined"}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      department: e.target.value
                                    }
                                  });
                                }}
                              >
                                <option disabled value="undefined" className='text-gray-400'>Enter Your Department</option>
                                <option value="Computer">Computer</option>
                                <option value="Civil">Civil</option>
                                <option value="ECS">ECS</option>
                                <option value="AIDS">AIDS</option>
                                <option value="Mechanical">Mechanical</option>
                              </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel controlId="floatingSelectYear" label="Year">
                              <Form.Select
                                aria-label="Floating label select year"
                                className='cursor-pointer'
                                name='year'
                                value={studentData?.studentProfile?.year || "undefined"}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      year: e.target.value
                                    }
                                  });
                                }} >
                                <option disabled value="undefined" className='text-gray-400'>Enter Your Year</option>
                                <option value="1">1st</option>
                                <option value="2">2nd</option>
                                <option value="3">3rd</option>
                                <option value="4">4th</option>
                              </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel controlId="floatingAdmissionYear" label="Admission Year">
                              <Form.Control
                                type="number"
                                placeholder="Addmission Year"
                                maxLength={4}
                                pattern="\d{4}"
                                name='addmissionYear'
                                value={studentData?.studentProfile?.addmissionYear}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      addmissionYear: e.target.value
                                    }
                                  });
                                }}
                                onInput={(e) => {
                                  if (e.target.value.length > 4) {
                                    e.target.value = e.target.value.slice(0, 4);
                                  }
                                }}
                              />
                            </FloatingLabel>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className=" py-3 flex flex-wrap gap-2">
                              <FloatingLabel controlId="floatingSem1" label="Sem 1">
                                <Form.Control type="number" placeholder="Sem 1" name='sem1' value={studentData?.studentProfile?.SGPA?.sem1} onChange={handleDataChangeForSGPA} />
                              </FloatingLabel>
                              <FloatingLabel controlId="floatingSem2" label="Sem 2">
                                <Form.Control type="number" placeholder="Sem 2" name='sem2' value={studentData?.studentProfile?.SGPA?.sem2} onChange={handleDataChangeForSGPA} />
                              </FloatingLabel>
                              <FloatingLabel controlId="floatingSem3" label="Sem 3">
                                <Form.Control type="number" placeholder="Sem 3" name='sem3' value={studentData?.studentProfile?.SGPA?.sem3} onChange={handleDataChangeForSGPA} />
                              </FloatingLabel>
                              <FloatingLabel controlId="floatingSem4" label="Sem 4">
                                <Form.Control type="number" placeholder="Sem 4" name='sem4' value={studentData?.studentProfile?.SGPA?.sem4} onChange={handleDataChangeForSGPA} />
                              </FloatingLabel>
                            </div>
                            <div className=" py-3 flex flex-wrap gap-2">
                              <FloatingLabel controlId="floatingSem5" label="Sem 5">
                                <Form.Control type="number" placeholder="Sem 5" name='sem5' value={studentData?.studentProfile?.SGPA?.sem5} onChange={handleDataChangeForSGPA} />
                              </FloatingLabel>
                              <FloatingLabel controlId="floatingSem6" label="Sem 6">
                                <Form.Control type="number" placeholder="Sem 6" name='sem6' value={studentData?.studentProfile?.SGPA?.sem6} onChange={handleDataChangeForSGPA} />
                              </FloatingLabel>
                              <FloatingLabel controlId="floatingSem7" label="Sem 7">
                                <Form.Control type="number" placeholder="Sem 7" name='sem7' value={studentData?.studentProfile?.SGPA?.sem7} onChange={handleDataChangeForSGPA} />
                              </FloatingLabel>
                              <FloatingLabel controlId="floatingSem8" label="Sem 8">
                                <Form.Control type="number" placeholder="Sem 8" name='sem8' value={studentData?.studentProfile?.SGPA?.sem8} onChange={handleDataChangeForSGPA} />
                              </FloatingLabel>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* past qualification  */}
                      <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400 p-6 my-8">
                        <span className='text-2xl'>Past Qualification</span>
                        <div className="grid grid-cols-3">
                          <div className="px-2 py-3 flex flex-col gap-2">
                            <FloatingLabel controlId="floatingSelectSSC" label="SSC Board Name">
                              <Form.Select
                                aria-label="Floating label select SSCBoard"
                                className='cursor-pointer'
                                name='sscBoard'
                                value={studentData?.studentProfile?.pastQualification?.ssc?.board || "undefined"}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      pastQualification: {
                                        ...studentData?.studentProfile?.pastQualification,
                                        ssc: {
                                          ...studentData?.studentProfile?.pastQualification?.ssc,
                                          board: e.target.value
                                        }
                                      }
                                    }
                                  });
                                }}
                              >
                                <option disabled value="undefined" className='text-gray-400'>Enter Your SSC Board Name</option>
                                <option value="Maharashtra State Board of Secondary and Higher Secondary Education (MSBSHSE)">Maharashtra State Board of Secondary and Higher Secondary Education (MSBSHSE)</option>
                                <option value="Central Board of Secondary Education (CBSE)">Central Board of Secondary Education (CBSE)</option>
                                <option value="Council for the Indian School Certificate Examinations (CISCE)">Council for the Indian School Certificate Examinations (CISCE)</option>
                                <option value="Other">Other</option>
                              </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel controlId="floatingSSCMarks" label="SSC Percentage">
                              <Form.Control
                                type="number"
                                placeholder="SSC Percentage"
                                name='sscPercentage'
                                value={studentData?.studentProfile?.pastQualification?.ssc?.percentage}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      pastQualification: {
                                        ...studentData?.studentProfile?.pastQualification,
                                        ssc: {
                                          ...studentData?.studentProfile?.pastQualification?.ssc,
                                          percentage: e.target.value
                                        }
                                      }
                                    }
                                  });
                                }}
                              />
                            </FloatingLabel>
                            <FloatingLabel controlId="floatingSelectSSCPassingYear" label="SSC Passing Year">
                              <Form.Control
                                type="number"
                                placeholder="SSC Passing Year"
                                name='sscPassingYear'
                                value={studentData?.studentProfile?.pastQualification?.ssc?.year}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      pastQualification: {
                                        ...studentData?.studentProfile?.pastQualification,
                                        ssc: {
                                          ...studentData?.studentProfile?.pastQualification?.ssc,
                                          year: e.target.value
                                        }
                                      }
                                    }
                                  });
                                }}
                              />
                            </FloatingLabel>
                          </div>

                          <div className="px-2 py-3 flex flex-col gap-2">
                            <FloatingLabel controlId="floatingSelectHSC" label="HSC Board Name">
                              <Form.Select
                                aria-label="Floating label select HSC Board"
                                className='cursor-pointer'
                                name='hscBoard'
                                value={studentData?.studentProfile?.pastQualification?.hsc?.board || "undefined"}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      pastQualification: {
                                        ...studentData?.studentProfile?.pastQualification,
                                        hsc: {
                                          ...studentData?.studentProfile?.pastQualification?.hsc,
                                          board: e.target.value
                                        }
                                      }
                                    }
                                  });
                                }}
                              >
                                <option disabled value="undefined" className='text-gray-400'>Enter Your SSC Board Name</option>
                                <option value="Maharashtra State Board of Secondary and Higher Secondary Education (MSBSHSE)">Maharashtra State Board of Secondary and Higher Secondary Education (MSBSHSE)</option>
                                <option value="Central Board of Secondary Education (CBSE)">Central Board of Secondary Education (CBSE)</option>
                                <option value="Council for the Indian School Certificate Examinations (CISCE)">Council for the Indian School Certificate Examinations (CISCE)</option>
                                <option value="Other">Other</option>
                              </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel controlId="floatingHSCMarks" label="HSC Percentage">
                              <Form.Control
                                type="number"
                                placeholder="HSC Percentage"
                                name='hscPercentage'
                                value={studentData?.studentProfile?.pastQualification?.hsc?.percentage}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      pastQualification: {
                                        ...studentData?.studentProfile?.pastQualification,
                                        hsc: {
                                          ...studentData?.studentProfile?.pastQualification?.hsc,
                                          percentage: e.target.value
                                        }
                                      }
                                    }
                                  });
                                }}
                              />
                            </FloatingLabel>
                            <FloatingLabel controlId="floatingSelectHSCPassingYear" label="HSC Passing Year">
                              <Form.Control
                                type="number"
                                placeholder="HSC Passing Year"
                                name='hscPassingYear'
                                value={studentData?.studentProfile?.pastQualification?.hsc?.year}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      pastQualification: {
                                        ...studentData?.studentProfile?.pastQualification,
                                        hsc: {
                                          ...studentData?.studentProfile?.pastQualification?.hsc,
                                          year: e.target.value
                                        }
                                      }
                                    }
                                  });
                                }}
                              />
                            </FloatingLabel>
                          </div>

                          <div className="px-2 py-3 flex flex-col gap-2">
                            <FloatingLabel controlId="floatingSelectDiploma" label="Diploma Board Name">
                              <Form.Select
                                aria-label="Floating label select Diploma Board"
                                className='cursor-pointer'
                                name='diplomaBoard'
                                value={studentData?.studentProfile?.pastQualification?.diploma?.board || "undefined"}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      pastQualification: {
                                        ...studentData?.studentProfile?.pastQualification,
                                        diploma: {
                                          ...studentData?.studentProfile?.pastQualification?.diploma,
                                          board: e.target.value
                                        }
                                      }
                                    }
                                  });
                                }}
                              >
                                <option disabled value="undefined" className='text-gray-400'>Enter Your Diploma University Name</option>
                                <option value="Mumbai University">Mumbai University</option>
                                <option value="Other">Other</option>
                              </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel controlId="floatingDiplomaMarks" label="Diploma Percentage or CGPA">
                              <Form.Control
                                type="number"
                                placeholder="Diploma Percentage"
                                name='diplomaPercentage'
                                value={studentData?.studentProfile?.pastQualification?.diploma?.percentage}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      pastQualification: {
                                        ...studentData?.studentProfile?.pastQualification,
                                        diploma: {
                                          ...studentData?.studentProfile?.pastQualification?.diploma,
                                          percentage: e.target.value
                                        }
                                      }
                                    }
                                  });
                                }}
                              />
                            </FloatingLabel>
                            <FloatingLabel controlId="floatingSelectDiplomaPassingYear" label="Diploma Passing Year">
                              <Form.Control
                                type="number"
                                placeholder="Diploma Passing Year"
                                name='diplomaPassingYear'
                                value={studentData?.studentProfile?.pastQualification?.diploma?.year}
                                onChange={(e) => {
                                  setStudentData({
                                    ...studentData,
                                    studentProfile: {
                                      ...studentData?.studentProfile,
                                      pastQualification: {
                                        ...studentData?.studentProfile?.pastQualification,
                                        diploma: {
                                          ...studentData?.studentProfile?.pastQualification?.diploma,
                                          year: e.target.value
                                        }
                                      }
                                    }
                                  });
                                }}
                              />
                            </FloatingLabel>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                }
                <div className="flex flex-col justify-center items-center gap-2">
                  <Button variant="primary" type='submit' size='lg'>Save</Button>
                </div>
              </form>
            </div>
          </>
        )
      }
    </>
  )
}

export default UserDetails
