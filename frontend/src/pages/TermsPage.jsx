function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Terms & Conditions
      </h2>
      <p className="text-gray-700 mb-2">
        Welcome to WorkSage! By using our service, you agree to the following
        terms:
      </p>
      <ul className="list-disc pl-5 mb-2">
        <li>Users must provide accurate information during signup.</li>
        <li>Files uploaded must comply with copyright laws.</li>
        <li>Service is provided "as is" without warranties.</li>
      </ul>
      <p className="text-gray-700">
        For more details, contact support at support@cubicle.com.
      </p>
    </div>
  );
}

export default TermsPage;
