import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useAppContext } from '../context/AppContext';
import type { Customer, Bill } from '../types';
import Logo from './Logo';
import { SendIcon } from '../App';


// --- Helper Functions & Components ---

const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className={`flex items-center justify-center rounded-full bg-brand-gold-light text-brand-gold-dark ${className}`}>
            <span className="font-serif text-xl">{initial}</span>
        </div>
    );
};

// Helper function to convert numbers to Indian currency words (Copied from BillingPage)
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

// New Redesigned Invoice Template for PDF Generation
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


// New Redesigned Customer Profile Template
const CustomerProfileTemplate: React.FC<{customer: Customer, bills: Bill[]}> = ({customer, bills}) => {
    const logoUrl = "https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163";
    return (
        <div className="bg-white text-brand-charcoal font-sans" style={{ width: '794px', height: '1123px', boxSizing: 'border-box', padding: '40px' }}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <header className="text-center">
                    <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain mx-auto" />
                    <h1 className="text-4xl font-serif font-bold text-brand-gold-dark mt-2">DEVAGIRIKAR JEWELLERYS</h1>
                    <p className="text-sm text-brand-gray">EXCLUSIVE JEWELLERY SHOWROOM</p>
                </header>
                <hr className="my-4 border-t border-brand-gold/50" />
                <h2 className="text-3xl font-serif font-bold text-center text-brand-charcoal-light mb-6">Customer Statement</h2>

                {/* Customer Info */}
                <section className="flex justify-between items-start text-sm border p-4 rounded-lg">
                    <div>
                        <p className="font-bold text-base">{customer.name}</p>
                        <p className="text-brand-gray">{customer.phone}</p>
                        <p className="text-brand-gray font-mono text-xs">ID: {customer.id}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>Member Since:</strong> {new Date(customer.joinDate).toLocaleDateString()}</p>
                        {customer.dob && <p><strong>Birthday:</strong> {new Date(customer.dob).toLocaleDateString()}</p>}
                        <p><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                </section>

                {/* Pending Balance */}
                <section className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-center">
                    <h3 className="text-sm font-semibold text-red-700 uppercase">Total Pending Balance</h3>
                    <p className="text-4xl font-bold text-red-600">₹{customer.pendingBalance.toLocaleString('en-IN')}</p>
                </section>

                {/* Transactions Table */}
                <main className="flex-1 mt-6 flex flex-col h-0">
                    <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
                    <div className="flex-grow overflow-y-auto border rounded-t-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-brand-charcoal text-white sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 font-semibold">Date</th>
                                    <th className="px-3 py-2 font-semibold">Bill No.</th>
                                    <th className="px-3 py-2 font-semibold">Type</th>
                                    <th className="px-3 py-2 text-right font-semibold">Total (₹)</th>
                                    <th className="px-3 py-2 text-right font-semibold">Paid (₹)</th>
                                    <th className="px-3 py-2 text-right font-semibold">Balance (₹)</th>
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
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-auto pt-4 border-t border-brand-gold/50 text-center text-xs text-brand-gray">
                    <p className="font-bold">DEVAGIRIKAR JEWELLERYS</p>
                    <p>1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot.</p>
                    <p>Phone: 9008604004 / 8618748300 | GSTIN: 29BSWPD7616JZ0</p>
                    <p className="mt-2 text-gray-400">This is a computer-generated statement.</p>
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
                <Avatar name={customer.name} className="w-24 h-24 md:w-32 md:h-32 !text-5xl border-4 border-brand-gold-light shadow-lg"/>
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

    const generateProfilePdfBlob = async (): Promise<Blob | null> => {
        // @ts-ignore
        const { jsPDF } = window.jspdf;
        // @ts-ignore
        const html2canvas = window.html2canvas;
    
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);
        
        const root = ReactDOM.createRoot(tempContainer);
        root.render(<CustomerProfileTemplate customer={customer} bills={bills} />);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        const elementToCapture = tempContainer.children[0] as HTMLElement;
    
        if (!elementToCapture) {
            root.unmount();
            document.body.removeChild(tempContainer);
            return null;
        }

        const canvas = await html2canvas(elementToCapture, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        root.unmount();
        document.body.removeChild(tempContainer);
        return pdf.output('blob');
    };
    
    const generateBillPdfBlob = async (bill: Bill): Promise<Blob | null> => {
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
        const elementToCapture = tempContainer.children[0] as HTMLElement;

        if (!elementToCapture) {
            root.unmount();
            document.body.removeChild(tempContainer);
            return null;
        }

        const canvas = await html2canvas(elementToCapture, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        root.unmount();
        document.body.removeChild(tempContainer);
        return pdf.output('blob');
    };

    const handleDownloadPdf = async () => {
        setIsProcessing(true);
        const blob = await generateProfilePdfBlob();
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
            const blob = await generateProfilePdfBlob();
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
            const blob = await generateBillPdfBlob(bill);
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