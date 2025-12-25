import { useState } from 'react';
import { apiClient } from '../services/apiClient.js';

interface CloudSyncResult {
  success: boolean;
  message: string;
  snapshotId?: string;
  syncResults?: Record<string, any>;
}

export const useCloudSync = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  // 执行安全同步（同步前自动创建快照）
  const performSecureSync = async (): Promise<CloudSyncResult> => {
    setLoading(true);
    setStatus('开始同步...');
    
    try {
      // 1. 创建同步前快照
      setStatus('正在创建备份快照...');
      const snapshotResult = await apiClient.post('/snapshot', {
        action: 'create',
        snapshot: {
          data: await apiClient.fetchAll(),
          description: `数据同步前自动备份 ${new Date().toLocaleString()}`,
          createdAt: new Date().toISOString(),
          backupType: 'pre-sync',
          gitCommitHash: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
        }
      });

      if (!snapshotResult.success) {
        console.error('创建备份快照失败:', snapshotResult.message);
      } else {
        console.log('已创建同步前备份快照:', snapshotResult.id);
        
        // 记录审计日志
        try {
          await apiClient.post('/audit-log', {
            action: 'data_sync',
            userId: 'system',
            snapshotId: snapshotResult.id,
            details: {
              syncType: 'to_cloud',
              backupSnapshotId: snapshotResult.id,
              initiatedAt: new Date().toISOString(),
              initiatedBy: 'cloud_sync_hook'
            }
          });
        } catch (auditError) {
          console.error('记录审计日志失败:', auditError);
        }
      }

      // 2. 获取所有本地数据进行同步
      setStatus('正在同步数据...');
      const allData = await apiClient.fetchAll();
      const syncResults: Record<string, any> = {};

      // 同步每个数据集合
      for (const [collection, items] of Object.entries(allData)) {
        if (Array.isArray(items) && items.length > 0) {
          try {
            let successCount = 0;
            for (const item of items) {
              try {
                // 如果项目有ID，尝试更新；否则创建
                if (item.id) {
                  await apiClient.update(collection.replace(/([A-Z])/g, '_$1').toLowerCase(), item.id, item);
                } else {
                  await apiClient.create(collection.replace(/([A-Z])/g, '_$1').toLowerCase(), item);
                }
                successCount++;
              } catch (updateError) {
                console.error(`同步${collection}项目失败:`, updateError);
              }
            }
            syncResults[collection] = {
              total: items.length,
              synced: successCount,
              skipped: items.length - successCount
            };
          } catch (syncError) {
            console.error(`同步集合${collection}失败:`, syncError);
            syncResults[collection] = {
              total: items.length,
              synced: 0,
              error: syncError instanceof Error ? syncError.message : '未知错误'
            };
          }
        }
      }

      // 3. 清理前端缓存
      setStatus('正在清理缓存...');
      localStorage.removeItem('app_data_cache');
      localStorage.removeItem('app_data_cache_timestamp');
      
      // 4. 返回结果
      let resultMessage = "数据同步完成！\n\n";
      for (const [collection, result] of Object.entries(syncResults)) {
        if (result.error) {
          resultMessage += `${collection}: 同步失败 - ${result.error}\n`;
        } else {
          resultMessage += `${collection}: ${result.synced}/${result.total} 项已同步\n`;
        }
      }

      setStatus('同步完成');
      return {
        success: true,
        message: resultMessage,
        snapshotId: snapshotResult.success ? snapshotResult.id : undefined,
        syncResults
      };
    } catch (error) {
      console.error('数据同步过程中发生错误:', error);
      setStatus('同步失败');
      return {
        success: false,
        message: `数据同步过程中发生错误: ${error.message}`
      };
    } finally {
      setLoading(false);
    }
  };

  // 执行数据恢复
  const performRestore = async (snapshotId: string): Promise<CloudSyncResult> => {
    setLoading(true);
    setStatus('开始恢复...');
    
    try {
      // 验证快照ID
      if (!snapshotId) {
        return {
          success: false,
          message: '快照ID是必需的'
        };
      }

      // 执行恢复操作
      setStatus('正在从快照恢复数据...');
      const result = await apiClient.post('/snapshot', {
        action: 'restore',
        snapshotId: snapshotId
      });

      if (!result.success) {
        return {
          success: false,
          message: `恢复失败: ${result.message}`
        };
      }

      // 记录审计日志
      try {
        await apiClient.post('/audit-log', {
          action: 'snapshot_restore',
          userId: 'system',
          snapshotId: snapshotId,
          details: {
            snapshotId: snapshotId,
            restoredAt: new Date().toISOString(),
            restoredBy: 'cloud_restore_hook'
          }
        });
      } catch (auditError) {
        console.error('记录审计日志失败:', auditError);
      }

      // 清理前端缓存以确保显示最新数据
      setStatus('正在清理缓存...');
      localStorage.removeItem('app_data_cache');
      localStorage.removeItem('app_data_cache_timestamp');
      
      // 刷新页面以确保所有组件获取最新数据
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      setStatus('恢复完成');
      return {
        success: true,
        message: `快照已恢复: ${result.id}`,
        snapshotId: result.id
      };
    } catch (error) {
      console.error('数据恢复过程中发生错误:', error);
      setStatus('恢复失败');
      return {
        success: false,
        message: `数据恢复过程中发生错误: ${error.message}`
      };
    } finally {
      setLoading(false);
    }
  };

  // 执行数据备份
  const performBackup = async (): Promise<CloudSyncResult> => {
    setLoading(true);
    setStatus('开始备份...');
    
    try {
      // 获取当前系统数据
      setStatus('正在收集数据...');
      const hotelRooms = await apiClient.fetchCollection('hotel_rooms');
      const dishes = await apiClient.fetchCollection('dishes');
      const orders = await apiClient.fetchCollection('orders');
      const expenses = await apiClient.fetchCollection('expenses');
      const inventory = await apiClient.fetchCollection('inventory');
      const ktvRooms = await apiClient.fetchCollection('ktv_rooms');
      const signBillAccounts = await apiClient.fetchCollection('sign_bill_accounts');
      const paymentMethods = await apiClient.fetchCollection('payment_methods');

      // 创建快照数据
      const snapshotData = {
        data: {
          hotel_rooms: hotelRooms,
          dishes: dishes,
          orders: orders,
          expenses: expenses,
          inventory: inventory,
          ktv_rooms: ktvRooms,
          sign_bill_accounts: signBillAccounts,
          payment_methods: paymentMethods,
        },
        description: `云端数据备份 ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        backupType: 'full',
        gitCommitHash: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
      };

      // 发送快照请求
      setStatus('正在创建备份...');
      const result = await apiClient.post('/snapshot', {
        action: 'create',
        snapshot: snapshotData
      });

      if (result.success) {
        // 记录审计日志
        try {
          await apiClient.post('/audit-log', {
            action: 'data_backup',
            userId: 'system',
            snapshotId: result.id,
            details: {
              backupType: 'full',
              backupSize: Object.keys(snapshotData.data).length,
              createdAt: new Date().toISOString()
            }
          });
        } catch (auditError) {
          console.error('记录审计日志失败:', auditError);
        }

        setStatus('备份完成');
        return {
          success: true,
          message: `云端数据备份成功！\n${result.message}\n备份ID: ${result.id}`,
          snapshotId: result.id
        };
      } else {
        return {
          success: false,
          message: `备份失败: ${result.message}`
        };
      }
    } catch (error) {
      console.error('数据备份过程中发生错误:', error);
      setStatus('备份失败');
      return {
        success: false,
        message: `数据备份过程中发生错误: ${error.message}`
      };
    } finally {
      setLoading(false);
    }
  };

  // 检查云端状态
  const checkCloudStatus = async (): Promise<CloudSyncResult> => {
    setLoading(true);
    setStatus('检查云端状态...');
    
    try {
      // 检查各种云端服务状态
      const [dbStatus, apiHealth] = await Promise.allSettled([
        fetch('/api/db-status').then(r => r.json()),
        fetch('/api/health').then(r => r.json()).catch(() => ({ success: false, message: '健康检查端点不存在' }))
      ]);

      let statusMessage = "云端服务状态：\n\n";
      if (dbStatus.status === 'fulfilled') {
        statusMessage += `数据库: ${dbStatus.value.success ? '正常' : '异常'}\n`;
        statusMessage += `类型: ${dbStatus.value.connectionStatus?.type || '未知'}\n`;
      } else {
        statusMessage += "数据库: 连接失败\n";
      }
      if (apiHealth.status === 'fulfilled') {
        statusMessage += `API健康: ${apiHealth.value.success ? '正常' : '异常'}\n`;
      } else {
        statusMessage += "API健康: 未配置\n";
      }

      // 检查数据量
      const collections = ['hotel_rooms', 'dishes', 'orders'];
      for (const collection of collections) {
        try {
          const data = await apiClient.fetchCollection(collection);
          statusMessage += `${collection}: ${data.length} 条记录\n`;
        } catch (e) {
          statusMessage += `${collection}: 检查失败\n`;
        }
      }

      setStatus('状态检查完成');
      return {
        success: true,
        message: statusMessage
      };
    } catch (error) {
      console.error('状态检查过程中发生错误:', error);
      setStatus('状态检查失败');
      return {
        success: false,
        message: `状态检查过程中发生错误: ${error.message}`
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    performSecureSync,
    performRestore,
    performBackup,
    checkCloudStatus,
    loading,
    status
  };
};