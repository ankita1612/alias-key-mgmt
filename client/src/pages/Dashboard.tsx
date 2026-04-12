const Dashboard = () => {
  return (
    <div className="w-full h-full border-b bg-gray-50">
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome to Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            🏠 Admin Dashboard (/admin) Widgets: Total Requests, (Today) Active
            Alias Keys, Total Quota, Used Failed Requests, Top Domains ==
            Charts: Requests per minute, Domain usage
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
