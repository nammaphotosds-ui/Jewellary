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

// --- PDF Template (For Generation Only) ---
const CustomerProfileTemplate: React.FC<{customer: Customer, bills: Bill[]}> = ({customer, bills}) => {
    const logoUrl = "https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163";
    return (
        <div className="bg-white text-gray-800 relative font-sans" style={{ width: '1123px', height: '794px', display: 'flex', flexDirection: 'column' }}>
            {/* Background Logo */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img src={logoUrl} alt="Logo Watermark" className="w-2/3 h-2/3 object-contain opacity-10" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col flex-1">
                <header className="px-12 pt-8 pb-4 flex justify-between items-center border-b-2 border-brand-gold">
                    <div className="flex items-center">
                         <img src={logoUrl} alt="DEVAGIRIKAR JEWELLERYS Logo" className="w-24 h-24 object-contain mr-6" />
                        <div>
                             <h1 className="text-3xl font-bold font-serif tracking-wider text-brand-gold-dark" style={{ textShadow: '0px 1px 1px rgba(0,0,0,0.1)' }}>DEVAGIRIKAR JEWELLERYS</h1>
                             <p className="text-gray-600 text-base">EXCLUSIVE JEWELLERY SHOWROOM</p>
                        </div>
                    </div>
                    <h2 className="text-4xl font-serif font-bold text-brand-charcoal-light tracking-wider">Customer Profile</h2>
                </header>
                
                <main className="flex-1 px-12 py-6">
                    {/* Customer Details Card */}
                    <div className="bg-gradient-to-br from-brand-charcoal to-brand-charcoal-light text-white p-6 rounded-xl shadow-lg flex justify-between items-center mb-6">
                        <div>
                            <p className="text-sm uppercase tracking-widest text-brand-gold-light">Customer</p>
                            <h3 className="text-4xl font-serif font-bold">{customer.name}</h3>
                            <p className="font-mono text-gray-300 mt-1">{customer.id}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-semibold text-lg">{customer.phone}</p>
                             {customer.dob && <p className="text-sm text-gray-400">Birthday: {new Date(customer.dob).toLocaleDateString()}</p>}
                             <p className="text-sm text-gray-400">Joined: {new Date(customer.joinDate).toLocaleDateString()}</p>
                             <div className="mt-2 bg-red-500/20 text-red-200 px-4 py-2 rounded-lg">
                                <span className="text-sm">Pending Balance: </span>
                                <span className="font-bold text-lg">₹{customer.pendingBalance.toLocaleString('en-IN')}</span>
                             </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white p-4 rounded-lg border h-[480px] flex flex-col">
                         <h4 className="font-bold border-b pb-2 mb-2 text-xl text-brand-charcoal">Transaction History</h4>
                         <div className="overflow-y-auto flex-1">
                             <table className="w-full text-left">
                                <thead className="sticky top-0 bg-brand-charcoal text-white z-10">
                                    <tr>
                                        <th className="p-3 font-bold">Bill ID</th>
                                        <th className="p-3 font-bold">Date</th>
                                        <th className="p-3 font-bold">Type</th>
                                        <th className="p-3 font-bold text-right">Total (₹)</th>
                                        <th className="p-3 font-bold text-right">Balance (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map(bill => (
                                        <tr key={bill.id} className="border-b odd:bg-gray-50">
                                            <td className="p-3 text-sm font-mono">{bill.id}</td>
                                            <td className="p-3 text-sm">{new Date(bill.date).toLocaleDateString()}</td>
                                            <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${bill.type === 'INVOICE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{bill.type}</span></td>
                                            <td className="p-3 text-sm text-right">{bill.grandTotal.toLocaleString('en-IN')}</td>
                                            <td className="p-3 text-sm text-right font-semibold">{bill.balance > 0 ? <span className="text-red-600">{bill.balance.toLocaleString('en-IN')}</span> : 'Paid'}</td>
                                        </tr>
                                    ))}
                                    {bills.length === 0 && (<tr><td colSpan={5} className="text-center p-8 text-gray-500">No transactions found.</td></tr>)}
                                </tbody>
                             </table>
                         </div>
                    </div>
                </main>
                 <footer className="absolute bottom-8 left-12 right-12 text-center text-xs text-gray-600">
                    <p className="font-bold">DEVAGIRIKAR JEWELLERYS</p>
                    <p>1st Floor, Stall No.1&2, A.C.O. Complex, Bus-Stand Road, ILKAL-587125. Dist : Bagalkot.</p>
                    <p className="mt-1">GSTIN: 29BSWPD7616JZ0 | Phone: 9008604004 / 8618748300</p>
                </footer>
                <img src={logoUrl} alt="Logo" className="absolute bottom-8 right-12 w-16 h-16 object-contain opacity-50" />
            </div>
        </div>
    );
};

// --- Responsive On-Screen View ---
const OnScreenCustomerProfile: React.FC<{customer: Customer, bills: Bill[]}> = ({customer, bills}) => {
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
                                    <td className="p-2 text-xs font-mono">{bill.id}</td>
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

    const generatePdfBlob = async (): Promise<Blob | null> => {
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

        const canvas = await html2canvas(elementToCapture, { scale: 3 }); // Increased scale for better quality
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1123, 794] });
        pdf.addImage(imgData, 'JPEG', 0, 0, 1123, 794);
        
        root.unmount();
        document.body.removeChild(tempContainer);
        return pdf.output('blob');
    };

    const handleDownloadPdf = async () => {
        setIsProcessing(true);
        const blob = await generatePdfBlob();
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
            const blob = await generatePdfBlob();
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
            <OnScreenCustomerProfile customer={customer} bills={bills}/>
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