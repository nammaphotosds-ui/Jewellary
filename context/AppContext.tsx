import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
// FIX: Imported `BillType` as a value to allow its use at runtime, as it's an enum.
import { BillType } from '../types';
import type { JewelryItem, Customer, Bill, GoogleTokenResponse } from '../types';
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
  resetTransactions: () => Promise<void>;
  setRevenue: (newTotal: number) => Promise<void>;
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
  const isInitialLoad = useRef(true);

  // Centralized data saving effect
  useEffect(() => {
    // Do not save on the initial data load from Drive to prevent an unnecessary write operation.
    if (isInitialLoad.current) {
        return;
    }

    const saveDataToDrive = async () => {
        if (!isAuthenticated || !driveFileId || !tokenResponse) {
            console.log("Save skipped: Not authenticated or file ID not available.");
            return;
        }
        try {
            await drive.updateFile(tokenResponse.access_token, driveFileId, { inventory, customers, bills });
        } catch(e) {
            console.error("Failed to save data to drive", e);
            setError("Failed to save data. Please check your connection and try again.");
        }
    };
    
    saveDataToDrive();
  }, [inventory, customers, bills, isAuthenticated, driveFileId, tokenResponse]);

  useEffect(() => {
    const init = async () => {
        isInitialLoad.current = true; // Mark the beginning of a load sequence
        setIsInitialized(false);
        setError(null);

        if (!tokenResponse || !tokenResponse.expires_at || tokenResponse.expires_at < Date.now()) {
            setIsAuthenticated(false);
            setIsInitialized(true);
            isInitialLoad.current = false; // End of load sequence
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
            // Once initialization is complete and data is loaded, allow subsequent changes to be saved.
            setTimeout(() => { isInitialLoad.current = false; }, 500);
        }
    };
    init();
  }, [tokenResponse]);

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

    setInventory(prev => [...prev, newItem]);
  };
  
  const deleteInventoryItem = async (itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'joinDate' | 'pendingBalance'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: getNextCustomerId(),
      joinDate: new Date().toISOString(),
      pendingBalance: 0,
    };
    setCustomers(prev => [...prev, newCustomer]);
  };
  
  const deleteCustomer = async (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    setBills(prev => prev.filter(b => b.customerId !== customerId));
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

    let newPendingBalance = updatedBills
        .filter(b => b.customerId === customerId)
        .reduce((sum, b) => sum + b.balance, 0);
        
    newPendingBalance = parseFloat(newPendingBalance.toFixed(2));

    // If the remaining total balance is negligible, clear it out.
    if (newPendingBalance > 0 && newPendingBalance < 1) {
        let amountToClear = newPendingBalance;
        // Find bills with balance and clear them, starting from the most recent.
        for (let i = updatedBills.length - 1; i >= 0; i--) {
            if (updatedBills[i].customerId === customerId && updatedBills[i].balance > 0) {
                if (amountToClear <= 0) break;

                const adjustment = Math.min(amountToClear, updatedBills[i].balance);
                updatedBills[i].amountPaid += adjustment;
                updatedBills[i].balance -= adjustment;
                amountToClear -= adjustment;
            }
        }
        newPendingBalance = 0; // After clearing, the balance is zero
    }


    const updatedCustomer = { ...customer, pendingBalance: newPendingBalance };
    
    setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
    setBills(updatedBills);
  };

  const createBill = async (billData: Omit<Bill, 'id' | 'balance' | 'date' | 'customerName' | 'finalAmount' | 'netWeight' | 'extraChargeAmount' | 'grandTotal'>): Promise<Bill> => {
    const totalGrossWeight = billData.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    const subtotalBeforeLessWeight = billData.totalAmount; 

    const averageRatePerGram = totalGrossWeight > 0 ? subtotalBeforeLessWeight / totalGrossWeight : 0;
    const lessWeightValue = billData.lessWeight * averageRatePerGram;

    const actualSubtotal = subtotalBeforeLessWeight - lessWeightValue;

    const extraChargeAmount = actualSubtotal * (billData.extraChargePercentage / 100);
    const grandTotal = actualSubtotal + extraChargeAmount - billData.bargainedAmount;
    
    let finalAmountPaid = billData.amountPaid;
    let balance = grandTotal - finalAmountPaid;

    // If the remaining balance is negligible, treat it as fully paid.
    if (balance > 0 && balance < 1) {
        finalAmountPaid += balance; // Consider the tiny balance as paid
        balance = 0; // The bill is now fully paid
    }
    balance = parseFloat(balance.toFixed(2));
    
    const netWeight = totalGrossWeight - billData.lessWeight;

    const customer = customers.find(c => c.id === billData.customerId);
    if(!customer) throw new Error("Customer not found");

    const newBill: Bill = {
      ...billData,
      id: `BILL-${Date.now()}`,
      customerName: customer.name,
      finalAmount: actualSubtotal,
      netWeight,
      extraChargeAmount,
      grandTotal,
      amountPaid: finalAmountPaid,
      balance,
      date: new Date().toISOString(),
    };
    
    const updatedCustomer = {
        ...customer,
        pendingBalance: parseFloat((customer.pendingBalance + balance).toFixed(2))
    };

    if (billData.type === 'INVOICE') {
        // FIX: Explicitly set the types for the Map to prevent TypeScript from inferring `item` as `unknown`.
        const inventoryMap = new Map<string, JewelryItem>(inventory.map(i => [i.id, i]));
        for (const billItem of billData.items) {
            const item = inventoryMap.get(billItem.itemId);
            if (item) {
                const updatedItem = { ...item, quantity: Math.max(0, item.quantity - billItem.quantity) };
                inventoryMap.set(item.id, updatedItem);
            }
        }
        setInventory(Array.from(inventoryMap.values()));
    }
    
    setBills(prev => [...prev, newBill]);
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    
    return newBill;
  };
  
  const resetTransactions = async () => {
    setCustomers(prev => prev.map(c => ({ ...c, pendingBalance: 0 })));
    setBills([]);
  };

  const setRevenue = async (newTotal: number) => {
    const currentTotalRevenue = bills.reduce((sum, bill) => sum + bill.amountPaid, 0);
    const adjustmentAmount = newTotal - currentTotalRevenue;

    if (adjustmentAmount === 0) {
      return;
    }

    let adminCustomer = customers.find(c => c.id === 'ADMIN_ADJUSTMENT');
    if (!adminCustomer) {
      adminCustomer = {
        id: 'ADMIN_ADJUSTMENT',
        name: 'Manual Adjustments',
        phone: 'N/A',
        joinDate: new Date().toISOString(),
        pendingBalance: 0,
      };
      setCustomers(prev => [...prev, adminCustomer!]);
    }
    
    const adjustmentBill: Bill = {
      id: `ADJ-${Date.now()}`,
      customerId: adminCustomer.id,
      customerName: adminCustomer.name,
      type: BillType.INVOICE,
      items: [{
          itemId: 'ADJUSTMENT',
          name: adjustmentAmount > 0 ? 'Manual Revenue Increase' : 'Manual Revenue Decrease',
          weight: 0,
          price: adjustmentAmount,
          quantity: 1,
      }],
      totalAmount: adjustmentAmount,
      bargainedAmount: 0,
      finalAmount: adjustmentAmount,
      lessWeight: 0,
      netWeight: 0,
      extraChargePercentage: 0,
      extraChargeAmount: 0,
      grandTotal: adjustmentAmount,
      amountPaid: adjustmentAmount,
      balance: 0,
      date: new Date().toISOString(),
    };
    
    setBills(prev => [...prev, adjustmentBill]);
  };

  const getCustomerById = (id: string) => customers.find(c => c.id === id);
  const getBillsByCustomerId = (id: string) => bills.filter(b => b.customerId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getInventoryItemById = (id: string) => inventory.find(i => i.id === id);

  return (
    <AppContext.Provider value={{ isInitialized, isAuthenticated, error, inventory, customers, bills, addInventoryItem, deleteInventoryItem, addCustomer, deleteCustomer, createBill, getCustomerById, getBillsByCustomerId, getInventoryItemById, getNextCustomerId, recordPayment, resetTransactions, setRevenue }}>
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