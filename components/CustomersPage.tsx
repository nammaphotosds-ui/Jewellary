import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useAppContext } from '../context/AppContext';
import type { Customer, Bill } from '../types';
// FIX: Removed unused import to prevent potential circular dependencies.


// --- Helper Functions & Components ---

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
    const totalGrossWeight = bill.items.reduce((sum, item) => sum + (item.weight * (item.quantity || 1)), 0);
    const { grandTotal, netWeight, extraChargeAmount, bargainedAmount, finalAmount, amountPaid } = bill;
    const logoUrl = "https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163";
    
    const isCompact = bill.items.length > 8;
    const tableCellClasses = isCompact ? 'py-0.5 px-2' : 'py-1 px-2';
    const tableBaseFontSize = isCompact ? 'text-[11px]' : 'text-xs';


    return (
        <div className="bg-brand-cream text-brand-charcoal font-sans flex flex-col" style={{ width: '842px', height: '595px', boxSizing: 'border-box' }}>
            <div className="flex-grow relative">
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
                    <header className="flex justify-between items-start pb-2 mb-2 border-b border-brand-gold-dark/30">
                        <div className="flex items-center">
                            <img src={logoUrl} alt="Logo" className="w-16 h-16" />
                            <div className="ml-3">
                                <h2 className="text-3xl font-serif tracking-wider font-bold text-brand-charcoal">DEVAGIRIKAR</h2>
                                <p className="text-lg text-brand-gold-dark tracking-[0.15em] -mt-1">JEWELLERYS</p>
                                <p className="text-[10px] tracking-widest text-brand-gray mt-1">EXCLUSIVE JEWELLERY SHOWROOM</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-4xl font-serif font-light text-brand-gold-dark tracking-widest">{bill.type}</h1>
                            <p className="text-xs mt-1 font-mono"><strong>Bill No:</strong> {bill.id}</p>
                            <p className="text-xs font-mono"><strong>GSTIN:</strong> 29BSWPD7616JZ0</p>
                            <p className="text-xs font-mono"><strong>Date:</strong> {new Date(bill.date).toLocaleDateString()}</p>
                        </div>
                    </header>

                    {/* Customer Details */}
                    <section className="text-xs mb-2">
                        <p className="text-brand-gray text-xs font-bold uppercase tracking-wider">Billed To</p>
                        <p className="font-bold text-base text-brand-charcoal font-serif">{customer.name} ({customer.id})</p>
                        <p className="text-brand-gray">{customer.phone}</p>
                    </section>

                    {/* Items Table */}
                    <main className="flex-grow overflow-hidden">
                        <table className={`w-full border-collapse border border-brand-gold-dark/30 ${tableBaseFontSize}`}>
                            <thead className="border-b-2 border-brand-charcoal bg-brand-pale-gold/30">
                                <tr>
                                    <th className={`font-semibold text-left tracking-wider uppercase text-brand-charcoal w-[35%] border border-brand-gold-dark/30 ${tableCellClasses}`}>Item Name</th>
                                    <th className={`font-semibold text-left tracking-wider uppercase text-brand-charcoal w-[15%] border border-brand-gold-dark/30 ${tableCellClasses}`}>Item ID</th>
                                    <th className={`font-semibold text-right tracking-wider uppercase text-brand-charcoal w-[10%] border border-brand-gold-dark/30 ${tableCellClasses}`}>Weight (g)</th>
                                    <th className={`font-semibold text-right tracking-wider uppercase text-brand-charcoal w-[10%] border border-brand-gold-dark/30 ${tableCellClasses}`}>Qty</th>
                                    <th className={`font-semibold text-right tracking-wider uppercase text-brand-charcoal w-[15%] border border-brand-gold-dark/30 ${tableCellClasses}`}>Rate (₹)</th>
                                    <th className={`font-semibold text-right tracking-wider uppercase text-brand-charcoal w-[15%] border border-brand-gold-dark/30 ${tableCellClasses}`}>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.items.map(item => {
                                    const quantity = item.quantity || 1;
                                    const amount = item.price * quantity;
                                    return (
                                        <tr key={item.itemId} className="border-b border-brand-gold-dark/20">
                                            <td className={`font-medium border border-brand-gold-dark/30 ${tableCellClasses}`}>{item.name}</td>
                                            <td className={`font-mono text-xs border border-brand-gold-dark/30 ${tableCellClasses}`}>{item.itemId}</td>
                                            <td className={`text-right font-mono border border-brand-gold-dark/30 ${tableCellClasses}`}>{item.weight.toFixed(3)}</td>
                                            <td className={`text-right font-mono border border-brand-gold-dark/30 ${tableCellClasses}`}>{quantity}</td>
                                            <td className={`text-right font-mono border border-brand-gold-dark/30 ${tableCellClasses}`}>{item.price.toLocaleString('en-IN')}</td>
                                            <td className={`text-right font-mono border border-brand-gold-dark/30 ${tableCellClasses}`}>{amount.toLocaleString('en-IN')}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </main>

                    {/* Summary Section */}
                    <section className="mt-auto pt-2 border-t border-brand-gold-dark/30">
                        <div className="flex justify-between items-start">
                             <div className="w-1/2 pr-4 text-xs">
                                <p className="font-bold text-gray-700 capitalize">{numberToWords(grandTotal)}</p>
                                <div className="mt-4 text-[10px] text-brand-gray">
                                    <p className="font-bold">Terms & Conditions:</p>
                                    <p>1. Goods once sold will not be taken back.</p>
                                </div>
                            </div>
                            <div className="w-1/2 text-xs">
                                <div className="space-y-1">
                                    <div className="flex justify-between"><span>Gross Wt:</span><span>{totalGrossWeight.toFixed(3)} g</span></div>
                                    {bill.lessWeight > 0 && <div className="flex justify-between"><span>Less Wt:</span><span>- {bill.lessWeight.toFixed(3)} g</span></div>}
                                    <div className="flex justify-between font-bold border-t border-gray-200 mt-1 pt-1"><span>Net Wt:</span><span>{netWeight.toFixed(3)} g</span></div>
                                </div>
                                <div className="space-y-1 mt-2 pt-2 border-t border-gray-200">
                                    <div className="flex justify-between"><span>Subtotal:</span><span>₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                    {extraChargeAmount > 0 && <div className="flex justify-between"><span>Charges ({bill.extraChargePercentage}%):</span><span>+ ₹{extraChargeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                                    {bargainedAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span><span>- ₹{bargainedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                                    <div className="flex justify-between text-base mt-1 pt-1 border-t-2 border-brand-charcoal">
                                        <span className="font-bold">Grand Total:</span>
                                        <span className="font-bold">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div className="space-y-1 mt-2">
                                    <div className="flex justify-between">
                                        <span className="font-bold">Paid:</span>
                                        <span>₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className={`flex justify-between ${bill.balance > 0 ? 'text-red-600' : 'text-green-700'}`}>
                                        <span className="font-bold">{bill.balance > 0 ? 'BALANCE DUE:' : 'Status:'}</span>
                                        <span className="font-bold">
                                            {bill.balance > 0 
                                                ? `₹${bill.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                                : 'Fully Paid'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                            <p className="text-[10px] text-brand-gray">Thank you for your business!</p>
                            <div className="text-center">
                                <div className="w-40 border-t border-brand-charcoal pt-1"></div>
                                <p className="text-[10px]">Authorised Signatory</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <footer className="text-center text-brand-charcoal pt-1 pb-2 px-8 flex-shrink-0">
                <div className="border-t-2 border-brand-charcoal mb-1 mx-auto w-full"></div>
                <p className="font-bold text-xs">1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot. | Phone: 9008604004 / 8618748300</p>
            </footer>
        </div>
    );
};


// New Redesigned Customer Profile Template
const CustomerProfileTemplate: React.FC<{
    customer: Customer, 
    bills: Bill[],
    pageInfo?: { currentPage: number, totalPages: number }
}> = ({customer, bills, pageInfo}) => {
     const logoUrl = "https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163";
    return (
        <div className="bg-brand-cream text-brand-charcoal font-sans flex flex-col" style={{ width: '1123px', height: '797px', boxSizing: 'border-box' }}>
            <div className="flex-grow relative">
                 {/* Decorative Border */}
                <div className="absolute inset-0 border-[1px] border-brand-gold-dark/30 z-0"></div>
                <div className="absolute inset-2 border-[8px] border-brand-pale-gold z-0"></div>
                <div className="absolute inset-4 border-[1px] border-brand-gold-dark/50 z-0"></div>

                {/* Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.06]">
                    <img src={logoUrl} alt="Watermark" className="w-[350px]"/>
                </div>
                <div className="relative z-10 p-8 flex flex-col h-full">
                    <header className="flex justify-between items-start pb-4 mb-6 border-b border-brand-gold-dark/30">
                        <div className="flex items-center">
                            <img src={logoUrl} alt="Logo" className="w-20 h-20" />
                            <div className="ml-4">
                                <h2 className="text-4xl font-serif tracking-wider font-bold text-brand-charcoal">DEVAGIRIKAR</h2>
                                <p className="text-xl text-brand-gold-dark tracking-[0.15em] -mt-1">JEWELLERYS</p>
                                <p className="text-xs tracking-widest text-brand-gray mt-2">EXCLUSIVE JEWELLERY SHOWROOM</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-4xl font-serif font-light text-brand-gold-dark tracking-wider">Customer Statement</h1>
                            <p className="text-sm mt-2 font-mono">Generated: {new Date().toLocaleDateString()}</p>
                            {pageInfo && pageInfo.totalPages > 1 && (
                                <p className="text-xs font-mono mt-1">Page {pageInfo.currentPage} of {pageInfo.totalPages}</p>
                            )}
                        </div>
                    </header>

                    {(!pageInfo || pageInfo.currentPage === 1) && (
                        <section className="grid grid-cols-2 gap-8 mb-6">
                            <div className="text-sm">
                                <p className="text-brand-gray text-sm font-bold uppercase tracking-wider">Statement For</p>
                                <p className="font-bold text-2xl text-brand-charcoal font-serif">{customer.name}</p>
                                <p className="text-brand-gray">{customer.phone}</p>
                                <p className="font-mono text-xs text-gray-500">ID: {customer.id}</p>
                                <p className="text-xs mt-2">Member Since: {new Date(customer.joinDate).toLocaleDateString()}</p>
                                {customer.dob && <p className="text-xs">Birthday: {new Date(customer.dob).toLocaleDateString()}</p>}
                            </div>
                            <div className="p-4 rounded-lg bg-brand-pale-gold/40 border border-brand-gold-dark/30 text-center flex flex-col justify-center">
                                <h3 className="text-sm font-semibold text-brand-charcoal uppercase tracking-wider">Total Pending Balance</h3>
                                <p className="text-5xl font-bold text-red-600 font-sans">₹{customer.pendingBalance.toLocaleString('en-IN')}</p>
                            </div>
                        </section>
                    )}

                    <main className="flex-grow">
                        <h3 className="text-lg font-semibold mb-2 font-serif text-brand-charcoal">Transaction History</h3>
                        <div className="border border-brand-gold-dark/20 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-brand-pale-gold/50">
                                    <tr>
                                        <th className="px-3 py-2 font-semibold text-brand-charcoal tracking-wider">Date</th>
                                        <th className="px-3 py-2 font-semibold text-brand-charcoal tracking-wider">Bill No.</th>
                                        <th className="px-3 py-2 font-semibold text-brand-charcoal tracking-wider">Type</th>
                                        <th className="px-3 py-2 text-right font-semibold text-brand-charcoal tracking-wider">Total (₹)</th>
                                        <th className="px-3 py-2 text-right font-semibold text-brand-charcoal tracking-wider">Paid (₹)</th>
                                        <th className="px-3 py-2 text-right font-semibold text-brand-charcoal tracking-wider">Balance (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.length > 0 ? bills.map((bill) => (
                                        <tr key={bill.id} className="border-t border-brand-gold-dark/20">
                                            <td className="px-3 py-2">{new Date(bill.date).toLocaleDateString()}</td>
                                            <td className="px-3 py-2 font-mono text-xs">{bill.id}</td>
                                            <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${bill.type === 'INVOICE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{bill.type}</span></td>
                                            <td className="px-3 py-2 text-right font-mono">{bill.grandTotal.toLocaleString('en-IN')}</td>
                                            <td className="px-3 py-2 text-right text-green-700 font-mono">{bill.amountPaid.toLocaleString('en-IN')}</td>
                                            <td className={`px-3 py-2 text-right font-bold font-mono ${bill.balance > 0 ? 'text-red-600' : 'text-gray-500'}`}>{bill.balance.toLocaleString('en-IN')}</td>
                                        </tr>
                                    )) : (
                                    <tr><td colSpan={6} className="text-center p-8 text-gray-500">No transactions found for this customer.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </main>
                </div>
            </div>
            <footer className="text-center text-brand-charcoal pt-1 pb-2 px-8 flex-shrink-0">
                <div className="border-t-2 border-brand-charcoal mb-1 mx-auto w-full"></div>
                <p className="font-bold text-xs">1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot. | Phone: 9008604004 / 8618748300</p>
            </footer>
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
                <div className="max-h-[400px] overflow-auto">
                     <table className="min-w-full w-full text-left">
                        <thead className="sticky top-0 bg-gray-100 z-10">
                            <tr>
                                <th className="p-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Date</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Bill ID</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Type</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 text-right whitespace-nowrap">Total (₹)</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 text-right whitespace-nowrap">Paid (₹)</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 text-right whitespace-nowrap">Balance (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map(bill => (
                                <tr key={bill.id} className="border-b">
                                    <td className="p-2 text-sm whitespace-nowrap">{new Date(bill.date).toLocaleDateString()}</td>
                                    <td className="p-2 text-xs font-mono whitespace-nowrap">
                                         <button
                                            onClick={() => onBillClick(bill)}
                                            disabled={!!generatingBillId}
                                            className="text-blue-600 hover:underline disabled:text-gray-500 disabled:no-underline"
                                        >
                                            {generatingBillId === bill.id ? 'Generating...' : bill.id}
                                        </button>
                                    </td>
                                    <td className="p-2 text-sm whitespace-nowrap">{bill.type}</td>
                                    <td className="p-2 text-sm text-right whitespace-nowrap">{bill.grandTotal.toLocaleString('en-IN')}</td>
                                    <td className="p-2 text-sm text-right text-green-700 whitespace-nowrap">{bill.amountPaid.toLocaleString('en-IN')}</td>
                                    <td className="p-2 text-sm text-right font-semibold whitespace-nowrap">{bill.balance > 0 ? <span className="text-red-600">{bill.balance.toLocaleString('en-IN')}</span> : 'Paid'}</td>
                                </tr>
                            ))}
                            {bills.length === 0 && (<tr><td colSpan={6} className="text-center p-8 text-gray-500">No transactions found.</td></tr>)}
                        </tbody>
                     </table>
                </div>
            </div>
        </div>
    );
};

const generateSinglePagePdfBlob = (componentToRender: React.ReactElement): Promise<Blob | null> => {
    return new Promise(resolve => {
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

        const captureAndCleanup = async () => {
            try {
                const elementToCapture = tempContainer.children[0] as HTMLElement;
                if (!elementToCapture) {
                    console.error("PDF generation failed: Component did not render.");
                    resolve(null);
                    return;
                }
                
                // Wait for images to load
                const images = Array.from(elementToCapture.getElementsByTagName('img'));
                await Promise.all(images.map(img => new Promise<void>(res => {
                    if (img.complete) return res();
                    img.onload = () => res();
                    img.onerror = () => res(); // Resolve even on error to not block PDF
                })));

                // Added delay for fonts and final rendering
                await new Promise(r => setTimeout(r, 200));

                const canvas = await html2canvas(elementToCapture, { scale: 2, useCORS: true, windowWidth: elementToCapture.scrollWidth, windowHeight: elementToCapture.scrollHeight });
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
                const margin = 8;
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const contentWidth = pdfWidth - margin * 2;
                const contentHeight = pdfHeight - margin * 2;
                
                pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
                resolve(pdf.output('blob'));

            } catch (error) {
                console.error("Error during PDF generation process:", error);
                resolve(null);
            } finally {
                root.unmount();
                if (document.body.contains(tempContainer)) {
                    document.body.removeChild(tempContainer);
                }
            }
        };

        root.render(componentToRender);
        // Use setTimeout to ensure React has flushed the render to the DOM
        setTimeout(captureAndCleanup, 300);
    });
};

// FIX: Completed the function to handle PDF generation with pagination.
const generateCustomerProfilePdfWithPagination = async (customer: Customer, bills: Bill[]): Promise<Blob | null> => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    // @ts-ignore
    const html2canvas = window.html2canvas;
    
    const BILLS_PER_PAGE = 15;
    const totalPages = Math.ceil(bills.length / BILLS_PER_PAGE) || 1;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.zIndex = '-1';
    document.body.appendChild(tempContainer);
    
    const root = ReactDOM.createRoot(tempContainer);

    try {
        for (let i = 0; i < totalPages; i++) {
            const billChunk = bills.slice(i * BILLS_PER_PAGE, (i + 1) * BILLS_PER_PAGE);
            const pageInfo = { currentPage: i + 1, totalPages };

            // Render component for the current page
            await new Promise<void>(resolve => {
                root.render(<CustomerProfileTemplate customer={customer} bills={billChunk} pageInfo={pageInfo} />);
                setTimeout(resolve, 300); // Allow time for render
            });

            const elementToCapture = tempContainer.children[0] as HTMLElement;
            if (!elementToCapture) {
                console.error(`PDF generation failed on page ${i + 1}: Component did not render.`);
                continue;
            }

            // Wait for images
            const images = Array.from(elementToCapture.getElementsByTagName('img'));
            await Promise.all(images.map(img => new Promise<void>(res => {
                if (img.complete) return res();
                img.onload = () => res();
                img.onerror = () => res();
            })));

            await new Promise(r => setTimeout(r, 200));

            const canvas = await html2canvas(elementToCapture, { scale: 2, useCORS: true, windowWidth: elementToCapture.scrollWidth, windowHeight: elementToCapture.scrollHeight });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            if (i > 0) {
                pdf.addPage('a4', 'landscape');
            }
            
            const margin = 8;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pdfWidth - margin * 2;
            const contentHeight = pdfHeight - margin * 2;
            pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
        }
        
        return pdf.output('blob');

    } catch (error) {
        console.error("Error during multi-page PDF generation process:", error);
        return null;
    } finally {
        root.unmount();
        if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
        }
    }
};

// FIX: Added the main CustomersPage component and its export.
export const CustomersPage: React.FC = () => {
    const { customers, getBillsByCustomerId, deleteCustomer } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [generatingBillId, setGeneratingBillId] = useState<string | null>(null);

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));

    const handleGenerateInvoicePdf = async (bill: Bill) => {
        if (!selectedCustomer) return;
        setGeneratingBillId(bill.id);
        const blob = await generateSinglePagePdfBlob(<InvoiceTemplate bill={bill} customer={selectedCustomer} />);
        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${bill.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('Failed to generate PDF for the invoice.');
        }
        setGeneratingBillId(null);
    };

    const handleGenerateProfilePdf = async () => {
        if (!selectedCustomer) return;
        setGeneratingPdf(true);
        const bills = getBillsByCustomerId(selectedCustomer.id);
        const blob = await generateCustomerProfilePdfWithPagination(selectedCustomer, bills);
        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `customer-profile-${selectedCustomer.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('Failed to generate PDF for the customer profile.');
        }
        setGeneratingPdf(false);
    };

    const handleDeleteCustomer = async () => {
        if (selectedCustomer && window.confirm(`Are you sure you want to delete ${selectedCustomer.name}? This will also delete all their bills and is irreversible.`)) {
            await deleteCustomer(selectedCustomer.id);
            setSelectedCustomer(null); // Go back to the list
        }
    };

    if (selectedCustomer) {
        const customerBills = getBillsByCustomerId(selectedCustomer.id);
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setSelectedCustomer(null)} className="flex items-center text-gray-600 hover:text-brand-charcoal transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Customer List
                    </button>
                    <div className="flex gap-2">
                        <button onClick={handleGenerateProfilePdf} disabled={generatingPdf} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400">
                            {generatingPdf ? 'Generating...' : 'Download Profile'}
                        </button>
                         <button onClick={handleDeleteCustomer} className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
                            Delete Customer
                        </button>
                    </div>
                </div>
                <OnScreenCustomerProfile 
                    customer={selectedCustomer} 
                    bills={customerBills}
                    onBillClick={handleGenerateInvoicePdf}
                    generatingBillId={generatingBillId}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-2xl font-bold">Customers</h1>
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 p-2 pl-10 border rounded-lg"
                    />
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr className="border-b">
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Contact</th>
                                <th className="p-4 font-semibold text-right">Pending Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                             {filteredCustomers.map(customer => (
                                <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className="border-b hover:bg-gray-100 cursor-pointer">
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <Avatar name={customer.name} className="w-10 h-10 mr-4" />
                                            <div>
                                                <p className="font-bold">{customer.name}</p>
                                                <p className="text-xs font-mono text-gray-500">{customer.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p>{customer.phone}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`font-semibold ${customer.pendingBalance > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                            ₹{customer.pendingBalance.toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center p-8 text-gray-500">No customers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};