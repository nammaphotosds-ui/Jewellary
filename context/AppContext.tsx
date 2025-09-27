import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { JewelryItem, Customer, Bill, BillType, JewelryCategory } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface AppContextType {
  inventory: JewelryItem[];
  customers: Customer[];
  bills: Bill[];
  addInventoryItem: (item: Omit<JewelryItem, 'id' | 'serialNo' | 'dateAdded'>) => void;
  deleteInventoryItem: (itemId: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'joinDate' | 'pendingBalance'>) => void;
  createBill: (bill: Omit<Bill, 'id' | 'balance' | 'date' | 'customerName' | 'finalAmount'>) => Bill;
  getCustomerById: (id: string) => Customer | undefined;
  getBillsByCustomerId: (id: string) => Bill[];
  getInventoryItemById: (id: string) => JewelryItem | undefined;
  getNextCustomerId: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useLocalStorage<JewelryItem[]>('inventory', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', []);
  
  const getNextCustomerId = () => {
    const totalCustomers = customers.length;
    const numPart = (totalCustomers % 9) + 1;
    const charPartIndex = Math.floor(totalCustomers / 9);
    const firstChar = String.fromCharCode(65 + Math.floor(charPartIndex / 26));
    const secondChar = String.fromCharCode(65 + (charPartIndex % 26));
    return `${firstChar}${secondChar}${numPart}`;
  };

  const addInventoryItem = (item: Omit<JewelryItem, 'id' | 'serialNo' | 'dateAdded'>) => {
    const categoryItems = inventory.filter(i => i.category === item.category);
    const maxSerial = Math.max(0, ...categoryItems.map(i => parseInt(i.serialNo, 10)));
    const newSerialNo = (maxSerial + 1).toString().padStart(3, '0');

    const newItem: JewelryItem = {
      ...item,
      id: `ITEM-${Date.now()}`,
      serialNo: newSerialNo,
      dateAdded: new Date().toISOString(),
    };
    setInventory(prev => [...prev, newItem]);
  };
  
  const deleteInventoryItem = (itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'joinDate' | 'pendingBalance'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: getNextCustomerId(),
      joinDate: new Date().toISOString(),
      pendingBalance: 0,
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const createBill = (billData: Omit<Bill, 'id' | 'balance' | 'date' | 'customerName' | 'finalAmount'>): Bill => {
    const finalAmount = billData.totalAmount - billData.bargainedAmount;
    const balance = finalAmount - billData.amountPaid;
    const customer = customers.find(c => c.id === billData.customerId);
    if(!customer) throw new Error("Customer not found");

    const newBill: Bill = {
      ...billData,
      id: `BILL-${Date.now()}`,
      customerName: customer.name,
      finalAmount,
      balance,
      date: new Date().toISOString(),
    };
    
    setBills(prev => [...prev, newBill]);
    
    setCustomers(prev => prev.map(c => 
        c.id === billData.customerId 
        ? { ...c, pendingBalance: c.pendingBalance + balance } 
        : c
    ));

    if (billData.type === 'INVOICE') {
      setInventory(prev => prev.map(item => {
        const itemsToDecrement = billData.items.filter(billItem => billItem.itemId === item.id).length;
        if (itemsToDecrement > 0) {
          return { ...item, quantity: Math.max(0, item.quantity - itemsToDecrement) };
        }
        return item;
      }));
    }
    
    return newBill;
  };

  const getCustomerById = (id: string) => customers.find(c => c.id === id);
  const getBillsByCustomerId = (id: string) => bills.filter(b => b.customerId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getInventoryItemById = (id: string) => inventory.find(i => i.id === id);

  return (
    <AppContext.Provider value={{ inventory, customers, bills, addInventoryItem, deleteInventoryItem, addCustomer, createBill, getCustomerById, getBillsByCustomerId, getInventoryItemById, getNextCustomerId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};