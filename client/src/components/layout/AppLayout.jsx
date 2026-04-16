import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ title, breadcrumbs, children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-60 min-w-0">
        <Navbar title={title} breadcrumbs={breadcrumbs} />
        <main className="flex-1 p-6 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;