// src/views/AdminDashboard.tsx
import React from 'react';
import View from './view';
import NotFound from './notFound';
import { Role, User } from '../service/pizzaService';
import FranchiseListView from './FranchiseListView'; // Import the new component
import UserListView from './UserListView';         // Import the new component

interface Props {
  user: User | null;
}

export default function AdminDashboard(props: Props) {
  const [activeView, setActiveView] = React.useState('franchises');

  if (!Role.isRole(props.user, Role.Admin)) {
    return <NotFound />;
  }

  // Common styles for tabs
  const tabStyle = "px-4 py-2 text-sm font-medium border-b-2";
  const activeTabStyle = "border-orange-500 text-orange-500";
  const inactiveTabStyle = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

  return (
    <View title="Mama Ricci's kitchen">
      <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              role="tab"
              aria-selected={activeView === 'franchises'}
              onClick={() => setActiveView('franchises')}
              className={`${tabStyle} ${activeView === 'franchises' ? activeTabStyle : inactiveTabStyle}`}
            >
              Franchises
            </button>
            <button
              role="tab"
              aria-selected={activeView === 'users'}
              onClick={() => setActiveView('users')}
              className={`${tabStyle} ${activeView === 'users' ? activeTabStyle : inactiveTabStyle}`}
            >
              Users
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeView === 'franchises' && <FranchiseListView />}
          {activeView === 'users' && <UserListView />}
        </div>
      </div>
    </View>
  );
}