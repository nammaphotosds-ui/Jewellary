import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useAppContext } from '../context/AppContext';
import type { Customer, Bill } from '../types';
import { SendIcon } from '../App';


// --- Helper Functions & Components ---

const numberToWords = (num: number): string => {
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const toWords = (n: number): string => {
        if (n < 20) return a[n];
        const digit = n % 10;
        return b[Math.floor(n / 10)] + (digit !== 0 ? '-' : '') + a[digit];
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

const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className={`flex items-center justify-center rounded-full bg-brand-gold-light text-brand-gold-dark ${className}`}>
            <span className="font-serif text-xl">{initial}</span>
        </div>
    );
};

// New Redesigned Invoice Template for PDF Generation
const InvoiceTemplate: React.FC<{bill: Bill, customer: Customer}> = ({bill, customer}) => {
    const totalGrossWeight = bill.items.reduce((sum, item) => sum + item.weight, 0);
    const { grandTotal, netWeight, extraChargeAmount, bargainedAmount, finalAmount, amountPaid } = bill;
    const logoUrl = "https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163";

    return (
        <div className="bg-white text-black font-sans relative" style={{ width: '794px', minHeight: '560px', boxSizing: 'border-box' }}>
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.12]">
                <img src={logoUrl} alt="Watermark" className="w-[450px]"/>
            </div>
            
            <div className="relative z-10 p-10 flex flex-col h-full">
                {/* Header */}
                <header className="pb-2">
                    <div className="flex justify-between items-center">
                        <img src={logoUrl} alt="Logo" className="w-36 h-auto" />
                        <div className="text-right">
                            <h1 className="text-4xl font-bold font-sans tracking-wide">{bill.type}</h1>
                            <p className="text-sm"><strong>Bill No:</strong> {bill.id}</p>
                            <p className="text-sm"><strong>Date:</strong> {new Date(bill.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="border-b-2 border-[#daa520] mb-6 mt-2"></div>
                </header>

                {/* Customer & Shop Details */}
                <section className="flex justify-between text-sm mb-6">
                    <div>
                        <p className="text-gray-500 text-xs font-bold">BILLED TO:</p>
                        <p className="font-bold text-base">{customer.name} ({customer.id})</p>
                        <p>{customer.phone}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-serif font-bold text-[#daa520]">DEVAGIRIKAR JEWELLERYS</h2>
                        <p className="text-xs tracking-widest text-gray-600">EXCLUSIVE JEWELLERY SHOWROOM</p>
                    </div>
                </section>

                {/* Items Table */}
                <main className="flex-grow">
                     <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-brand-charcoal text-white">
                                <th className="font-normal p-2 text-left">Item Name</th>
                                <th className="font-normal p-2 text-right w-32">Weight (g)</th>
                                <th className="font-normal p-2 text-right w-32">Price (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map(item => (
                                <tr key={item.itemId} className="border-b">
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2 text-right">{item.weight.toFixed(3)}</td>
                                    <td className="p-2 text-right">{item.price.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>

                {/* Summary Section */}
                <section className="mt-4">
                    <div className="flex justify-between">
                         <div className="w-2/5 text-sm space-y-1 pr-4">
                            <div className="font-bold border-b pb-1 mb-2">Payment Details</div>
                            <div className="flex justify-between font-bold">
                                <span>Payable Amount:</span> 
                                <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <p className="text-xs italic">{numberToWords(grandTotal)}</p>

                            <div className="flex justify-between mt-2">
                                <span>Amount Paid:</span> 
                                <span>₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <p className="text-xs italic">{numberToWords(amountPaid)}</p>

                            <div className="flex justify-between font-bold border-t pt-1 mt-2">
                                <span>Balance Due:</span> 
                                <span>₹{bill.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                         </div>
                        <div className="w-1/2 text-sm">
                            <div className="flex justify-between p-1"><span>Total Gross Wt:</span><span>{totalGrossWeight.toFixed(3)} g</span></div>
                            <div className="flex justify-between p-1 text-blue-600"><span>Less Wt:</span><span>- {bill.lessWeight.toFixed(3)} g</span></div>
                            <div className="flex justify-between p-1 font-bold border-t"><span>Net Wt:</span><span>{netWeight.toFixed(3)} g</span></div>
                            <div className="flex justify-between p-1 mt-2"><span>Subtotal (Gross):</span><span>₹{bill.totalAmount.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between p-1 font-bold"><span>Net Amount:</span><span>₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                            {extraChargeAmount > 0 && <div className="flex justify-between p-1 text-orange-600"><span>Extra Charges ({bill.extraChargePercentage}%):</span><span>+ ₹{extraChargeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                            {bargainedAmount > 0 && <div className="flex justify-between p-1 text-green-600"><span>Discount:</span><span>- ₹{bargainedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                             <div className="flex justify-between p-2 mt-2 font-bold text-lg border-t-2 border-black"><span>PAYABLE AMOUNT:</span><span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                        </div>
                    </div>
                </section>
                
                <footer className="mt-auto text-center text-xs text-gray-500 border-t pt-4">
                    <p className="font-bold">DEVAGIRIKAR JEWELLERYS</p>
                    <p>1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot.</p>
                    <p>Phone: 9008604004 / 8618748300 | GSTIN: 29BSWPD7616JZ0</p>
                </footer>
            </div>
        </div>
    );
};


// New Redesigned Customer Profile Template
const CustomerProfileTemplate: React.FC<{customer: Customer, bills: Bill[]}> = ({customer, bills}) => {
     const logoUrl = "https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163";
    return (
        <div className="bg-white text-black font-sans relative" style={{ width: '794px', minHeight: '560px', boxSizing: 'border-box' }}>
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.12]">
                <img src={logoUrl} alt="Watermark" className="w-[450px]"/>
            </div>
            <div className="relative z-10 p-10 flex flex-col h-full">
                <header className="pb-2">
                     <div className="flex justify-between items-center">
                        <img src={logoUrl} alt="Logo" className="w-36 h-auto" />
                        <div className="text-right">
                            <h1 className="text-4xl font-bold font-sans">Customer Statement</h1>
                            <p className="text-sm">Date Generated: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="border-b-2 border-[#daa520] mb-6 mt-2"></div>
                </header>

                <section>
                    <div className="flex justify-between items-start text-sm border p-4 rounded-lg bg-gray-50 mb-6">
                        <div>
                            <p className="text-gray-500 text-xs font-bold">STATEMENT FOR:</p>
                            <p className="font-bold text-base">{customer.name}</p>
                            <p>{customer.phone}</p>
                            <p className="font-mono text-xs">ID: {customer.id}</p>
                        </div>
                        <div className="text-right">
                            <p><strong>Member Since:</strong> {new Date(customer.joinDate).toLocaleDateString()}</p>
                            {customer.dob && <p><strong>Birthday:</strong> {new Date(customer.dob).toLocaleDateString()}</p>}
                        </div>
                    </div>

                    <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-center">
                        <h3 className="text-sm font-semibold text-red-700 uppercase">Total Pending Balance</h3>
                        <p className="text-4xl font-bold text-red-600">₹{customer.pendingBalance.toLocaleString('en-IN')}</p>
                    </div>
                </section>

                <main className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-brand-charcoal text-white">
                            <tr>
                                <th className="px-3 py-2 font-normal">Date</th>
                                <th className="px-3 py-2 font-normal">Bill No.</th>
                                <th className="px-3 py-2 font-normal">Type</th>
                                <th className="px-3 py-2 text-right font-normal">Total (₹)</th>
                                <th className="px-3 py-2 text-right font-normal">Paid (₹)</th>
                                <th className="px-3 py-2 text-right font-normal">Balance (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.length > 0 ? bills.map((bill) => (
                                <tr key={bill.id} className="border-b border-gray-200">
                                    <td className="px-3 py-2">{new Date(bill.date).toLocaleDateString()}</td>
                                    <td className="px-3 py-2 font-mono text-xs">{bill.id}</td>
                                    <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${bill.type === 'INVOICE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{bill.type}</span></td>
                                    <td className="px-3 py-2 text-right">{bill.grandTotal.toLocaleString('en-IN')}</td>
                                    <td className="px-3 py-2 text-right text-green-700">{bill.amountPaid.toLocaleString('en-IN')}</td>
                                    <td className={`px-3 py-2 text-right font-bold ${bill.balance > 0 ? 'text-red-600' : 'text-gray-500'}`}>{bill.balance.toLocaleString('en-IN')}</td>
                                </tr>
                            )) : (
                              <tr><td colSpan={6} className="text-center p-8 text-gray-500">No transactions found for this customer.</td></tr>
                            )}
                        </tbody>
                    </table>
                </main>

                <footer className="mt-auto text-center text-xs text-gray-500 border-t pt-4">
                    <p className="font-bold">DEVAGIRIKAR JEWELLERYS</p>
                    <p>1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot.</p>
                    <p>Phone: 9008604004 / 8618748300 | GSTIN: 29BSWPD7616JZ0</p>
                </footer>
            </div>
        </div>
    );
};

// --- Responsive On-Screen View ---
const OnScreenCustomerProfile: React.FC<{
    customer: Customer, 
    bills: Bill[],
    onBillClick: (bill: Bill) => void,
    generatingBillId: string | null
}> = ({customer, bills, onBillClick, generatingBillId}) => {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-6 border">
                <Avatar name={customer.name} className="w-24 h-24 md:w-32 md-h-32 !text-5xl border-4 border-brand-gold-light shadow-lg"/>
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold font-serif text-brand-charcoal">{customer.name}</h2>
                    <p className="font-mono text-gray-500">{customer.id}</p>
                    <p className="text-gray-600 mt-2">{customer.phone}</p>
                    {customer.dob && <p className="text-sm text-gray-500">Birthday: {new Date(customer.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                    <p className="text-sm text-gray-500">Member since {new Date(customer.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-auto text-center md:text-right bg-red-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-red-700">Pending Balance</p>
                    <p className="text-3xl font-bold text-red-600">₹{customer.pendingBalance.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-xl font-bold mb-4 text-brand-charcoal">Transaction History</h3>
                <div className="max-h-[400px] overflow-y-auto">
                     <table className="w-full text-left">
                        <thead className="sticky top-0 bg-gray-100 z-10">
                            <tr>
                                <th className="p-2 text-sm font-semibold text-gray-600">Bill ID</th>
                                <th className="p-2 text-sm font-semibold text-gray-600">Date</th>
                                <th className="p-2 text-sm font-semibold text-gray-600">Type</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 text-right">Total (₹)</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 text-right">Balance (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map(bill => (
                                <tr key={bill.id} className="border-b">
                                    <td className="p-2 text-xs font-mono">
                                         <button
                                            onClick={() => onBillClick(bill)}
                                            disabled={!!generatingBillId}
                                            className="text-blue-600 hover:underline disabled:text-gray-500 disabled:no-underline"
                                        >
                                            {generatingBillId === bill.id ? 'Generating...' : bill.id}
                                        </button>
                                    </td>
                                    <td className="p-2 text-sm">{new Date(bill.date).toLocaleDateString()}</td>
                                    <td className="p-2 text-sm">{bill.type}</td>
                                    <td className="p-2 text-sm text-right">{bill.grandTotal.toLocaleString('en-IN')}</td>
                                    <td className="p-2 text-sm text-right font-semibold">{bill.balance > 0 ? <span className="text-red-600">{bill.balance.toLocaleString('en-IN')}</span> : 'Paid'}</td>
                                </tr>
                            ))}
                            {bills.length === 0 && (<tr><td colSpan={5} className="text-center p-8 text-gray-500">No transactions found.</td></tr>)}
                        </tbody>
                     </table>
                </div>
            </div>
        </div>
    );
};


const CustomerDetailsView: React.FC<{customer: Customer, onBack: () => void}> = ({customer, onBack}) => {
    const { getBillsByCustomerId, deleteCustomer } = useAppContext();
    const bills = getBillsByCustomerId(customer.id);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGeneratingBillPdf, setIsGeneratingBillPdf] = useState<string | null>(null);

    const generatePdfBlob = async (template: 'profile' | 'bill', bill?: Bill): Promise<Blob | null> => {
        // @ts-ignore
        const { jsPDF } = window.jspdf;
        // @ts-ignore
        const html2canvas = window.html2canvas;

        const tempContainer = document.createElement('div');
        // CRITICAL FIX: Render element off-screen instead of visibility:hidden to ensure full rendering.
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.zIndex = '-1';
        document.body.appendChild(tempContainer);

        const root = ReactDOM.createRoot(tempContainer);
        if (template === 'profile') {
            root.render(<CustomerProfileTemplate customer={customer} bills={bills} />);
        } else if (bill) {
            root.render(<InvoiceTemplate bill={bill} customer={customer} />);
        }

        const elementToCapture = tempContainer.children[0] as HTMLElement;

        if (!elementToCapture) {
            root.unmount();
            document.body.removeChild(tempContainer);
            return null;
        }

        // Wait for all images inside the element to load
        const images = Array.from(elementToCapture.getElementsByTagName('img'));
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
        } catch (error) {
            console.error("An image failed to load for PDF generation:", error);
        }

        const canvas = await html2canvas(elementToCapture, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        root.unmount();
        document.body.removeChild(tempContainer);
        return pdf.output('blob');
    };


    const handleDownloadPdf = async () => {
        setIsProcessing(true);
        const blob = await generatePdfBlob('profile');
        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `profile-${customer.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('Failed to generate PDF.');
        }
        setIsProcessing(false);
    };

    const handleSharePdf = async () => {
        setIsProcessing(true);
        try {
            const blob = await generatePdfBlob('profile');
            if (!blob) throw new Error("Failed to generate PDF blob.");

            const file = new File([blob], `profile-${customer.id}.pdf`, { type: 'application/pdf' });
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Customer Profile - ${customer.name}`,
                    text: `Here is the customer profile for ${customer.name} from DEVAGIRIKAR JEWELLERYS.`
                });
            } else {
                alert('Sharing is not supported on this browser. Try downloading the file instead.');
            }
        } catch (error) {
            console.error('Error sharing PDF:', error);
            if ((error as DOMException).name !== 'AbortError') {
                 alert('An error occurred while trying to share the PDF.');
            }
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleBillDownload = async (bill: Bill) => {
        setIsGeneratingBillPdf(bill.id);
        try {
            const blob = await generatePdfBlob('bill', bill);
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${bill.type.toLowerCase()}-${bill.id}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert('Failed to generate PDF for this bill.');
            }
        } catch (error) {
            console.error("Error generating bill PDF:", error);
            alert('An error occurred while generating the PDF.');
        } finally {
            setIsGeneratingBillPdf(null);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${customer.name}? This will also delete all their transaction history. This action cannot be undone.`)) {
            await deleteCustomer(customer.id);
            alert('Customer deleted successfully.');
            onBack();
        }
    };


    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                     <button onClick={onBack} className="flex items-center text-gray-600 hover:text-brand-charcoal transition mb-2">
                        {/* FIX: Corrected a malformed `viewBox` attribute in an SVG element that was causing a parsing error. */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Customers
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleDownloadPdf} disabled={isProcessing} className="bg-brand-gold text-brand-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-brand-gold-dark transition flex items-center justify-center shadow-md disabled:bg-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        {isProcessing ? 'Processing...' : 'Download'}
                    </button>
                    <button onClick={handleSharePdf} disabled={isProcessing} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center shadow-md disabled:bg-gray-400">
                        <SendIcon />
                        {isProcessing ? 'Processing...' : 'Send'}
                    </button>
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Delete
                    </button>
                </div>
            </div>
            <OnScreenCustomerProfile 
                customer={customer} 
                bills={bills}
                onBillClick={handleBillDownload}
                generatingBillId={isGeneratingBillPdf}
            />
        </div>
    );
};

// --- Main CustomersPage ---
const CustomersPage: React.FC = () => {
  const { customers } = useAppContext();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;

  if (selectedCustomer) {
      return <CustomerDetailsView customer={selectedCustomer} onBack={() => setSelectedCustomerId(null)} />;
  }

  return (
    <div>
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4">Customer</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4 text-right">Pending Amount (₹)</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="flex items-center">
                                        <Avatar name={customer.name} className="w-10 h-10 mr-4"/>
                                        <div>
                                            <p className="font-semibold">{customer.name}</p>
                                            <p className="text-xs font-mono text-gray-500">{customer.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">{customer.phone}</td>
                                <td className="p-4 text-right font-semibold text-red-600">
                                    {customer.pendingBalance.toLocaleString('en-IN')}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => setSelectedCustomerId(customer.id)} className="text-brand-gold hover:underline">View Details</button>
                                </td>
                            </tr>
                        ))}
                         {customers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-gray-500">No customers found. Add one to get started!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
            {customers.map((customer) => (
                <div key={customer.id} onClick={() => setSelectedCustomerId(customer.id)} className="bg-white p-4 rounded-lg shadow-md border active:scale-95 transition-transform">
                    <div className="flex items-center">
                         <Avatar name={customer.name} className="w-12 h-12 mr-4"/>
                         <div className="flex-1">
                            <p className="font-bold">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.phone}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs text-red-500">Pending</p>
                            <p className="font-semibold text-red-600">₹{customer.pendingBalance.toLocaleString('en-IN')}</p>
                         </div>
                    </div>
                </div>
            ))}
             {customers.length === 0 && (
                <div className="text-center p-16 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">No customers found.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default CustomersPage;