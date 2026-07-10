import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { User } from "../../types";
import userDefaultImg from "../../assets/userDefault.png";
import { IoLogOutOutline } from "react-icons/io5";

interface UserDropdownProps {
  user: User;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout }) => {
  return (
    <Menu as="div" className="relative inline-block text-right">
      <Menu.Button className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/60 transition-colors">
        <span className="text-gray-700 text-sm font-normal hidden sm:block">
          {user.name}
        </span>
        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-indigo-100 shadow-sm">
          <img
            src={userDefaultImg}
            alt={user.name}
            className="w-full h-full object-cover"
          />
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
        <Menu.Items className="absolute left-0 mt-2 w-60 origin-top-left rounded-2xl bg-white shadow-xl shadow-indigo-100/60 ring-1 ring-gray-100 focus:outline-none overflow-hidden">
          {/* User info block */}
          <Menu.Item>
            {() => (
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-800">
                  {user.name}
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">میزان استفاده</span>
                    <span className="text-xs font-medium text-indigo-600">
                      {user.usagePercentage}٪
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-indigo-500 to-blue-400 transition-all duration-500"
                      style={{ width: `${user.usagePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </Menu.Item>

          {/* Logout */}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onLogout}
                className={`${active ? "bg-red-50" : ""} flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 transition-colors`}
              >
                <IoLogOutOutline size={18} />
                خروج از حساب
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserDropdown;
