const ProtectedPage = () => {
  return (
    <div className="text-center">
      <h1 className="text-custom-green">Welcome back Crystal!</h1>
      <p className="text-custom-green">
        If you&#39;re seeing this you&#39;re logged in. You should see the logout button and option to edit posts
      </p>
    </div>
  );
};

export default ProtectedPage;
