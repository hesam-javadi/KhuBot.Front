import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { User } from '../../types';
import userDefaultImg from '../../assets/userDefault.png';
import { IoLogOutOutline } from 'react-icons/io5';

interface UserDropdownProps {
  user: User;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout }) => {
  return (
    <Menu as="div" className="relative inline-block text-right">
      <Menu.Button className="inline-flex items-center space-x-2 space-x-reverse">
        <span className="text-gray-700 text-sm font-normal">{user.name}</span>
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img src={userDefaultImg} alt={user.name} className="w-full h-full object-cover" />
        </div>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {() => (
                <div className="px-4 py-2 text-sm text-gray-700">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-gray-500">
                    درصد استفاده: {user.usagePercentage}%
                  </div>
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onLogout}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } group flex w-full items-center px-4 py-2 text-sm text-red-600`}
                >
                  <div className="ml-2 text-red-600">
                    <IoLogOutOutline size={20} />
                  </div>
                  خروج
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserDropdown; 