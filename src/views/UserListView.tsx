import React from 'react';
import { pizzaService } from '../service/service';
import { User } from '../service/pizzaService';
import { TrashIcon } from '../icons';

export default function UserListView() {
  const [users, setUsers] = React.useState<User[]>([]);
  // Add state for pagination and filtering later if needed
  // const [userPage, setUserPage] = React.useState(0);

  React.useEffect(() => {
    // Fetch users when the component mounts
    pizzaService.getUsers({ page: 0, limit: 10 }).then(setUsers);
  }, []);

  const deleteUser = async (userToDelete: User) => {
    // Add a confirmation dialog for safety
    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}?`)) {
      await pizzaService.deleteUser(userToDelete.id);
      // Refresh the list after deletion
      setUsers(users.filter(u => u.id !== userToDelete.id));
    }
  };

  return (
    <div aria-label="Users Table">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
          <tr>
            {['Name', 'Email', 'Roles', 'Action'].map((header) => (
              <th key={header} scope="col" className="px-6 py-3 text-start text-xs font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} data-testid={`user-row-${user.email}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{user.name}</td>
              <td data-testid="user-email" className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.roles?.map(r => r.role).join(', ')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <button
                  type="button"
                  onClick={() => deleteUser(user)}
                  className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-red-500 text-red-500 hover:border-red-800 hover:text-red-800"
                >
                  <TrashIcon />
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}