
import React, { useState, useMemo, useRef } from 'react';
// FIX: Import ReactDOM to fix 'Cannot find name ReactDOM' error.
import ReactDOM from 'react-dom/client';
import { useAppContext } from '../context/AppContext';
import { BillType, Page } from '../types';
import type { JewelryItem, BillItem, Customer, Bill } from '../types';
import Logo from './Logo';

// This is the template that will be rendered for PDF generation
const InvoiceTemplate: React.FC<{bill: Bill, customer: Customer}> = ({bill, customer}) => {
    return (
        <div className="p-12 text-gray-800 bg-white" style={{width: '1123px', height: '794px'}}>
             <div className="flex justify-between items-center border-b-2 border-brand-gold pb-4">
                <div>
                    <Logo className="text-brand-dark" simple={true}/>
                    <p className="text-sm text-gray-600 mt-1">Jewelry store in Ilkal, Karnataka</p>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-serif font-bold uppercase text-brand-gold-dark">{bill.type}</h2>
                    <p><strong>Bill No:</strong> {bill.id}</p>
                    <p><strong>Date:</strong> {new Date(bill.date).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <div>
                    <h3 className="font-bold text-lg mb-2">Billed To:</h3>
                    <p>{customer.name}</p>
                    <p>{customer.phone}</p>
                    <p>Customer ID: {customer.id}</p>
                </div>
                {customer.photoUrl && (
                    <img src={customer.photoUrl} alt={customer.name} className="w-24 h-24 rounded-lg object-cover border-2 border-brand-gold-light" />
                )}
                 <div className="text-right">
                    <h3 className="font-bold text-lg mb-2">Devagirikar Jewellers</h3>
                    <p>Main Bazaar, Ilkal</p>
                    <p>Karnataka, India</p>
                </div>
            </div>

            <table className="w-full mt-8 text-left">
                <thead className="bg-brand-dark text-white">
                    <tr>
                        <th className="p-3 w-20">Image</th>
                        <th className="p-3">Item Name</th>
                        <th className="p-3">Weight (g)</th>
                        <th className="p-3 text-right">Price (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {bill.items.map(item => (
                        <tr key={item.itemId} className="border-b">
                            <td className="p-2">
                                <img src={item.imageUrl || `https://via.placeholder.com/150/D4AF37/FFFFFF?text=${item.name.charAt(0)}`} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                            </td>
                            <td className="p-3">{item.name}</td>
                            <td className="p-3">{item.weight.toFixed(2)}</td>
                            <td className="p-3 text-right">{item.price.toLocaleString('en-IN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="flex justify-end mt-8">
                <div className="w-1/3">
                    <div className="flex justify-between py-2">
                        <span>Subtotal:</span>
                        <span>₹{bill.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between py-2 text-green-600">
                        <span>Discount:</span>
                        <span>- ₹{bill.bargainedAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-xl border-t-2 border-b-2 border-brand-dark my-2">
                        <span>Final Amount:</span>
                        <span>₹{bill.finalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-2 text-green-600 font-semibold">
                        <span>Amount Paid:</span>
                        <span>₹{bill.amountPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-2 text-red-600 font-semibold">
                        <span>Balance Due:</span>
                        <span>₹{bill.balance.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
             <div className="text-center text-xs text-gray-500 mt-12">
                Thank you for your business!
            </div>
        </div>
    );
};


const BillingPage: React.FC<{setCurrentPage: (page: Page) => void}> = () => {
  const { inventory, customers, createBill, getCustomerById } = useAppContext();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<BillItem[]>([]);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [bargainedAmount, setBargainedAmount] = useState<string>('');
  const [billType, setBillType] = useState<BillType>(BillType.ESTIMATE);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  const filteredCustomers = useMemo(() => {
      if (!customerSearch) return customers;
      return customers.filter(c => 
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.id.toLowerCase().includes(customerSearch.toLowerCase())
      );
  }, [customers, customerSearch]);

  const availableInventory = useMemo(() => {
    return inventory.filter(item => item.quantity > 0 && !selectedItems.some(si => si.itemId === item.id));
  }, [inventory, selectedItems]);
  
  const filteredAvailableInventory = useMemo(() => {
      if (!itemSearch) return availableInventory;
      return availableInventory.filter(i => 
          i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
          i.serialNo.toLowerCase().includes(itemSearch.toLowerCase())
      );
  }, [availableInventory, itemSearch]);

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  }, [selectedItems]);
  
  const finalAmount = useMemo(() => {
    return totalAmount - (parseFloat(bargainedAmount) || 0);
  }, [totalAmount, bargainedAmount]);

  const handleAddItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      setSelectedItems(prev => [...prev, { itemId: item.id, name: item.name, weight: item.weight, price: item.price, imageUrl: item.imageUrl }]);
    }
    setItemSearch('');
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.itemId !== itemId));
  };
  
  const generatePdf = async (bill: Bill, customer: Customer) => {
    setIsGeneratingPdf(true);
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    // @ts-ignore
    const html2canvas = window.html2canvas;

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);
    
    const root = ReactDOM.createRoot(tempContainer);
    root.render(<InvoiceTemplate bill={bill} customer={customer} />);
    
    // Allow content to render
    await new Promise(resolve => setTimeout(resolve, 500));

    const invoiceElement = tempContainer.children[0] as HTMLElement;

    if (invoiceElement) {
        const canvas = await html2canvas(invoiceElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1123, 794]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
        pdf.save(`invoice-${bill.id}.pdf`);
    }

    root.unmount();
    document.body.removeChild(tempContainer);
    setIsGeneratingPdf(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || selectedItems.length === 0) {
        alert("Please select a customer and at least one item.");
        return;
    }

    const paid = parseFloat(amountPaid) || 0;
    const bargained = parseFloat(bargainedAmount) || 0;
    const bill = await createBill({
      customerId: selectedCustomerId,
      type: billType,
      items: selectedItems,
      totalAmount,
      bargainedAmount: bargained,
      amountPaid: paid,
    });
    
    const customer = getCustomerById(selectedCustomerId);
    if (customer) {
        await generatePdf(bill, customer);
    }

    // Reset form
    setSelectedCustomerId('');
    setSelectedItems([]);
    setAmountPaid('');
    setBargainedAmount('');
    setBillType(BillType.ESTIMATE);
    alert('Bill created successfully!');
  };

  return (
    <div>
      <h1 className="text-4xl font-serif font-bold text-brand-dark mb-8">Create Bill</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Customer and Item Selection */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">1. Customer & Items</h2>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Search & Select Customer</label>
                <input 
                    type="text"
                    placeholder="Search by name or ID..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                />
                <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="w-full p-2 border rounded" required>
                    <option value="" disabled>-- Select a customer --</option>
                    {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">Search & Add Items</label>
                <input 
                    type="text"
                    placeholder="Search by name or serial no..."
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                />
                <select onChange={e => handleAddItem(e.target.value)} value="" className="w-full p-2 border rounded">
                    <option value="" disabled>-- Select an item --</option>
                    {filteredAvailableInventory.map(item => <option key={item.id} value={item.id}>{item.name} ({item.serialNo}) - ₹{item.price}</option>)}
                </select>
            </div>
            <div className="mt-4 max-h-64 overflow-y-auto">
                 {selectedItems.map(item => (
                    <div key={item.itemId} className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2">
                        <span>{item.name}</span>
                        <span>₹{item.price.toLocaleString('en-IN')}</span>
                        <button type="button" onClick={() => handleRemoveItem(item.itemId)} className="text-red-500 hover:text-red-700">Remove</button>
                    </div>
                 ))}
            </div>
        </div>

        {/* Right Side: Summary and Payment */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">2. Summary & Payment</h2>
            <div className="space-y-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Discount:</span>
                        <span className="text-green-600">- ₹{(parseFloat(bargainedAmount) || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                        <span>Final Total:</span>
                        <span className="text-brand-gold-dark">₹{finalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Bargained Amount / Discount (₹)</label>
                    <input type="number" value={bargainedAmount} onChange={e => setBargainedAmount(e.target.value)} className="w-full p-2 border rounded" placeholder="0.00"/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Amount Paid (₹)</label>
                    <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className="w-full p-2 border rounded" placeholder="0.00"/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Bill Type</label>
                    <div className="flex gap-4">
                       <label className="flex items-center"><input type="radio" name="billType" value={BillType.ESTIMATE} checked={billType === BillType.ESTIMATE} onChange={() => setBillType(BillType.ESTIMATE)} className="mr-2"/> Estimate</label>
                       <label className="flex items-center"><input type="radio" name="billType" value={BillType.INVOICE} checked={billType === BillType.INVOICE} onChange={() => setBillType(BillType.INVOICE)} className="mr-2"/> Invoice</label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        An 'Invoice' will deduct items from inventory. An 'Estimate' will not.
                    </p>
                </div>
                <button type="submit" disabled={isGeneratingPdf} className="w-full bg-brand-gold text-brand-dark p-3 rounded-lg font-semibold hover:bg-brand-gold-dark transition disabled:bg-gray-400">
                    {isGeneratingPdf ? 'Generating PDF...' : 'Create Bill & Generate PDF'}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default BillingPage;
