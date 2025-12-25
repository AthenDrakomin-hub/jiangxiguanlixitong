
import React, { useState, useEffect, useCallback } from 'react';
import { Save, Users, Shield, Edit3, Trash2, Plus, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { User, Role, Permission } from '../types';

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
    password: '', // 添加密码字段
    role: '',
    isActive: true,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 从 API 加载真实数据
      const [usersResponse, rolesResponse] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/roles'),
      ]);
      
      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
      }
      
      if (rolesResponse.success) {
        setRoles(rolesResponse.data || []);
      } else {
        console.error('获取用户数据失败:', usersResponse.message);
        // 如果API失败，使用默认数据
        setUsers([]);
      }
    } catch (error) {
      console.error('加载权限数据失败:', error);
      alert('加载数据失败: ' + (error instanceof Error ? error.message : '未知错误'));
      // 错误时使用空数组
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // 更新用户
        await apiClient.update('users', editingUser.id, {
          username: editingUser.username, // 保持用户名不变
          password: userFormData.password || undefined, // 只有在提供了新密码时才更新
          role: userFormData.role,
          isActive: userFormData.isActive,
        });
        
        // 重新加载数据以获取更新后的用户列表
        await loadData();
        alert('用户更新成功');
      } else {
        // 创建新用户
        await apiClient.create('users', {
          username: userFormData.username,
          password: userFormData.password,
          role: userFormData.role,
          isActive: userFormData.isActive,
        });
        
        // 重新加载数据以获取新的用户列表
        await loadData();
        alert('用户创建成功');
      }
    } catch (error) {
      console.error('用户操作失败:', error);
      alert('用户操作失败: ' + (error instanceof Error ? error.message : 'API请求失败'));
    }

    // 重置表单
    setShowUserForm(false);
    setEditingUser(null);
    setUserFormData({
      username: '',
      password: '',
      role: '',
      isActive: true,
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      password: '', // Password is reset or not editable here
      role: user.role,
      isActive: user.isActive,
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        await apiClient.remove('users', userId);
        // 重新加载数据以获取更新后的用户列表
        await loadData();
        alert('用户删除成功');
      } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除用户失败: ' + (error instanceof Error ? error.message : 'API请求失败'));
      }
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
      {/* 功能说明提示 */}
      <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
        <div className="flex items-start">
          <AlertCircle className="mt-0.5 h-5 w-5 text-blue-500" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              用户管理
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>当前用户管理功能已连接到后端API，所有修改将保存到数据库中。</p>
              <p className="mt-1">注意：角色和权限管理功能正在开发中，目前仅支持用户基础信息管理。</p>
            </div>
          </div>
        </div>
      </div>

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
                            className={`flex items-center gap-1 ${
                              role.id === 'admin'
                                ? 'cursor-not-allowed text-slate-300'
                                : 'text-red-600 hover:text-red-900'
                            }`}
                            disabled={role.id === 'admin'}
                            title={role.id === 'admin' ? '禁止删除系统默认角色' : ''}
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
                  password: '',
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
                      disabled={!!editingUser} // 编辑时不允许修改用户名
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        密码 *
                      </label>
                      <input
                        type="password"
                        value={userFormData.password}
                        onChange={(e) =>
                          setUserFormData({
                            ...userFormData,
                            password: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        required={!editingUser}
                        minLength={6}
                        placeholder="最少 6 位字符"
                      />
                    </div>
                  )}

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
                            className={`flex items-center gap-1 ${
                              user.username === 'admin'
                                ? 'cursor-not-allowed text-slate-300'
                                : 'text-red-600 hover:text-red-900'
                            }`}
                            disabled={user.username === 'admin'}
                            title={user.username === 'admin' ? '禁止删除系统管理员' : ''}
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