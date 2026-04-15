import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ title, breadcrumbs, children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-60">
        <Navbar title={title} breadcrumbs={breadcrumbs} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;