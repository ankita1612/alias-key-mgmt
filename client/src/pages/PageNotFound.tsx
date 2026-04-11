export default function PageNotFound() {
  return (
    <div className="flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Text */}
        <h1 className="font-extrabold text-gray-800 text-9xl">404</h1>

        {/* Message */}
        <p className="mt-4 text-xl text-gray-600">Oops! Page not found.</p>

        <p className="mt-2 text-gray-500">
          The page you are looking for doesn't exist or has been moved.
        </p>

        {/* Button */}
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 mt-6 text-white transition duration-300 bg-blue-600 rounded-lg shadow hover:bg-blue-700"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
