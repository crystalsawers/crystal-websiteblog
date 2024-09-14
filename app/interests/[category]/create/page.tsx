// app/interests/[category]/create/page.tsx

import CreateForm from '../../../components/CreateForm';

const CreatePage = ({ params }: { params: { category: string } }) => {
    console.log('Received category:', params.category);
  return <CreateForm category={params.category} />;
};

export default CreatePage;
