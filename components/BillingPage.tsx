import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useAppContext } from '../context/AppContext';
import { BillType, Page } from '../types';
import type { JewelryItem, BillItem, Customer, Bill } from '../types';
import { SendIcon } from '../App';

const numberToWords = (num: number): string => {
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const toWords = (n: number): string => {
        if (n < 20) return a[n];
        const digit = n % 10;
        return b[Math.floor(n / 10)] + (digit !== 0 ? '' : '') + a[digit];
    };
    
    if (integerPart === 0) return 'Rupees Zero Only';

    let words = '';
    words += toWords(Math.floor(integerPart / 10000000) % 100) ? toWords(Math.floor(integerPart / 10000000) % 100) + 'crore ' : '';
    words += toWords(Math.floor(integerPart / 100000) % 100) ? toWords(Math.floor(integerPart / 100000) % 100) + 'lakh ' : '';
    words += toWords(Math.floor(integerPart / 1000) % 100) ? toWords(Math.floor(integerPart / 1000) % 100) + 'thousand ' : '';
    words += toWords(Math.floor(integerPart / 100) % 10) ? toWords(Math.floor(integerPart / 100) % 10) + 'hundred ' : '';
    if (integerPart > 100 && (integerPart % 100) > 0) words += 'and ';
    words += toWords(integerPart % 100);

    let result = `Rupees ${words.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;

    if (decimalPart > 0) {
        result += ` and ${toWords(decimalPart)}Paise`;
    }
    
    return result + ' Only';
};

// This is the template that will be rendered for PDF generation
const InvoiceTemplate: React.FC<{bill: Bill, customer: Customer}> = ({bill, customer}) => {
    const totalGrossWeight = bill.items.reduce((sum, item) => sum + item.weight, 0);
    const { grandTotal, netWeight, extraChargeAmount, bargainedAmount, finalAmount, amountPaid } = bill;
    const logoUrl = "https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163";

    return (
        <div className="bg-brand-cream text-brand-charcoal font-sans relative" style={{ width: '842px', height: '595px', boxSizing: 'border-box' }}>
            {/* Decorative Border */}
            <div className="absolute inset-0 border-[1px] border-brand-gold-dark/30 z-0"></div>
            <div className="absolute inset-2 border-[8px] border-brand-pale-gold z-0"></div>
            <div className="absolute inset-4 border-[1px] border-brand-gold-dark/50 z-0"></div>

            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.06]">
                <img src={logoUrl} alt="Watermark" className="w-[350px]"/>
            </div>
            
            <div className="relative z-10 p-8 flex flex-col h-full">
                {/* Header */}
                <header className="flex justify-between items-center pb-4 mb-6 border-b border-brand-gold-dark/30">
                    <div className="flex items-center">
                        <img src={logoUrl} alt="Logo" className="w-20 h-20" />
                        <div className="ml-4">
                            <h2 className="text-3xl font-serif font-bold text-brand-charcoal">DEVAGIRIKAR JEWELLERYS</h2>
                            <p className="text-xs tracking-widest text-brand-gray">EXCLUSIVE JEWELLERY SHOWROOM</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-5xl font-serif font-light text-brand-gold-dark tracking-widest">{bill.type}</h1>
                        <p className="text-sm mt-2 font-mono"><strong>Bill No:</strong> {bill.id}</p>
                        <p className="text-sm font-mono"><strong>Date:</strong> {new Date(bill.date).toLocaleDateString()}</p>
                    </div>
                </header>

                {/* Customer Details */}
                <section className="text-sm mb-6">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Billed To</p>
                    <p className="font-bold text-lg text-brand-charcoal font-serif">{customer.name} ({customer.id})</p>
                    <p className="text-brand-gray">{customer.phone}</p>
                </section>

                {/* Items Table */}
                <main className="flex-grow">
                     <table className="w-full text-sm">
                        <thead className="border-b-2 border-brand-charcoal">
                            <tr>
                                <th className="font-semibold p-3 text-left tracking-wider uppercase text-brand-charcoal">Item Name</th>
                                <th className="font-semibold p-3 text-right tracking-wider uppercase text-brand-charcoal w-32">Weight (g)</th>
                                <th className="font-semibold p-3 text-right tracking-wider uppercase text-brand-charcoal w-32">Price (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map(item => (
                                <tr key={item.itemId} className="border-b border-brand-gold-dark/20">
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className="p-3 text-right font-mono">{item.weight.toFixed(3)}</td>
                                    <td className="p-3 text-right font-mono">{item.price.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                            <tr className="h-4"><td colSpan={3}></td></tr>
                        </tbody>
                    </table>
                </main>

                {/* Summary Section */}
                <section className="mt-auto pt-4 border-t border-brand-gold-dark/30">
                    <div className="grid grid-cols-10 gap-6">
                        <div className="col-span-5 text-sm space-y-2">
                             <p className="text-xs italic text-gray-600 capitalize">{numberToWords(grandTotal)}</p>
                             <div className="mt-6 text-xs text-brand-gray">
                                <p className="font-bold">Terms & Conditions:</p>
                                <p>1. Goods once sold will not be taken back.</p>
                                <p>2. Interest will be charged on overdue bills.</p>
                             </div>
                        </div>
                        <div className="col-span-5 text-sm">
                            <div className="space-y-1">
                                <div className="flex justify-between"><span>Gross Wt:</span><span>{totalGrossWeight.toFixed(3)} g</span></div>
                                {bill.lessWeight > 0 && <div className="flex justify-between"><span>Less Wt:</span><span>- {bill.lessWeight.toFixed(3)} g</span></div>}
                                <div className="flex justify-between font-bold border-t border-gray-200 mt-1 pt-1"><span>Net Wt:</span><span>{netWeight.toFixed(3)} g</span></div>
                            </div>
                            <div className="space-y-1 mt-3 pt-3 border-t border-gray-200">
                                <div className="flex justify-between"><span>Subtotal:</span><span>₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                {extraChargeAmount > 0 && <div className="flex justify-between"><span>Charges ({bill.extraChargePercentage}%):</span><span>+ ₹{extraChargeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                                {bargainedAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span><span>- ₹{bargainedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                                <div className="flex justify-between font-bold text-lg mt-1 pt-1 border-t-2 border-brand-charcoal"><span>Grand Total:</span><span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                            </div>
                            <div className="space-y-1 mt-2">
                                 <div className="flex justify-between"><span>Paid:</span><span>₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                 <div className="flex justify-between font-bold text-red-600"><span>BALANCE DUE:</span><span>₹{bill.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-end mt-8">
                         <p className="text-xs text-brand-gray">Thank you for your business!</p>
                         <div className="text-center">
                            <div className="w-48 border-t border-brand-charcoal pt-1"></div>
                            <p className="text-xs">Authorised Signatory</p>
                         </div>
                    </div>
                </section>
                
                <footer className="absolute bottom-2 left-8 right-8 text-center text-[9px] text-gray-500">
                    <p className="font-bold font-serif">DEVAGIRIKAR JEWELLERYS</p>
                    <p>1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot. | Phone: 9008604004 / 8618748300 | GSTIN: 29BSWPD7616JZ0</p>
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
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.zIndex = '-1';
        document.body.appendChild(tempContainer);

        const root = ReactDOM.createRoot(tempContainer);
        root.render(<InvoiceTemplate bill={bill} customer={customer} />);
        
        const invoiceElement = tempContainer.children[0] as HTMLElement;

        if (!invoiceElement) {
            root.unmount();
            document.body.removeChild(tempContainer);
            return null;
        }

        const images = Array.from(invoiceElement.getElementsByTagName('img'));
        const imageLoadPromises = images.map(img => 
            new Promise((resolve, reject) => {
                if (img.complete) resolve(true);
                else {
                    img.onload = () => resolve(true);
                    img.onerror = reject;
                }
            })
        );
        
        try {
            await Promise.all(imageLoadPromises);
            // A small delay to ensure rendering is complete, especially for web fonts
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            console.error("An image failed to load for PDF generation:", error);
        }

        const canvas = await html2canvas(invoiceElement, { scale: 2, useCORS: true, windowWidth: invoiceElement.scrollWidth, windowHeight: invoiceElement.scrollHeight });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
        const margin = 8; // 8mm margin
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pdfWidth - margin * 2;
        const contentHeight = pdfHeight - margin * 2;
        
        pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);

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