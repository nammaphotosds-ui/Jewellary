
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { JewelryItem, Customer, Bill, BillType, GoogleTokenResponse } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import * as drive from '../utils/googleDrive';

interface AppContextType {
  inventory: JewelryItem[];
  customers: Customer[];
  bills: Bill[];
  addInventoryItem: (item: Omit<JewelryItem, 'id' | 'serialNo' | 'dateAdded'>) => Promise<void>;
  deleteInventoryItem: (itemId: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'joinDate' | 'pendingBalance'>) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  createBill: (bill: Omit<Bill, 'id' | 'balance' | 'date' | 'customerName' | 'finalAmount' | 'netWeight' | 'extraChargeAmount' | 'grandTotal'>) => Promise<Bill>;
  getCustomerById: (id: string) => Customer | undefined;
  getBillsByCustomerId: (id: string) => Bill[];
  getInventoryItemById: (id: string) => JewelryItem | undefined;
  getNextCustomerId: () => string;
  isInitialized: boolean;
  isAuthenticated: boolean;
  error: string | null;
  recordPayment: (customerId: string, amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<JewelryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  const [tokenResponse] = useLocalStorage<GoogleTokenResponse | null>('googleTokenResponse', null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
        setIsInitialized(false);
        setError(null);

        if (!tokenResponse || !tokenResponse.expires_at || tokenResponse.expires_at < Date.now()) {
            setIsAuthenticated(false);
            setIsInitialized(true);
            return;
        }

        setIsAuthenticated(true);

        try {
            const fileId = await drive.getFileId(tokenResponse.access_token);
            if (fileId) {
                const content = await drive.getFileContent(tokenResponse.access_token, fileId);
                setInventory(content.inventory || []);
                setCustomers(content.customers || []);
                setBills(content.bills || []);
                setDriveFileId(fileId);
            } else {
                const initialState = { inventory: [], customers: [], bills: [] };
                const newFileId = await drive.createFile(tokenResponse.access_token, initialState);
                setDriveFileId(newFileId);
                setInventory([]);
                setCustomers([]);
                setBills([]);
            }
        } catch (e: any) {
            console.error("Google Drive initialization failed", e);
            setError("Failed to connect to Google Drive. The token might be invalid. Please try reconnecting from the Settings page.");
            setIsAuthenticated(false);
        } finally {
            setIsInitialized(true);
        }
    };
    init();
  }, [tokenResponse]);
  
  const saveDataToDrive = async (data: { inventory: JewelryItem[], customers: Customer[], bills: Bill[] }) => {
    if (!isAuthenticated || !driveFileId || !tokenResponse) {
        setError("Not connected to Google Drive. Please reconnect in Settings.");
        return;
    }
    try {
        await drive.updateFile(tokenResponse.access_token, driveFileId, data);
    } catch(e) {
        console.error("Failed to save data to drive", e);
        setError("Failed to save data. Please check your connection and try again.");
    }
  };

  const getNextCustomerId = () => {
    const totalCustomers = customers.length;
    const numPart = (totalCustomers % 9) + 1;
    const charPartIndex = Math.floor(totalCustomers / 9);
    const firstChar = String.fromCharCode(65 + Math.floor(charPartIndex / 26));
    const secondChar = String.fromCharCode(65 + (charPartIndex % 26));
    return `${firstChar}${secondChar}${numPart}`;
  };

  const addInventoryItem = async (item: Omit<JewelryItem, 'id' | 'serialNo' | 'dateAdded'>) => {
    const categoryItems = inventory.filter(i => i.category === item.category);
    const maxSerial = Math.max(0, ...categoryItems.map(i => parseInt(i.serialNo, 10)));
    const newSerialNo = (maxSerial + 1).toString().padStart(3, '0');

    const newItem: JewelryItem = {
      ...item,
      id: `ITEM-${Date.now()}`,
      serialNo: newSerialNo,
      dateAdded: new Date().toISOString(),
    };

    const newInventory = [...inventory, newItem];
    setInventory(newInventory);
    await saveDataToDrive({ inventory: newInventory, customers, bills });
  };
  
  const deleteInventoryItem = async (itemId: string) => {
    const newInventory = inventory.filter(item => item.id !== itemId);
    setInventory(newInventory);
    await saveDataToDrive({ inventory: newInventory, customers, bills });
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'joinDate' | 'pendingBalance'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: getNextCustomerId(),
      joinDate: new Date().toISOString(),
      pendingBalance: 0,
    };
    const newCustomers = [...customers, newCustomer];
    setCustomers(newCustomers);
    await saveDataToDrive({ inventory, customers: newCustomers, bills });
  };
  
  const deleteCustomer = async (customerId: string) => {
    const newCustomers = customers.filter(c => c.id !== customerId);
    const newBills = bills.filter(b => b.customerId !== customerId);

    setCustomers(newCustomers);
    setBills(newBills);
    await saveDataToDrive({ inventory, customers: newCustomers, bills: newBills });
  };

  const recordPayment = async (customerId: string, paymentAmount: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || paymentAmount <= 0) return;

    const unpaidBills = bills
        .filter(b => b.customerId === customerId && b.balance > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let remainingPayment = paymentAmount;
    const updatedBills = [...bills];

    for (const bill of unpaidBills) {
        if (remainingPayment <= 0) break;
        const billIndex = updatedBills.findIndex(b => b.id === bill.id);
        if (billIndex === -1) continue;

        const paymentForThisBill = Math.min(remainingPayment, bill.balance);
        const currentBill = updatedBills[billIndex];
        
        const updatedBill = {
            ...currentBill,
            amountPaid: currentBill.amountPaid + paymentForThisBill,
            balance: currentBill.balance - paymentForThisBill,
        };

        updatedBills[billIndex] = updatedBill;
        remainingPayment -= paymentForThisBill;
    }

    const newPendingBalance = updatedBills
        .filter(b => b.customerId === customerId)
        .reduce((sum, b) => sum + b.balance, 0);

    const updatedCustomer = { ...customer, pendingBalance: newPendingBalance };
    const newCustomers = customers.map(c => c.id === customerId ? updatedCustomer : c);

    setCustomers(newCustomers);
    setBills(updatedBills);
    await saveDataToDrive({ inventory, customers: newCustomers, bills: updatedBills });
  };

  const createBill = async (billData: Omit<Bill, 'id' | 'balance' | 'date' | 'customerName' | 'finalAmount' | 'netWeight' | 'extraChargeAmount' | 'grandTotal'>): Promise<Bill> => {
    const finalAmount = billData.totalAmount - billData.bargainedAmount;
    const extraChargeAmount = finalAmount * (billData.extraChargePercentage / 100);
    const grandTotal = finalAmount + extraChargeAmount;
    const balance = grandTotal - billData.amountPaid;
    
    const totalWeight = billData.items.reduce((sum, item) => sum + item.weight, 0);
    const netWeight = totalWeight - billData.lessWeight;

    const customer = customers.find(c => c.id === billData.customerId);
    if(!customer) throw new Error("Customer not found");

    const newBill: Bill = {
      ...billData,
      id: `BILL-${Date.now()}`,
      customerName: customer.name,
      finalAmount,
      netWeight,
      extraChargeAmount,
      grandTotal,
      balance,
      date: new Date().toISOString(),
    };
    
    const updatedCustomer = {
        ...customer,
        pendingBalance: customer.pendingBalance + balance
    };

    let updatedInventoryState = [...inventory];
    if (billData.type === 'INVOICE') {
      const inventoryMap = new Map(inventory.map(i => [i.id, i]));
      for (const billItem of billData.items) {
          const item = inventoryMap.get(billItem.itemId) as JewelryItem;
          if (item) {
              const updatedItem = { ...item, quantity: Math.max(0, item.quantity - 1) };
              inventoryMap.set(item.id, updatedItem);
          }
      }
      updatedInventoryState = Array.from(inventoryMap.values());
    }
    
    const newBills = [...bills, newBill];
    const newCustomers = customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
    
    setBills(newBills);
    setCustomers(newCustomers);
    setInventory(updatedInventoryState);

    await saveDataToDrive({ inventory: updatedInventoryState, customers: newCustomers, bills: newBills });
    
    return newBill;
  };

  const getCustomerById = (id: string) => customers.find(c => c.id === id);
  const getBillsByCustomerId = (id: string) => bills.filter(b => b.customerId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getInventoryItemById = (id: string) => inventory.find(i => i.id === id);

  return (
    <AppContext.Provider value={{ isInitialized, isAuthenticated, error, inventory, customers, bills, addInventoryItem, deleteInventoryItem, addCustomer, deleteCustomer, createBill, getCustomerById, getBillsByCustomerId, getInventoryItemById, getNextCustomerId, recordPayment }}>
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
