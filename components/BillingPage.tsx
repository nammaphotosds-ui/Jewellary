
import React, { useState, useMemo, useRef } from 'react';
// FIX: Import ReactDOM to fix 'Cannot find name ReactDOM' error.
import ReactDOM from 'react-dom/client';
import { useAppContext } from '../context/AppContext';
import { BillType, Page } from '../types';
import type { JewelryItem, BillItem, Customer, Bill } from '../types';
import Logo from './Logo';

// This is the template that will be rendered for PDF generation
const InvoiceTemplate: React.FC<{bill: Bill, customer: Customer}> = ({bill, customer}) => {
    const totalWeight = bill.items.reduce((sum, item) => sum + item.weight, 0);
    return (
        <div className="p-12 text-gray-800 bg-white" style={{width: '1123px', height: '794px', display: 'flex', flexDirection: 'column'}}>
             <header className="flex justify-between items-start border-b-2 border-brand-gold pb-4">
                <div className="flex items-center">
                    <img src="https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163" alt="Logo" className="w-20 h-20 object-contain mr-4" />
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-brand-gold-dark">DEVAGIRIKAR JEWELLERYS</h1>
                        <p className="font-semibold text-gray-700">EXCLUSIVE JEWELLERY SHOWROOM</p>
                        <p className="text-sm text-gray-600">1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot.</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-serif font-bold uppercase text-brand-charcoal-light">{bill.type}</h2>
                    <p><strong>Bill No:</strong> {bill.id}</p>
                    <p><strong>Date:</strong> {new Date(bill.date).toLocaleDateString()}</p>
                </div>
            </header>

            <div className="flex justify-between mt-6">
                <div>
                    <h3 className="font-bold text-lg mb-2">Billed To:</h3>
                    <p>{customer.name}</p>
                    <p>{customer.phone}</p>
                    <p>Customer ID: {customer.id}</p>
                </div>
                 <div className="text-right text-sm">
                    <p><strong>GSTIN:</strong> 29BSWPD7616JZ0</p>
                    <p><strong>Phone:</strong> 9008604004 / 8618748300</p>
                </div>
            </div>

            <main className="flex-1 mt-6">
                 <table className="w-full text-left">
                    <thead className="bg-brand-charcoal text-white">
                        <tr>
                            <th className="p-3">Item Name</th>
                            <th className="p-3 text-right">Weight (g)</th>
                            <th className="p-3 text-right">Price (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map(item => (
                            <tr key={item.itemId} className="border-b">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3 text-right">{item.weight.toFixed(3)}</td>
                                <td className="p-3 text-right">{item.price.toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
            
            <footer className="flex justify-end mt-4">
                <div className="w-2/5">
                    <div className="flex justify-between py-1"><span>Total Gross Weight:</span><span>{totalWeight.toFixed(3)} g</span></div>
                    <div className="flex justify-between py-1 text-blue-600"><span>Less Weight:</span><span>- {bill.lessWeight.toFixed(3)} g</span></div>
                    <div className="flex justify-between py-1 font-bold border-t mt-1 pt-1"><span>Net Weight:</span><span>{bill.netWeight.toFixed(3)} g</span></div>
                    <hr className="my-2"/>
                    <div className="flex justify-between py-1"><span>Subtotal:</span><span>₹{bill.totalAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between py-1 text-green-600"><span>Discount:</span><span>- ₹{bill.bargainedAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between py-1 font-bold"><span>Amount:</span><span>₹{bill.finalAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between py-1 text-orange-600"><span>Making Charges ({bill.makingChargePercentage}%):</span><span>+ ₹{bill.makingChargeAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between py-2 font-bold text-xl border-t-2 border-b-2 border-brand-charcoal my-2"><span>Grand Total:</span><span>₹{bill.grandTotal.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between py-1 text-green-600 font-semibold"><span>Amount Paid:</span><span>₹{bill.amountPaid.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between py-1 text-red-600 font-semibold"><span>Balance Due:</span><span>₹{bill.balance.toLocaleString('en-IN')}</span></div>
                </div>
            </footer>
             <div className="text-center text-xs text-gray-500 mt-6">
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
  const [lessWeight, setLessWeight] = useState('');
  const [makingChargePercentage, setMakingChargePercentage] = useState('');

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

  const calculations = useMemo(() => {
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const finalAmount = totalAmount - (parseFloat(bargainedAmount) || 0);
    const makingChargeAmount = finalAmount * ((parseFloat(makingChargePercentage) || 0) / 100);
    const grandTotal = finalAmount + makingChargeAmount;
    const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
    const netWeight = totalWeight - (parseFloat(lessWeight) || 0);

    return { totalAmount, finalAmount, makingChargeAmount, grandTotal, totalWeight, netWeight };
  }, [selectedItems, bargainedAmount, makingChargePercentage, lessWeight]);

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

    const bill = await createBill({
      customerId: selectedCustomerId,
      type: billType,
      items: selectedItems,
      totalAmount: calculations.totalAmount,
      bargainedAmount: parseFloat(bargainedAmount) || 0,
      lessWeight: parseFloat(lessWeight) || 0,
      makingChargePercentage: parseFloat(makingChargePercentage) || 0,
      amountPaid: parseFloat(amountPaid) || 0,
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
    setLessWeight('');
    setMakingChargePercentage('');
    setBillType(BillType.ESTIMATE);
    alert('Bill created successfully!');
  };

  return (
    <div>
      <h1 className="text-4xl font-serif font-bold text-brand-charcoal mb-8">Create Bill</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Customer and Item Selection */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-bold">1. Customer & Items</h2>
            <div>
                <label className="block text-sm font-medium mb-1">Search & Select Customer</label>
                <input type="text" placeholder="Search by name or ID..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="w-full p-2 border rounded mb-2"/>
                <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="w-full p-2 border rounded" required>
                    <option value="" disabled>-- Select a customer --</option>
                    {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">Search & Add Items</label>
                <input type="text" placeholder="Search by name or serial no..." value={itemSearch} onChange={e => setItemSearch(e.target.value)} className="w-full p-2 border rounded mb-2"/>
                <select onChange={e => handleAddItem(e.target.value)} value="" className="w-full p-2 border rounded">
                    <option value="" disabled>-- Select an item --</option>
                    {filteredAvailableInventory.map(item => <option key={item.id} value={item.id}>{item.name} ({item.serialNo}) - ₹{item.price}</option>)}
                </select>
            </div>
            <div className="mt-4 max-h-64 overflow-y-auto">
                 {selectedItems.map(item => (
                    <div key={item.itemId} className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2">
                        <div>{item.name} <span className="text-xs text-gray-500">({item.weight.toFixed(3)}g)</span></div>
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
                <div className="space-y-2 text-sm border-b pb-4">
                     <div className="flex justify-between font-semibold"><span>Total Gross Wt:</span><span>{calculations.totalWeight.toFixed(3)} g</span></div>
                     <div className="flex justify-between"><span>Less Weight:</span><span>- {(parseFloat(lessWeight) || 0).toFixed(3)} g</span></div>
                     <div className="flex justify-between font-bold text-base border-t pt-1 mt-1"><span>Net Weight:</span><span>{calculations.netWeight.toFixed(3)} g</span></div>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₹{calculations.totalAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Discount:</span><span className="text-green-600">- ₹{(parseFloat(bargainedAmount) || 0).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between font-semibold"><span>Amount:</span><span>₹{calculations.finalAmount.toLocaleString('en-IN')}</span></div>
                     <div className="flex justify-between"><span>Making Charges ({(parseFloat(makingChargePercentage) || 0)}%):</span><span className="text-orange-600">+ ₹{calculations.makingChargeAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Grand Total:</span><span className="text-brand-gold-dark">₹{calculations.grandTotal.toLocaleString('en-IN')}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">Less Weight (g)</label><input type="number" step="0.001" value={lessWeight} onChange={e => setLessWeight(e.target.value)} className="w-full p-2 border rounded" placeholder="0.000"/></div>
                    <div><label className="block text-sm font-medium">Discount (₹)</label><input type="number" value={bargainedAmount} onChange={e => setBargainedAmount(e.target.value)} className="w-full p-2 border rounded" placeholder="0.00"/></div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">Making Charge (%)</label><input type="number" value={makingChargePercentage} onChange={e => setMakingChargePercentage(e.target.value)} className="w-full p-2 border rounded" placeholder="0"/></div>
                    <div><label className="block text-sm font-medium">Amount Paid (₹)</label><input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className="w-full p-2 border rounded" placeholder="0.00"/></div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Bill Type</label>
                    <div className="flex gap-4"><label className="flex items-center"><input type="radio" name="billType" value={BillType.ESTIMATE} checked={billType === BillType.ESTIMATE} onChange={() => setBillType(BillType.ESTIMATE)} className="mr-2"/> Estimate</label><label className="flex items-center"><input type="radio" name="billType" value={BillType.INVOICE} checked={billType === BillType.INVOICE} onChange={() => setBillType(BillType.INVOICE)} className="mr-2"/> Invoice</label></div>
                    <p className="text-xs text-gray-500 mt-1">An 'Invoice' will deduct items from inventory. An 'Estimate' will not.</p>
                </div>
                <button type="submit" disabled={isGeneratingPdf} className="w-full bg-brand-gold text-brand-charcoal p-3 rounded-lg font-semibold hover:bg-brand-gold-dark transition disabled:bg-gray-400">
                    {isGeneratingPdf ? 'Generating PDF...' : 'Create Bill & Generate PDF'}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default BillingPage;
