'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

const EditAbout = () => {
  const [formData, setFormData] = useState({
    introduction: '',
    personal_story: '',
    contact_info: {
      email: '',
      blog_email: '',
      linkedin: '',
      github: '',
    },
  });

  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'about-me', 'UcVHqypZBonzxZehpKPj');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data() as {
          introduction: string;
          personal_story: string;
          contact_info: {
            email: string;
            blog_email: string;
            linkedin: string;
            github: string;
          };
        });
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['email', 'blog_email', 'linkedin', 'github'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        contact_info: {
          ...prev.contact_info,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const docRef = doc(db, 'about-me', 'UcVHqypZBonzxZehpKPj');
    await updateDoc(docRef, formData);
    setSuccessMessage('Updated successfully!');
    setTimeout(() => {
      setSuccessMessage('');
      router.push('/about'); // Navigate back to the About page
    }, 1000); // Navigate after 1 second
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-custom-green text-center">Edit About Me</h1>
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium text-custom-green">Introduction:</label>
        <textarea
          name="introduction"
          value={formData.introduction}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded-md bg-gray-800 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
        />
        
        <label className="block mb-2 font-medium text-custom-green">Personal Story:</label>
        <textarea
          name="personal_story"
          value={formData.personal_story}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded-md bg-gray-800 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
        />

        <label className="block mb-2 font-medium text-custom-green">Personal Email:</label>
        <input
          type="email"
          name="email"
          value={formData.contact_info.email}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded-md bg-gray-800 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
        />

        <label className="block mb-2 font-medium text-custom-green">Blog Email:</label>
        <input
          type="email"
          name="blog_email"
          value={formData.contact_info.blog_email}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded-md bg-gray-800 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
        />

        <label className="block mb-2 font-medium text-custom-green">LinkedIn:</label>
        <input
          type="text"
          name="linkedin"
          value={formData.contact_info.linkedin}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded-md bg-gray-800 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
        />

        <label className="block mb-2 font-medium text-custom-green">GitHub:</label>
        <input
          type="text"
          name="github"
          value={formData.contact_info.github}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded-md bg-gray-800 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
        />

        <button
          type="submit"
          className="bg-custom-green hover:bg-green-700 text-black px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-green block mx-auto text-lg"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default EditAbout;
