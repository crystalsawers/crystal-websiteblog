'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  QuerySnapshot,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../components/AuthContext';

interface AboutMeDocument {
  id: string;
  introduction: string;
  personal_story: string;
  contact_info: {
    email: string;
    linkedin: string;
    github: string;
  };
}

const About = () => {
  const [data, setData] = useState<AboutMeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<AboutMeDocument | null>(null);
  const [formData, setFormData] = useState<{
    introduction: string;
    personal_story: string;
    contact_info: { email: string; linkedin: string; github: string };
  } | null>(null);

  const [formErrors, setFormErrors] = useState({
    introduction: '',
    personal_story: '',
    email: '',
    linkedin: '',
    github: '',
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot = await getDocs(
          collection(db, 'about-me'),
        );
        const items: AboutMeDocument[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<AboutMeDocument, 'id'>),
        }));
        setData(items);
      } catch (error) {
        setError('Error fetching About Me data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      const docRef = doc(db, 'about-me', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data() as Omit<AboutMeDocument, 'id'>;
        setEditingDoc({ id: docSnap.id, ...docData });
        setFormData({
          introduction: docData.introduction,
          personal_story: docData.personal_story,
          contact_info: docData.contact_info,
        });
      }
    } catch (error) {
      console.error('Error fetching document for editing:', error);
    }
  };

  const handleCloseEdit = () => {
    setEditingDoc(null);
    setFormErrors({
      introduction: '',
      personal_story: '',
      email: '',
      linkedin: '',
      github: '',
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Check if the name is for a contact info field
    if (['email', 'linkedin', 'github'].includes(name)) {
      setFormData((prevData) => ({
        ...prevData!,
        contact_info: {
          ...prevData!.contact_info,
          [name]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData!,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      introduction: '',
      personal_story: '',
      email: '',
      linkedin: '',
      github: '',
    };
    let isValid = true;

    if (!formData?.introduction.trim()) {
      errors.introduction = 'Introduction is required';
      isValid = false;
    }
    if (!formData?.personal_story.trim()) {
      errors.personal_story = 'Personal story is required';
      isValid = false;
    }
    if (!formData?.contact_info.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    }
    if (!formData?.contact_info.linkedin.trim()) {
      errors.linkedin = 'LinkedIn is required';
      isValid = false;
    }
    if (!formData?.contact_info.github.trim()) {
      errors.github = 'GitHub is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !formData) return;

    // Validate the form
    const isFormValid = validateForm();
    if (!isFormValid) return;

    try {
      const docRef = doc(db, 'about-me', editingDoc.id);
      await updateDoc(docRef, {
        introduction: formData.introduction,
        personal_story: formData.personal_story,
        contact_info: formData.contact_info,
      });
      setEditingDoc(null);
      setData((prevData) =>
        prevData.map((doc) =>
          doc.id === editingDoc.id ? { ...doc, ...formData } : doc,
        ),
      );
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  if (loading)
    return (
      <p className="text-center text-custom-green">Loading About Me page...</p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="lg:mx-auto lg:max-w-screen-lg lg:p-8">
      <h1 className="page-title">About Me</h1>
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <form onSubmit={handleSubmit} className="create-form">
            <h2 className="create-form-title">Edit About Me</h2>
            <label className="create-form-label">
              Introduction:
              <textarea
                name="introduction"
                value={formData?.introduction || ''}
                onChange={handleInputChange}
                className="create-form-textarea"
              />
              {formErrors.introduction && (
                <p className="text-red-700">{formErrors.introduction}</p>
              )}
            </label>
            <label className="create-form-label">
              Personal Story:
              <textarea
                name="personal_story"
                value={formData?.personal_story || ''}
                onChange={handleInputChange}
                className="create-form-textarea"
              />
              {formErrors.personal_story && (
                <p className="text-red-700">{formErrors.personal_story}</p>
              )}
            </label>
            <label className="create-form-label">
              Email:
              <input
                type="email"
                name="email"
                value={formData?.contact_info.email || ''}
                onChange={handleInputChange}
                className="create-form-input"
              />
              {formErrors.email && (
                <p className="text-red-700">{formErrors.email}</p>
              )}
            </label>

            <label className="create-form-label">
              LinkedIn:
              <input
                type="text"
                name="linkedin"
                value={formData?.contact_info.linkedin || ''}
                onChange={handleInputChange}
                className="create-form-input"
              />
              {formErrors.linkedin && (
                <p className="text-red-700">{formErrors.linkedin}</p>
              )}
            </label>

            <label className="create-form-label">
              GitHub:
              <input
                type="text"
                name="github"
                value={formData?.contact_info.github || ''}
                onChange={handleInputChange}
                className="create-form-input"
              />
              {formErrors.github && (
                <p className="text-red-700">{formErrors.github}</p>
              )}
            </label>

            <div className="mt-4 flex justify-end space-x-2">
              <button type="submit" className="create-form-button">
                Save
              </button>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="rounded-md bg-gray-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {data.length === 0 ? (
        <p>No About Me data available</p>
      ) : (
        data.map((item) => (
          <div key={item.id} className="card">
            <h2 className="card-header">Introduction</h2>
            <p className="card-text">{item.introduction}</p>
            <h2 className="card-header">Personal Story</h2>
            <p className="card-text">{item.personal_story}</p>
            <h2 className="card-header">Contact Info</h2>
            <p className="card-text">
              <span className="normal-text font-semibold">Email:</span>{' '}
              {item.contact_info.email}
            </p>
            <p className="card-text">
              <span className="normal-text font-semibold">LinkedIn:</span>{' '}
              <a
                href={item.contact_info.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-800 hover:underline"
              >
                {item.contact_info.linkedin}
              </a>
            </p>
            <p className="card-text">
              <span className="normal-text font-semibold">Github:</span>{' '}
              <a
                href={item.contact_info.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-800 hover:underline"
              >
                {item.contact_info.github}
              </a>
            </p>
            {isAuthenticated && (
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleEditClick(item.id)}
                  className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default About;
