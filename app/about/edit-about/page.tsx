'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { useRouter } from 'next/navigation';

const EditAbout = () => {
  const [formData, setFormData] = useState({
    introduction: '',
    personal_story: '',
    contact_info: {
      email: '',
      blog_email: '',
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
        setFormData(
          docSnap.data() as {
            introduction: string;
            personal_story: string;
            contact_info: {
              email: string;
              blog_email: string;
              github: string;
            };
          },
        );
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (['email', 'blog_email', 'github'].includes(name)) {
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
      <h1 className="mb-4 text-center text-2xl font-bold text-[#99ffd3]">
        Edit About Me
      </h1>
      {successMessage && (
        <p className="mb-4 text-green-500">{successMessage}</p>
      )}
      <form onSubmit={handleSubmit}>
        <label className="mb-2 block font-medium text-[#99ffd3]">
          Introduction:
        </label>
        <textarea
          name="introduction"
          value={formData.introduction}
          onChange={handleInputChange}
          className="focus:ring-custom-green mb-4 w-full rounded-md border bg-gray-800 p-2 text-[#99ffd3] focus:ring-2 focus:outline-none"
        />

        <label className="mb-2 block font-medium text-[#99ffd3]">
          Personal Story:
        </label>
        <textarea
          name="personal_story"
          value={formData.personal_story}
          onChange={handleInputChange}
          className="focus:ring-custom-green mb-4 w-full rounded-md border bg-gray-800 p-2 text-[#99ffd3] focus:ring-2 focus:outline-none"
        />

        <label className="mb-2 block font-medium text-[#99ffd3]">
          Personal Email:
        </label>
        <input
          type="email"
          name="email"
          value={formData.contact_info.email}
          onChange={handleInputChange}
          className="focus:ring-custom-green mb-4 w-full rounded-md border bg-gray-800 p-2 text-[#99ffd3] focus:ring-2 focus:outline-none"
        />

        <label className="mb-2 block font-medium text-[#99ffd3]">
          Blog Email:
        </label>
        <input
          type="email"
          name="blog_email"
          value={formData.contact_info.blog_email}
          onChange={handleInputChange}
          className="focus:ring-custom-green mb-4 w-full rounded-md border bg-gray-800 p-2 text-[#99ffd3] focus:ring-2 focus:outline-none"
        />
        <label className="mb-2 block font-medium text-[#99ffd3]">GitHub:</label>
        <input
          type="text"
          name="github"
          value={formData.contact_info.github}
          onChange={handleInputChange}
          className="focus:ring-custom-green mb-4 w-full rounded-md border bg-gray-800 p-2 text-[#99ffd3] focus:ring-2 focus:outline-none"
        />

        <button
          type="submit"
          className="bg-custom-green focus:ring-custom-green mx-auto block rounded-md px-6 py-3 text-lg text-black hover:bg-green-700 focus:ring-2 focus:outline-none"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default EditAbout;
