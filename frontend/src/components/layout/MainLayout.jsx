import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = ({
  children,
  title,
  subtitle,
  showFilters = false,
  showHeader = true,
  onRoleChange,
  onTimeRangeChange,
  selectedRole,
  selectedTimeRange,
}) => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-16">
        {showHeader && (
          <Header 
            title={title} 
            subtitle={subtitle} 
            showFilters={showFilters}
            onRoleChange={onRoleChange}
            onTimeRangeChange={onTimeRangeChange}
            selectedRole={selectedRole}
            selectedTimeRange={selectedTimeRange}
          />
        )}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;

