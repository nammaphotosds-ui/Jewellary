
import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useAppContext } from '../context/AppContext';
import { BillType, Page } from '../types';
import type { JewelryItem, BillItem, Customer, Bill } from '../types';
import Logo from './Logo';

// Helper function to convert numbers to Indian currency words
const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanOneThousand = (n: number): string => {
        let result = '';
        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' Hundred';
            n %= 100;
            if (n > 0) result += ' ';
        }
        if (n >= 20) {
            result += tens[Math.floor(n / 10)];
            n %= 10;
            if (n > 0) result += ' ';
        }
        if (n >= 10) {
            return result + teens[n - 10];
        }
        if (n > 0) {
            result += ones[n];
        }
        return result;
    };
    
    if (num === 0) return 'Rupees Zero Only';

    const [integerPartStr, decimalPartStr] = num.toFixed(2).split('.');
    const integerPart = parseInt(integerPartStr, 10);
    const decimalPart = parseInt(decimalPartStr, 10);

    let integerWords = '';
    if (integerPart > 0) {
        const crores = Math.floor(integerPart / 10000000);
        const lakhs = Math.floor((integerPart % 10000000) / 100000);
        const thousands = Math.floor((integerPart % 100000) / 1000);
        const remainder = integerPart % 1000;
        
        if (crores > 0) integerWords += convertLessThanOneThousand(crores) + ' Crore ';
        if (lakhs > 0) integerWords += convertLessThanOneThousand(lakhs) + ' Lakh ';
        if (thousands > 0) integerWords += convertLessThanOneThousand(thousands) + ' Thousand ';
        if (remainder > 0) integerWords += convertLessThanOneThousand(remainder);
    } else {
        integerWords = 'Zero';
    }


    let words = 'Rupees ' + integerWords.trim();
    if (decimalPart > 0) {
        words += ' and ' + convertLessThanOneThousand(decimalPart) + ' Paise';
    }
    return words.trim().replace(/\s+/g, ' ') + ' Only';
};


