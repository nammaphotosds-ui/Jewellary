import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useAppContext } from '../context/AppContext';
import { BillType, Page } from '../types';
import type { JewelryItem, BillItem, Customer, Bill } from '../types';
import Logo from './Logo';
import { SendIcon } from '../App';

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
    const totalGrossWeight = bill.items.reduce((sum, item) => sum + item.weight, 0);
    const averageRatePerGram = totalGrossWeight > 0 ? bill.totalAmount / totalGrossWeight : 0;
    const lessWeightValue = bill.lessWeight * averageRatePerGram;
    const actualSubtotal = bill.totalAmount - lessWeightValue;
    const logoUrl = "https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163";
    
    return (
        <div className="bg-white text-brand-charcoal font-sans relative" style={{ width: '794px', height: '1123px', boxSizing: 'border-box' }}>
            {/* Watermark */}
            <img
                src={logoUrl}
                alt="Watermark"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 object-contain opacity-5 z-0"
            />
            <div className="relative z-10 flex flex-col h-full p-10">
                {/* Header */}
                <header className="flex justify-between items-start">
                    <div className="flex items-center">
                        <img src={logoUrl} alt="Logo" className="w-32 h-32 object-contain" />
                        <div className="ml-4">
                            <h1 className="text-4xl font-serif font-bold text-brand-gold-dark">DEVAGIRIKAR JEWELLERYS</h1>
                            <p className="text-sm text-brand-gray">EXCLUSIVE JEWELLERY SHOWROOM</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-serif font-bold text-brand-charcoal-light tracking-wider">{bill.type}</h2>
                        <p className="mt-1"><strong>Bill No:</strong> {bill.id}</p>
                        <p><strong>Date:</strong> {new Date(bill.date).toLocaleDateString()}</p>
                    </div>
                </header>
                <hr className="my-4 border-t border-brand-gold/50" />

                {/* Bill Info */}
                <section className="flex justify-between items-start text-sm">
                    <div>
                        <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-1">Bill To:</h3>
                        <p className="font-bold text-base">{customer.name}</p>
                        <p className="text-brand-gray">{customer.phone}</p>
                        <p className="text-brand-gray font-mono text-xs">ID: {customer.id}</p>
                    </div>
                </section>

                {/* Items Table */}
                <main className="flex-1 mt-6">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-brand-charcoal text-white">
                            <tr>
                                <th className="px-3 py-2 font-semibold w-12">S.No.</th>
                                <th className="px-3 py-2 font-semibold">Item Description</th>
                                <th className="px-3 py-2 text-right font-semibold w-28">Weight (g)</th>
                                <th className="px-3 py-2 text-right font-semibold w-32">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map((item, index) => (
                                <tr key={item.itemId} className="border-b border-gray-200">
                                    <td className="px-3 py-2 text-center">{index + 1}.</td>
                                    <td className="px-3 py-2">{item.name}</td>
                                    <td className="px-3 py-2 text-right">{item.weight.toFixed(3)}</td>
                                    <td className="px-3 py-2 text-right">{item.price.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>

                {/* Summary & Footer */}
                <footer className="mt-auto pt-4">
                    <div className="flex justify-between items-start text-sm">
                        <div className="w-1/2 pr-8">
                            <h4 className="font-semibold mb-1">Payable Amount in Words:</h4>
                            <p className="text-xs italic text-gray-600">{numberToWords(bill.grandTotal)}</p>
                            <h4 className="font-semibold mb-1 mt-2">Paid Amount in Words:</h4>
                            <p className="text-xs italic text-gray-600">{numberToWords(bill.amountPaid)}</p>
                            <h4 className="font-semibold mt-4 mb-1">Terms & Conditions:</h4>
                            <p className="text-xs text-gray-500">All items are guaranteed to be as described. Goods once sold will not be taken back.</p>
                        </div>
                        <div className="w-1/2">
                            <table className="w-full">
                                <tbody>
                                    <tr><td className="py-1">Gross Weight:</td><td className="text-right">{totalGrossWeight.toFixed(3)} g</td></tr>
                                    <tr><td className="py-1">Less Weight:</td><td className="text-right">- {bill.lessWeight.toFixed(3)} g</td></tr>
                                    <tr className="font-bold border-t border-gray-300"><td className="py-1">Net Weight:</td><td className="text-right">{bill.netWeight.toFixed(3)} g</td></tr>
                                    
                                    <tr className="border-t-2 border-dashed border-gray-300 mt-2"><td className="pt-2">Subtotal:</td><td className="text-right pt-2">₹{actualSubtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>
                                    <tr><td className="py-1">Extra Charges ({bill.extraChargePercentage}%):</td><td className="text-right">+ ₹{bill.extraChargeAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>
                                    <tr><td className="py-1">Discount:</td><td className="text-right text-green-600">- ₹{bill.bargainedAmount.toLocaleString('en-IN')}</td></tr>
                                    
                                    <tr className="font-bold text-lg border-t-2 border-brand-charcoal"><td className="py-2">Grand Total:</td><td className="text-right py-2">₹{bill.grandTotal.toLocaleString('en-IN')}</td></tr>
                                    
                                    <tr><td className="py-1">Amount Paid:</td><td className="text-right text-green-700 font-semibold">₹{bill.amountPaid.toLocaleString('en-IN')}</td></tr>
                                    <tr className="font-bold"><td className="py-1">Balance Due:</td><td className={`text-right ${bill.balance > 0 ? 'text-red-600' : ''}`}>₹{bill.balance.toLocaleString('en-IN')}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <hr className="my-4 border-t border-brand-gold/50" />
                    <div className="flex justify-between items-end">
                        <p className="text-sm font-semibold">Thank you for your business!</p>
                        <div className="text-center text-sm">
                            <p className="pt-8 border-t-2 border-gray-400 w-48">Authorised Signatory</p>
                        </div>
                    </div>
                     <div className="text-center text-xs text-brand-gray mt-4 pt-4 border-t border-gray-200">
                        <p className="font-bold">1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot.</p>
                        <p>Phone: 9008604004 / 8618748300 | GSTIN: 29BSWPD7616JZ0</p>
                    </div>
                </footer>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lessWeight, setLessWeight] = useState('');
  const [extraChargePercentage, setExtraChargePercentage] = useState('');
  
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [selectedCustomerId, customers]);

  const availableInventory = useMemo(() => {
    return inventory.filter(item => item.quantity > 0 && !selectedItems.some(si => si.itemId === item.id));
  }, [inventory, selectedItems]);

  const calculations = useMemo(() => {
    const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
    const subtotalBeforeLessWeight = selectedItems.reduce((sum, item) => sum + item.price, 0);

    const lw = parseFloat(lessWeight) || 0;
    const averageRate = totalWeight > 0 ? subtotalBeforeLessWeight / totalWeight : 0;
    const lessWeightValue = lw * averageRate;

    const actualSubtotal = subtotalBeforeLessWeight - lessWeightValue;

    const ecp = parseFloat(extraChargePercentage) || 0;
    const extraChargeAmount = actualSubtotal * (ecp / 100);

    const ba = parseFloat(bargainedAmount) || 0;
    const grandTotal = actualSubtotal + extraChargeAmount - ba;

    const netWeight = totalWeight - lw;

    return { 
        totalAmount: subtotalBeforeLessWeight,
        lessWeightValue,
        actualSubtotal,
        extraChargeAmount, 
        grandTotal, 
        totalWeight, 
        netWeight 
    };
  }, [selectedItems, bargainedAmount, extraChargePercentage, lessWeight]);

  const handleAddItem = (item: JewelryItem) => {
      setSelectedItems(prev => [...prev, { itemId: item.id, name: item.name, weight: item.weight, price: item.price, imageUrl: item.imageUrl }]);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.itemId !== itemId));
  };
  
    const generatePdfBlob = async (bill: Bill, customer: Customer): Promise<Blob | null> => {
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

        if (!invoiceElement) {
            root.unmount();
            document.body.removeChild(tempContainer);
            return null;
        }

        const canvas = await html2canvas(invoiceElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        root.unmount();
        document.body.removeChild(tempContainer);
        return pdf.output('blob');
    };
  
  const resetForm = () => {
    setSelectedCustomerId(null);
    setSelectedItems([]);
    setAmountPaid('');
    setBargainedAmount('');
    setLessWeight('');
    setExtraChargePercentage('');
    setBillType(BillType.ESTIMATE);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCustomerId || selectedItems.length === 0) {
        alert("Please select a customer and at least one item.");
        return;
    }

    const action = (e.nativeEvent.submitter as HTMLButtonElement)?.value || 'download';
    
    setIsSubmitting(true);

    try {
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
        if (!customer) throw new Error("Customer not found after creating bill.");

        const blob = await generatePdfBlob(bill, customer);
        if (!blob) throw new Error("Failed to generate PDF.");

        if (action === 'send') {
            const file = new File([blob], `invoice-${bill.id}.pdf`, { type: 'application/pdf' });
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `${bill.type} - ${bill.id}`,
                    text: `Here is the ${bill.type.toLowerCase()} for ${customer.name} from DEVAGIRIKAR JEWELLERYS.`
                });
            } else {
                alert('Sharing not supported on this device/browser. Please download and send manually.');
            }
        } else { // Default to download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${bill.type.toLowerCase()}-${bill.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        alert('Bill created successfully!');
        resetForm();

    } catch (error) {
        console.error("Error processing bill:", error);
        if ((error as DOMException).name !== 'AbortError') {
            alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    } finally {
        setIsSubmitting(false);
    }
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
                    <div className="flex justify-between"><span>Subtotal (Gross):</span><span>₹{calculations.totalAmount.toLocaleString('en-IN')}</span></div>
                    {calculations.lessWeightValue > 0 && (
                        <div className="flex justify-between text-blue-600"><span>Less Weight Value:</span><span>- ₹{calculations.lessWeightValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-1 mt-1"><span>Net Amount:</span><span>₹{calculations.actualSubtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                    <div className="flex justify-between"><span>Extra Charges ({(parseFloat(extraChargePercentage) || 0)}%):</span><span className="text-orange-600">+ ₹{calculations.extraChargeAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                    <div className="flex justify-between"><span>Discount:</span><span className="text-green-600">- ₹{(parseFloat(bargainedAmount) || 0).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t-2 border-brand-charcoal pt-2 mt-2"><span>Grand Total:</span><span className="text-brand-gold-dark">₹{calculations.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
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
                <div className="flex flex-col sm:flex-row gap-3">
                    <button type="submit" value="download" disabled={isSubmitting} className="w-full bg-brand-gold text-brand-charcoal p-3 rounded-lg font-semibold hover:bg-brand-gold-dark transition disabled:bg-gray-400">
                        {isSubmitting ? 'Processing...' : 'Create & Download PDF'}
                    </button>
                    <button type="submit" value="send" disabled={isSubmitting} className="w-full flex items-center justify-center bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400">
                        <SendIcon />
                        {isSubmitting ? 'Processing...' : 'Create & Send'}
                    </button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
};

export default BillingPage;