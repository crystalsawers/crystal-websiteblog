'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, FieldValue } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { useRouter } from 'next/navigation';

interface Milestone {
  date: string;
  description: string;
}

interface Challenge {
  description: string;
  solution: string;
}

interface Skill {
  name: string;
  details: string;
}

interface FormDataType {
  start_of_journey: string;
  milestones: Milestone[];
  challenges: Challenge[];
  skills: Skill[];
  future_aspirations: string;
}

const EditJourney = () => {
  const [formData, setFormData] = useState<FormDataType>({
    start_of_journey: '',
    milestones: [{ date: '', description: '' }],
    challenges: [{ description: '', solution: '' }],
    skills: [{ name: '', details: '' }],
    future_aspirations: '',
  });

  const [successMessage, setSuccessMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'journey', 'rDMftZ2rFAzYQ1xzf1mQ');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data() as FormDataType);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = <T extends keyof FormDataType>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number,
    field?: T,
    key?: keyof FormDataType[T][number], // This ensures the key matches the correct field's object
  ) => {
    if (field && typeof index === 'number' && key) {
      setFormData((prev) => {
        const updatedField = [
          ...(prev[field] as Milestone[] | Challenge[] | Skill[]),
        ];
        updatedField[index] = {
          ...updatedField[index],
          [key]: e.target.value,
        };
        return { ...prev, [field]: updatedField };
      });
    } else {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = (
    field: keyof FormDataType,
    defaultItem: Milestone | Challenge | Skill,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [
        ...(prev[field] as Milestone[] | Challenge[] | Skill[]),
        defaultItem,
      ],
    }));
  };

  const handleRemoveItem = (field: keyof FormDataType, index: number) => {
    setFormData((prev) => {
      const updatedField = [
        ...(prev[field] as Milestone[] | Challenge[] | Skill[]),
      ];
      updatedField.splice(index, 1);
      return { ...prev, [field]: updatedField };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const docRef = doc(db, 'journey', 'rDMftZ2rFAzYQ1xzf1mQ');

    const updateData = {
      start_of_journey: formData.start_of_journey,
      future_aspirations: formData.future_aspirations,
      milestones: formData.milestones.map((milestone) => ({ ...milestone })),
      challenges: formData.challenges.map((challenge) => ({ ...challenge })),
      skills: formData.skills.map((skill) => ({ ...skill })),
    } as { [key: string]: FieldValue | Partial<unknown> };

    await updateDoc(docRef, updateData);

    setSuccessMessage('Updated successfully!');
    setTimeout(() => {
      setSuccessMessage('');
      router.push('/journey');
    }, 1000);
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-center text-2xl font-bold text-custom-green">
        Edit My Journey
      </h1>
      {successMessage && (
        <p className="mb-4 text-green-500">{successMessage}</p>
      )}
      <form onSubmit={handleSubmit}>
        <label className="mb-2 block font-medium text-custom-green">
          Start of Journey:
        </label>
        <textarea
          name="start_of_journey"
          value={formData.start_of_journey}
          onChange={handleInputChange}
          className="mb-4 w-full rounded-md border bg-gray-800 p-2 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
        />

        <div className="mb-8 rounded-md border border-gray-700 p-4">
          <h2 className="mb-4 text-lg font-semibold text-custom-green">
            Milestones
          </h2>
          {formData.milestones.map((milestone, index) => (
            <div key={index} className="mb-6">
              <label className="mb-2 block font-medium text-custom-green">
                Milestone Date:
              </label>
              <input
                type="text"
                placeholder="Enter date (e.g., 2023-01-01)"
                value={milestone.date}
                onChange={(e) =>
                  handleInputChange(e, index, 'milestones', 'date')
                }
                className="mb-2 w-full rounded-md border bg-gray-800 p-2 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
              />
              <label className="mb-2 block font-medium text-custom-green">
                Milestone Description:
              </label>
              <textarea
                placeholder="Describe the milestone"
                value={milestone.description}
                onChange={(e) =>
                  handleInputChange(e, index, 'milestones', 'description')
                }
                className="mb-2 w-full rounded-md border bg-gray-800 p-2 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem('milestones', index)}
                className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              handleAddItem('milestones', { date: '', description: '' })
            }
            className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add Milestone
          </button>
        </div>

        <div className="mb-8 rounded-md border border-gray-700 p-4">
          <h2 className="mb-4 text-lg font-semibold text-custom-green">
            Challenges
          </h2>
          {formData.challenges.map((challenge, index) => (
            <div key={index} className="mb-6">
              <label className="mb-2 block font-medium text-custom-green">
                Challenge:
              </label>
              <textarea
                placeholder="Describe the challenge"
                value={challenge.description}
                onChange={(e) =>
                  handleInputChange(e, index, 'challenges', 'description')
                }
                className="mb-2 w-full rounded-md border bg-gray-800 p-2 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
              />
              <label className="mb-2 block font-medium text-custom-green">
                Solution:
              </label>
              <textarea
                placeholder="Provide the solution"
                value={challenge.solution}
                onChange={(e) =>
                  handleInputChange(e, index, 'challenges', 'solution')
                }
                className="mb-2 w-full rounded-md border bg-gray-800 p-2 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem('challenges', index)}
                className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              handleAddItem('challenges', { description: '', solution: '' })
            }
            className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add Challenge
          </button>
        </div>

        <div className="mb-8 rounded-md border border-gray-700 p-4">
          <h2 className="mb-4 text-lg font-semibold text-custom-green">
            Skills
          </h2>
          {formData.skills.map((skill, index) => (
            <div key={index} className="mb-6">
              <label className="mb-2 block font-medium text-custom-green">
                Skill Name:
              </label>
              <input
                type="text"
                placeholder="Enter skill name"
                value={skill.name}
                onChange={(e) => handleInputChange(e, index, 'skills', 'name')}
                className="mb-2 w-full rounded-md border bg-gray-800 p-2 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
              />
              <label className="mb-2 block font-medium text-custom-green">
                Details:
              </label>
              <textarea
                placeholder="Describe the skill"
                value={skill.details}
                onChange={(e) =>
                  handleInputChange(e, index, 'skills', 'details')
                }
                className="mb-2 w-full rounded-md border bg-gray-800 p-2 text-custom-green focus:outline-none focus:ring-2 focus:ring-custom-green"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem('skills', index)}
                className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddItem('skills', { name: '', details: '' })}
            className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add Skill
          </button>
        </div>

        <button
          type="submit"
          className="mx-auto block rounded-md bg-custom-green px-6 py-3 text-lg text-black hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-custom-green"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default EditJourney;
