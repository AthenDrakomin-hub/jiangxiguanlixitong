import React, { useState, useEffect } from 'react';
import { dbManager } from '../lib/database.js';
import { Dish, Order, Expense, Ingredient, KTVRoom, SignBillAccount, HotelRoom } from '../types.js';

const DataViewer: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [ktvRooms, setKtvRooms] = useState<KTVRoom[]>([]);
  const [signBillAccounts, setSignBillAccounts] = useState<SignBillAccount[]>([]);
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string>('dishes');
  const [snapshots, setSnapshots] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!dbManager.isInitialized()) {
      console.error('Database not initialized');
      setLoading(false);
      return;
    }

    try {
      const database = dbManager.getDatabase();
      
      // Fetch all data
      const [
        dishesData,
        ordersData,
        expensesData,
        inventoryData,
        ktvRoomsData,
        signBillAccountsData,
        hotelRoomsData
      ] = await Promise.all([
        database.getAll<Dish>('dishes'),
        database.getAll<Order>('orders'),
        database.getAll<Expense>('expenses'),
        database.getAll<Ingredient>('inventory'),
        database.getAll<KTVRoom>('ktv_rooms'),
        database.getAll<SignBillAccount>('sign_bill_accounts'),
        database.getAll<HotelRoom>('hotel_rooms')
      ]);

      setDishes(dishesData);
      setOrders(ordersData);
      setExpenses(expensesData);
      setInventory(inventoryData);
      setKtvRooms(ktvRoomsData);
      setSignBillAccounts(signBillAccountsData);
      setHotelRooms(hotelRoomsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetchData();
  };

  const createSnapshot = () => {
    if (!dbManager.isInitialized()) {
      console.error('Database not initialized');
      return;
    }

    // Get the underlying MemoryDatabase instance to access its store
    
    // We'll create a snapshot by getting all data from the database
    const snapshot = {
      timestamp: new Date().toISOString(),
      dishes: dishes.length,
      orders: orders.length,
      expenses: expenses.length,
      inventory: inventory.length,
      ktv_rooms: ktvRooms.length,
      sign_bill_accounts: signBillAccounts.length,
      hotel_rooms: hotelRooms.length,
      // Store a representation of the entire database state
      fullState: {
        dishes: dishes,
        orders: orders,
        expenses: expenses,
        inventory: inventory,
        ktv_rooms: ktvRooms,
        sign_bill_accounts: signBillAccounts,
        hotel_rooms: hotelRooms
      }
    };

    setSnapshots(prev => [...prev.slice(-4), snapshot]); // Keep only last 5 snapshots
  };

  const exportSnapshot = (snapshot: any) => {
    const dataStr = JSON.stringify(snapshot, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `db-snapshot-${snapshot.timestamp.replace(/[:.]/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderTable = () => {
    switch (selectedTable) {
      case 'dishes':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dishes.map((dish) => (
                  <tr key={dish.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dish.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dish.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dish.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{dish.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dish.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {dish.available ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'orders':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.tableId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{order.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'expenses':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{expense.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'inventory':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity} {item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <div>Select a table to view data</div>;
    }
  };

  const tableCounts = {
    dishes: dishes.length,
    orders: orders.length,
    expenses: expenses.length,
    inventory: inventory.length,
    ktv_rooms: ktvRooms.length,
    sign_bill_accounts: signBillAccounts.length,
    hotel_rooms: hotelRooms.length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Data Viewer</h2>
        <div className="flex space-x-2">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
          <button
            onClick={createSnapshot}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Create Snapshot
          </button>
        </div>
      </div>

      {/* Snapshots Section */}
      {snapshots.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Snapshots</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {snapshots.map((snapshot, index) => (
              <div key={index} className="p-3 bg-white border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(snapshot.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Orders: {snapshot.orders} | Inventory: {snapshot.inventory}
                    </div>
                  </div>
                  <button
                    onClick={() => exportSnapshot(snapshot)}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                  >
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-6">
        {Object.entries(tableCounts).map(([table, count]) => (
          <button
            key={table}
            onClick={() => setSelectedTable(table)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              selectedTable === table
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {table.replace('_', ' ')} ({count})
          </button>
        ))}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {renderTable()}
      </div>
    </div>
  );
};

export default DataViewer;