// This is the template that will be rendered for PDF generation
const InvoiceTemplate: React.FC<{bill: Bill, customer: Customer}> = ({bill, customer}) => {
    const totalWeight = bill.items.reduce((sum, item) => sum + item.weight, 0);
    const logoUrl = "https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163";
    return (
        <div className="p-8 text-gray-800 bg-white relative" style={{width: '794px', height: '559px', display: 'flex', flexDirection: 'column'}}>
            {/* Background Logo */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img src={logoUrl} alt="Logo" className="w-1/2 h-1/2 object-contain opacity-5" />
            </div>
            
            <div className="relative z-10 flex flex-col flex-1">
                 <header className="flex justify-between items-start border-b-2 border-brand-gold pb-4">
                    <div className="flex items-center">
                        <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain mr-4" />
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-brand-gold-dark">DEVAGIRIKAR JEWELLERYS</h1>
                            <p className="text-gray-600">EXCLUSIVE JEWELLERY SHOWROOM</p>
                            <p className="text-xs text-gray-500">1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot.</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <h2 className="text-3xl font-serif font-bold uppercase text-brand-charcoal-light">{bill.type}</h2>
                        <p className="text-xs"><strong>Bill No:</strong> {bill.id}</p>
                        <p className="text-xs"><strong>Date:</strong> {new Date(bill.date).toLocaleDateString()}</p>
                    </div>
                </header>

                <div className="flex justify-between mt-4 text-xs">
                    <div>
                        <h3 className="font-bold text-sm mb-1">Billed To:</h3>
                        <p>{customer.name} ({customer.id})</p>
                        <p>{customer.phone}</p>
                    </div>
                     <div className="text-right">
                        <p><strong>GSTIN:</strong> 29BSWPD7616JZ0</p>
                        <p><strong>Phone:</strong> 9008604004 / 8618748300</p>
                    </div>
                </div>

                <main className="flex-1 mt-4">
                     <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-2 py-1 font-semibold">Item Name</th>
                                <th className="px-2 py-1 text-right font-semibold">Weight (g)</th>
                                <th className="px-2 py-1 text-right font-semibold">Price (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map(item => (
                                <tr key={item.itemId} className="border-b odd:bg-gray-50">
                                    <td className="px-2 py-1">{item.name}</td>
                                    <td className="px-2 py-1 text-right">{item.weight.toFixed(3)}</td>
                                    <td className="px-2 py-1 text-right">{item.price.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>
                
                <div className="mt-auto pt-2">
                    <div className="flex justify-end">
                        <div className="w-1/2 text-xs">
                            <div className="flex justify-between py-0.5"><span>Total Gross Wt:</span><span>{totalWeight.toFixed(3)} g</span></div>
                            <div className="flex justify-between py-0.5 text-blue-600"><span>Less Wt:</span><span>- {bill.lessWeight.toFixed(3)} g</span></div>
                            <div className="flex justify-between py-0.5 font-bold border-t mt-1 pt-1"><span>Net Wt:</span><span>{bill.netWeight.toFixed(3)} g</span></div>
                            <hr className="my-1"/>
                            <div className="flex justify-between py-0.5"><span>Subtotal:</span><span>₹{bill.totalAmount.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between py-0.5 text-orange-600"><span>Extra Charges ({bill.extraChargePercentage}%):</span><span>+ ₹{bill.extraChargeAmount.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between py-0.5 text-green-600"><span>Discount:</span><span>- ₹{bill.bargainedAmount.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between py-1 font-bold text-base border-t-2 border-b-2 border-brand-charcoal my-1"><span>Grand Total:</span><span>₹{bill.grandTotal.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between py-0.5 text-green-600 font-semibold"><span>Amount Paid:</span><span>₹{bill.amountPaid.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between py-0.5 text-red-600 font-semibold"><span>Balance Due:</span><span>₹{bill.balance.toLocaleString('en-IN')}</span></div>
                        </div>
                    </div>
                     <div className="text-xs border-t pt-1 mt-1">
                        <p><span className="font-semibold">In Words:</span> {numberToWords(bill.grandTotal)}</p>
                        <p><span className="font-semibold">Paid Amount in Words:</span> {numberToWords(bill.amountPaid)}</p>
                    </div>
                </div>

                 <footer className="absolute bottom-4 left-8 right-8 text-center text-[8px] text-gray-500">
                    <p className="font-bold">DEVAGIRIKAR JEWELLERYS</p>
                    <p>1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot.</p>
                    <p>GSTIN: 29BSWPD7616JZ0 | Phone: 9008604004 / 8618748300</p>
                </footer>
                <img src={logoUrl} alt="Logo" className="absolute bottom-4 right-8 w-12 h-12 object-contain opacity-50" />
            </div>
        </div>
    );
};

// A generic searchable select component
const SearchableSelect = <T extends { id: string; name: string; }>({
    options,
    placeholder,
    onSelect,
    renderOption,
    disabled = false
}: {
    options: T[];
    placeholder: string;
    onSelect: (item: T) => void;
    renderOption: (item: T) => React.ReactNode;
    disabled?: boolean;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return [];
        return options.filter(option =>
            option.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, options]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (item: T) => {
        onSelect(item);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
                disabled={disabled}
                className="w-full p-2 border rounded"
            />
            {isOpen && searchTerm && (
                <ul className="absolute z-10 w-full bg-white border rounded-b-md shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(item => (
                            <li
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className="px-3 py-2 hover:bg-brand-gold-light cursor-pointer"
                            >
                                {renderOption(item)}
                            </li>
                        ))
                    ) : (
                        <li className="px-3 py-2 text-gray-500">No results found.</li>
                    )}
                </ul>
            )}
        </div>
    );
};


const BillingPage: React.FC<{setCurrentPage: (page: Page) => void}> = () => {
  const { inventory, customers, createBill, getCustomerById } = useAppContext();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<BillItem[]>([]);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [bargainedAmount, setBargainedAmount] = useState<string>('');
  const [billType, setBillType] = useState<BillType>(BillType.ESTIMATE);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lessWeight, setLessWeight] = useState('');
  const [extraChargePercentage, setExtraChargePercentage] = useState('');
  
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [selectedCustomerId, customers]);

  const availableInventory = useMemo(() => {
    return inventory.filter(item => item.quantity > 0 && !selectedItems.some(si => si.itemId === item.id));
  }, [inventory, selectedItems]);

  const calculations = useMemo(() => {
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);
    // Calculate extra charges on subtotal
    const extraChargeAmount = totalAmount * ((parseFloat(extraChargePercentage) || 0) / 100);
    // Apply discount after extra charges
    const grandTotal = totalAmount + extraChargeAmount - (parseFloat(bargainedAmount) || 0);
    const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
    const netWeight = totalWeight - (parseFloat(lessWeight) || 0);

    return { totalAmount, extraChargeAmount, grandTotal, totalWeight, netWeight };
  }, [selectedItems, bargainedAmount, extraChargePercentage, lessWeight]);

  const handleAddItem = (item: JewelryItem) => {
      setSelectedItems(prev => [...prev, { itemId: item.id, name: item.name, weight: item.weight, price: item.price, imageUrl: item.imageUrl }]);
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
    
    await new Promise(resolve => setTimeout(resolve, 500));
    const invoiceElement = tempContainer.children[0] as HTMLElement;

    if (invoiceElement) {
        const canvas = await html2canvas(invoiceElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller file size
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [794, 559] // A5 landscape
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, 794, 559);
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
      extraChargePercentage: parseFloat(extraChargePercentage) || 0,
      amountPaid: parseFloat(amountPaid) || 0,
    });
    
    const customer = getCustomerById(selectedCustomerId);
    if (customer) {
        await generatePdf(bill, customer);
    }

    // Reset form
    setSelectedCustomerId(null);
    setSelectedItems([]);
    setAmountPaid('');
    setBargainedAmount('');
    setLessWeight('');
    setExtraChargePercentage('');
    setBillType(BillType.ESTIMATE);
    alert('Bill created successfully!');
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Customer and Item Selection */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-bold">1. Customer & Items</h2>
            <div>
                <label className="block text-sm font-medium mb-1">Select Customer</label>
                 {selectedCustomer ? (
                    <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                        <span>{selectedCustomer.name} ({selectedCustomer.id})</span>
                        <button type="button" onClick={() => setSelectedCustomerId(null)} className="text-red-500 hover:text-red-700 text-sm">Change</button>
                    </div>
                 ) : (
                    <SearchableSelect<Customer>
                        options={customers}
                        placeholder="Search by name or ID..."
                        onSelect={(customer) => setSelectedCustomerId(customer.id)}
                        renderOption={(customer) => <span>{customer.name} ({customer.id})</span>}
                    />
                 )}
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">Add Items</label>
                <SearchableSelect<JewelryItem>
                    options={availableInventory}
                    placeholder="Search by name or serial no..."
                    onSelect={handleAddItem}
                    disabled={!selectedCustomerId}
                    renderOption={(item) => (
                        <div className="flex justify-between">
                            <span>{item.name} ({item.serialNo})</span>
                            <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                />
            </div>
            <div className="mt-4 max-h-64 overflow-y-auto">
                 {selectedItems.map(item => (
                    <div key={item.itemId} className="flex justify-between items-center bg-gray-50 p-2 rounded mb-2">
                        <div>{item.name} <span className="text-xs text-gray-500">({item.weight.toFixed(3)}g)</span></div>
                        <div className="flex items-center gap-4">
                            <span>₹{item.price.toLocaleString('en-IN')}</span>
                            <button type="button" onClick={() => handleRemoveItem(item.itemId)} className="text-red-500 hover:text-red-700">&times;</button>
                        </div>
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
                    <div className="flex justify-between"><span>Extra Charges ({(parseFloat(extraChargePercentage) || 0)}%):</span><span className="text-orange-600">+ ₹{calculations.extraChargeAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Discount:</span><span className="text-green-600">- ₹{(parseFloat(bargainedAmount) || 0).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Grand Total:</span><span className="text-brand-gold-dark">₹{calculations.grandTotal.toLocaleString('en-IN')}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">Less Weight (g)</label><input type="number" step="0.001" value={lessWeight} onChange={e => setLessWeight(e.target.value)} className="w-full p-2 border rounded" placeholder="0.000"/></div>
                    <div><label className="block text-sm font-medium">Discount (₹)</label><input type="number" value={bargainedAmount} onChange={e => setBargainedAmount(e.target.value)} className="w-full p-2 border rounded" placeholder="0.00"/></div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">Extra Charge (%)</label><input type="number" value={extraChargePercentage} onChange={e => setExtraChargePercentage(e.target.value)} className="w-full p-2 border rounded" placeholder="0"/></div>
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