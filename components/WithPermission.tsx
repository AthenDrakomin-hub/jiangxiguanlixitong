// components/WithPermission.tsx
// 基于权限的组件访问控制

import React from 'react';
import { usePermissions } from '../contexts/PermissionContext.js';

interface WithPermissionProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const WithPermission: React.FC<WithPermissionProps> = ({ 
  permission, 
  fallback = <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="text-center text-slate-500">无权限访问此功能</div></div>,
  children 
}) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default WithPermission;