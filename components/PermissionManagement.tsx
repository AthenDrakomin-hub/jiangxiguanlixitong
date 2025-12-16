import React, { useState, useEffect, useCallback } from 'react';
import { Save, Users, Shield, Edit3, Trash2, Plus } from 'lucide-react';

// 角色类型定义
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

// 用户类型定义
interface User {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

// 权限类型定义
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const PermissionManagement: React.FC = () => {
  // 角色状态
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions] = useState<Permission[]>([
    {
      id: 'menu_view',
      name: '查看菜单',
      description: '允许查看菜单管理',
      category: '菜单管理',
    },
    {
      id: 'menu_edit',
      name: '编辑菜单',
      description: '允许添加/编辑菜单项',
      category: '菜单管理',
    },
    {
      id: 'menu_delete',
      name: '删除菜单',
      description: '允许删除菜单项',
      category: '菜单管理',
    },
    {
      id: 'order_view',
      name: '查看订单',
      description: '允许查看所有订单',
      category: '订单管理',
    },
    {
      id: 'order_edit',
      name: '编辑订单',
      description: '允许修改订单状态',
      category: '订单管理',
    },
    {
      id: 'order_delete',
      name: '删除订单',
      description: '允许删除订单',
      category: '订单管理',
    },
    {
      id: 'finance_view',
      name: '查看财务',
      description: '允许查看财务报表',
      category: '财务管理',
    },
    {
      id: 'finance_edit',
      name: '编辑财务',
      description: '允许添加/修改财务记录',
      category: '财务管理',
    },
    {
      id: 'inventory_view',
      name: '查看库存',
      description: '允许查看库存信息',
      category: '库存管理',
    },
    {
      id: 'inventory_edit',
      name: '编辑库存',
      description: '允许修改库存信息',
      category: '库存管理',
    },
    {
      id: 'user_manage',
      name: '用户管理',
      description: '允许管理用户和角色',
      category: '系统管理',
    },
    {
      id: 'settings_manage',
      name: '系统设置',
      description: '允许修改系统设置',
      category: '系统管理',
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');

  // 表单状态
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    role: '',
    isActive: true,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // 模拟加载角色和用户数据
      // 在实际应用中，这些数据会从API加载
      const mockRoles: Role[] = [
        {
          id: 'admin',
          name: '管理员',
          description: '系统管理员，拥有所有权限',
          permissions: permissions.map((p) => p.id),
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'manager',
          name: '经理',
          description: '餐厅经理，拥有大部分管理权限',
          permissions: permissions
            .filter((p) => !['user_manage', 'settings_manage'].includes(p.id))
            .map((p) => p.id),
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'staff',
          name: '员工',
          description: '普通员工，只能查看和处理订单',
          permissions: ['order_view', 'order_edit'],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          role: 'admin',
          isActive: true,
          lastLogin: '2025-12-10T10:30:00Z',
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          username: 'manager',
          role: 'manager',
          isActive: true,
          lastLogin: '2025-12-10T09:15:00Z',
          createdAt: '2025-01-02T00:00:00Z',
        },
        {
          id: '3',
          username: 'staff1',
          role: 'staff',
          isActive: true,
          lastLogin: '2025-12-10T08:45:00Z',
          createdAt: '2025-01-03T00:00:00Z',
        },
      ];

      setRoles(mockRoles);
      setUsers(mockUsers);
    } catch (error) {
      console.error('加载权限数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [permissions]);

  // 加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 角色表单处理
  const handleRoleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRole) {
      // 更新角色
      const updatedRoles = roles.map((role) =>
        role.id === editingRole.id
          ? { ...role, ...roleFormData, updatedAt: new Date().toISOString() }
          : role
      );
      setRoles(updatedRoles);
    } else {
      // 创建新角色
      const newRole: Role = {
        id: `role_${Date.now()}`,
        ...roleFormData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setRoles([...roles, newRole]);
    }

    // 重置表单
    setShowRoleForm(false);
    setEditingRole(null);
    setRoleFormData({
      name: '',
      description: '',
      permissions: [],
    });
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setShowRoleForm(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('确定要删除这个角色吗？关联的用户将失去此角色权限。')) {
      setRoles(roles.filter((role) => role.id !== roleId));
    }
  };

  // 用户表单处理
  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      // 更新用户
      const updatedUsers = users.map((user) =>
        user.id === editingUser.id ? { ...user, ...userFormData } : user
      );
      setUsers(updatedUsers);
    } else {
      // 创建新用户
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: userFormData.username,
        role: userFormData.role,
        isActive: userFormData.isActive,
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
    }

    // 重置表单
    setShowUserForm(false);
    setEditingUser(null);
    setUserFormData({
      username: '',
      role: '',
      isActive: true,
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setRoleFormData((prev) => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId];

      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  // 获取角色名称
  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : roleId;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">权限管理</h2>
          <p className="mt-1 text-sm text-slate-500">
            管理用户角色和系统访问权限
          </p>
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'roles'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <Shield className="mr-2 inline" size={16} />
            角色管理
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'users'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <Users className="mr-2 inline" size={16} />
            用户管理
          </button>
        </nav>
      </div>

      {/* 角色管理 */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingRole(null);
                setShowRoleForm(true);
                setRoleFormData({
                  name: '',
                  description: '',
                  permissions: [],
                });
              }}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
            >
              <Plus size={16} />
              添加角色
            </button>
          </div>

          {showRoleForm && (
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-800">
                {editingRole ? '编辑角色' : '添加新角色'}
              </h3>

              <form onSubmit={handleRoleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      角色名称 *
                    </label>
                    <input
                      type="text"
                      value={roleFormData.name}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      描述
                    </label>
                    <input
                      type="text"
                      value={roleFormData.description}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          description: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    权限分配
                  </label>
                  <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 p-4">
                    {Array.from(
                      new Set(permissions.map((p) => p.category))
                    ).map((category) => (
                      <div key={category} className="mb-4 last:mb-0">
                        <h4 className="mb-2 font-medium text-slate-800">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {permissions
                            .filter((p) => p.category === category)
                            .map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`perm_${permission.id}`}
                                  checked={roleFormData.permissions.includes(
                                    permission.id
                                  )}
                                  onChange={() =>
                                    handlePermissionToggle(permission.id)
                                  }
                                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                <label
                                  htmlFor={`perm_${permission.id}`}
                                  className="ml-2 text-sm text-slate-700"
                                >
                                  {permission.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleForm(false);
                      setEditingRole(null);
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                  >
                    <Save size={16} />
                    保存角色
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      权限数量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {role.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-slate-500">
                          {role.description}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                          {role.permissions.length}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
                          >
                            <Edit3 size={14} />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-900"
                            disabled={role.id === 'admin'} // 禁止删除管理员角色
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 用户管理 */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingUser(null);
                setShowUserForm(true);
                setUserFormData({
                  username: '',
                  role: '',
                  isActive: true,
                });
              }}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
            >
              <Plus size={16} />
              添加用户
            </button>
          </div>

          {showUserForm && (
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-800">
                {editingUser ? '编辑用户' : '添加新用户'}
              </h3>

              <form onSubmit={handleUserFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      用户名 *
                    </label>
                    <input
                      type="text"
                      value={userFormData.username}
                      onChange={(e) =>
                        setUserFormData({
                          ...userFormData,
                          username: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      角色 *
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) =>
                        setUserFormData({
                          ...userFormData,
                          role: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      required
                    >
                      <option value="">请选择角色</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={userFormData.isActive}
                      onChange={(e) =>
                        setUserFormData({
                          ...userFormData,
                          isActive: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm text-slate-700"
                    >
                      账户激活
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                  >
                    <Save size={16} />
                    保存用户
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      用户名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      最后登录
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {user.username}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-slate-500">
                          {getRoleName(user.role)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                            激活
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 text-xs font-semibold leading-5 text-slate-800">
                            禁用
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString('zh-CN')
                          : '从未登录'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
                          >
                            <Edit3 size={14} />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-900"
                            disabled={user.username === 'admin'} // 禁止删除管理员用户
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;
