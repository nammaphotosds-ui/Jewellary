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
                    <header className="flex justify-between items-start pb-2 mb-4 border-b border-brand-gold-dark/30">
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
                    <section className="text-xs mb-4">
                        <p className="text-brand-gray text-xs font-bold uppercase tracking-wider">Billed To</p>
                        <p className="font-bold text-base text-brand-charcoal font-serif">{customer.name} ({customer.id})</p>
                        <p className="text-brand-gray">{customer.phone}</p>
                    </section>

                    {/* Items Table */}
                    <main className="flex-grow overflow-hidden">
                        <table className={`w-full border-collapse border border-brand-gold-dark/30 ${tableBaseFontSize}`}>
                            <thead className="border-b-2 border-brand-charcoal bg-brand-pale-gold/30">
                                <tr>
                                    <th className={`font-semibold text-left tracking-wider uppercase text-brand-charcoal w-[40%] border border-brand-gold-dark/30 ${tableCellClasses}`}>Item Name</th>
                                    <th className={`font-semibold text-right tracking-wider uppercase text-brand-charcoal border border-brand-gold-dark/30 ${tableCellClasses}`}>Weight (g)</th>
                                    <th className={`font-semibold text-right tracking-wider uppercase text-brand-charcoal border border-brand-gold-dark/30 ${tableCellClasses}`}>Qty</th>
                                    <th className={`font-semibold text-right tracking-wider uppercase text-brand-charcoal border border-brand-gold-dark/30 ${tableCellClasses}`}>Rate (₹)</th>
                                    <th className={`font-semibold text-right tracking-wider uppercase text-brand-charcoal border border-brand-gold-dark/30 ${tableCellClasses}`}>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.items.map(item => {
                                    const quantity = item.quantity || 1;
                                    const amount = item.price * quantity;
                                    return (
                                        <tr key={item.itemId} className="border-b border-brand-gold-dark/20">
                                            <td className={`font-medium border border-brand-gold-dark/30 ${tableCellClasses}`}>{item.name}</td>
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
                    <section className="mt-auto pt-4 border-t border-brand-gold-dark/30">
                        <div className="grid grid-cols-10 gap-6">
                            <div className="col-span-5 text-xs space-y-1">
                                <p className="text-[10px] italic text-gray-600 capitalize">{numberToWords(grandTotal)}</p>
                                <div className="mt-4 text-[10px] text-brand-gray">
                                    <p className="font-bold">Terms & Conditions:</p>
                                    <p>1. Goods once sold will not be taken back.</p>
                                </div>
                            </div>
                            <div className="col-span-5 text-xs">
                                <div className="space-y-1">
                                    <div className="flex justify-between"><span>Gross Wt:</span><span>{totalGrossWeight.toFixed(3)} g</span></div>
                                    {bill.lessWeight > 0 && <div className="flex justify-between"><span>Less Wt:</span><span>- {bill.lessWeight.toFixed(3)} g</span></div>}
                                    <div className="flex justify-between font-bold border-t border-gray-200 mt-1 pt-1"><span>Net Wt:</span><span>{netWeight.toFixed(3)} g</span></div>
                                </div>
                                <div className="space-y-1 mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex justify-between"><span>Subtotal:</span><span>₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                    {extraChargeAmount > 0 && <div className="flex justify-between"><span>Charges ({bill.extraChargePercentage}%):</span><span>+ ₹{extraChargeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                                    {bargainedAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span><span>- ₹{bargainedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                                    <div className="flex justify-between font-bold text-base mt-1 pt-1 border-t-2 border-brand-charcoal"><span>Grand Total:</span><span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                </div>
                                <div className="space-y-1 mt-2">
                                    <div className="flex justify-between font-bold"><span>Paid:</span><span>₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between font-bold text-red-600"><span>BALANCE DUE:</span><span>₹{bill.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-end mt-6">
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
                <p className="font-semibold text-xs">1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot. | Phone: 9008604004 / 8618748300</p>
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
                <p className="font-semibold text-xs">1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot. | Phone: 9008604004 / 8618748300</p>
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

const generateCustomerProfilePdfWithPagination = async (customer: Customer, bills: Bill[]): Promise<Blob | null> => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    // @ts-ignore
    const html2canvas = window.html2canvas;
    
    const BILLS_PER_PAGE = 8;
    const billChunks = [];
    if (bills.length > 0) {
        for (let i = 0; i < bills.length; i += BILLS_PER_PAGE) {
            billChunks.push(bills.slice(i, i + BILLS_PER_PAGE));
        }
    } else {
        billChunks.push([]);
    }

    const totalPages = billChunks.length;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });

    for (let i = 0; i < totalPages; i++) {
        const pageBills = billChunks[i];
        const pageNumber = i + 1;

        const componentToRender = (
            <CustomerProfileTemplate
                customer={customer}
                bills={pageBills}
                pageInfo={{ currentPage: pageNumber, totalPages: totalPages }}
            />
        );

        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.zIndex = '-1';
        document.body.appendChild(tempContainer);
        const root = ReactDOM.createRoot(tempContainer);

        const canvas = await new Promise<HTMLCanvasElement | null>((resolve) => {
            root.render(componentToRender);
            setTimeout(async () => {
                const elementToCapture = tempContainer.children[0] as HTMLElement;
                 if (!elementToCapture) {
                    console.error("PDF generation failed: Component did not render.");
                    resolve(null);
                    return;
                }
                const images = Array.from(elementToCapture.getElementsByTagName('img'));
                await Promise.all(images.map(img => new Promise<void>(res => {
                    if (img.complete) return res();
                    img.onload = () => res();
                    img.onerror = () => res();
                })));
                await new Promise(r => setTimeout(r, 200));
                
                const capturedCanvas = await html2canvas(elementToCapture, { scale: 2, useCORS: true, windowWidth: elementToCapture.scrollWidth, windowHeight: elementToCapture.scrollHeight });
                resolve(capturedCanvas);
            }, 300);
        });
        
        root.unmount();
        if(document.body.contains(tempContainer)){
            document.body.removeChild(tempContainer);
        }
        
        if (canvas) {
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            if (i > 0) {
                pdf.addPage('a5', 'landscape');
            }
            const margin = 8;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pdfWidth - margin * 2;
            const contentHeight = pdfHeight - margin * 2;
            pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
        }
    }

    return pdf.output('blob');
};

const CustomerDetailsView: React.FC<{customer: Customer, onBack: () => void}> = ({customer, onBack}) => {
    const { getBillsByCustomerId, deleteCustomer } = useAppContext();
    const bills = getBillsByCustomerId(customer.id);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGeneratingBillPdf, setIsGeneratingBillPdf] = useState<string | null>(null);

    const handleDownloadPdf = async () => {
        setIsProcessing(true);
        const blob = await generateCustomerProfilePdfWithPagination(customer, bills);
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
            const blob = await generateCustomerProfilePdfWithPagination(customer, bills);
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
            const blob = await generateSinglePagePdfBlob(<InvoiceTemplate bill={bill} customer={customer} />);
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