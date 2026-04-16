import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ title, breadcrumbs, children, rightContent }) => {
  return (
    <div className="flex min-h-screen bg-gray-50/80 dark:bg-gray-900/80">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-60 min-w-0">
        <Navbar title={title} breadcrumbs={breadcrumbs} rightContent={rightContent} />
        <main className="flex-1 p-6 overflow-x-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;