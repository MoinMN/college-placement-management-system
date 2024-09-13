import React, { useState } from 'react';
import { Form, FloatingLabel } from 'react-bootstrap';
import { GrFormAdd } from 'react-icons/gr';
import axios from 'axios';
import Toast from '../Toast';
import ModalBox from '../Modal';
import { BASE_URL } from '../../config/config';

function AddNewUser() {
  const [data, setData] = useState({
    first_name: "",
    email: "",
    number: "",
    password: "",
    sendMail: true
  });

  // for error message
  const [error, setError] = useState({});

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => setShowModal(false);

  const handleDataChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleModalSubmit = (e) => {
    e.preventDefault();

    let newError = {};

    if (!data?.first_name) newError.first_name = 'Name Required!';
    if (!data?.email) newError.email = 'Email Required!';
    if (!data?.number) newError.number = 'Number Required!';
    if (!data?.password) newError.password = 'Initial Password Required!';

    // If any errors were found, set them and return early to prevent the modal from opening
    if (Object.keys(newError).length > 0) return setError(newError);

    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/management/addtpo`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      if (response?.data) {
        if (response?.data?.msg === "User Created!") {
          if (data?.sendMail === true) {
            // Redirect to mail client with a defined subject and body
            const subject = encodeURIComponent("Welcome to the team!");
            const body = encodeURIComponent(`Hi ${data.first_name},\n\nWelcome to our team as a TPO. We're excited to work with you!\nNote:\nYour ID: ${data.email}\nPassword: ${data.password}\n\nMake sure you change password as soon as possible!!!\n\nBest regards,\nManagement Team`);

            // Create a temporary anchor element
            const mailtoLink = document.createElement('a');
            mailtoLink.href = `mailto:${data.email}?subject=${subject}&body=${body}`;
            mailtoLink.target = '_blank'; // Open in new tab

            // Append to body and click the link programmatically
            document.body.appendChild(mailtoLink);
            mailtoLink.click();

            // Clean up by removing the temporary element
            document.body.removeChild(mailtoLink);
          }
        }
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
    } catch (error) {
      console.log("handleSubmit => AddTPO.jsx ==> ", error);
    }
    setShowModal(false);
  }

  return (
    <>
      {/*  Toast Message */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="top-center"
      />

      <div className="flex justify-center items-center h-full">
        <div className="my-4 backdrop-blur-md bg-white/30 border border-white/20 rounded-lg p-8 shadow shadow-red-400 w-fit">
          <Form onSubmit={handleModalSubmit} className='flex flex-col justify-center items-center'>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6">
              <div className="">
                <FloatingLabel label={
                  <>
                    <span>Name <span className='text-red-500'>*</span></span>
                  </>
                }>
                  <Form.Control
                    type="text"
                    autoComplete="name"
                    placeholder="Name"
                    name='first_name'
                    value={data.first_name || ''}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>
                <span className='text-red-500'>{error?.first_name}</span>
              </div>
              <div className="">
                <FloatingLabel label={
                  <>
                    <span>Email <span className='text-red-500'>*</span></span>
                  </>
                }>
                  <Form.Control
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    name='email'
                    value={data.email || ''}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>
                <span className='text-red-500'>{error?.email}</span>
              </div>
              <div className="">
                <FloatingLabel label={
                  <>
                    <span>Number <span className='text-red-500'>*</span></span>
                  </>
                }>
                  <Form.Control
                    type="number"
                    autoComplete="number"
                    placeholder="Phone Number"
                    name='number'
                    value={data.number || ''}
                    onInput={(e) => {
                      if (e.target.value.length > 10) {
                        e.target.value = e.target.value.slice(0, 10);
                      }
                    }}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>
                <span className='text-red-500'>{error?.number}</span>
              </div>
              <div className="">
                <FloatingLabel label={
                  <>
                    <span>Initial Password <span className='text-red-500'>*</span></span>
                  </>
                }>
                  <Form.Control
                    type="password"
                    autoComplete="password"
                    placeholder="Enter Initial Password"
                    name='password'
                    value={data.password || ''}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>
                <span className='text-red-500'>{error?.password}</span>
              </div>
              <Form.Check
                label="Send user email about creation of account"
                name="sendMail"
                onChange={(e) => setData({ ...data, sendMail: e.target.checked })}
                checked={data.sendMail}
                type='checkbox'
              />
            </div>
            <button type="submit" className="my-1 flex items-center px-3 py-2 bg-blue-500 text-white rounded">
              <GrFormAdd className="mr-2 text-3xl" />
              Create New
            </button>
          </Form>
        </div>
      </div>

      {/* ModalBox Component */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={`Do you want to create new user ${data.sendMail === true ? ` and send email to ${data?.email} about creation of user!` : ``}?`}
        btn={"Create"}
        confirmAction={handleSubmit}
      />
    </>
  );
}

export default AddNewUser;
