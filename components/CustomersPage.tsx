import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useAppContext } from '../context/AppContext';
import type { Customer, Bill } from '../types';
import Logo from './Logo';


// --- Helper Functions & Components ---

const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className={`flex items-center justify-center rounded-full bg-brand-gold-light text-brand-gold-dark ${className}`}>
            <span className="font-serif text-xl">{initial}</span>
        </div>
    );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                {children}
            </div>
        </div>
    );
};

const AddCustomerForm: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { addCustomer } = useAppContext();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (name && phone) {
            await addCustomer({
                name,
                phone,
                dob: dob || undefined,
            });
            onClose();
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Customer Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
            <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded" required />
            <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth (Optional)</label>
                <input type="date" id="dob" value={dob} onChange={e => setDob(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-gold text-brand-charcoal p-3 rounded-lg font-semibold hover:bg-brand-gold-dark transition disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Add Customer'}
            </button>
        </form>
    );
};

// --- PDF Template (For Generation Only) ---
const CustomerProfileTemplate: React.FC<{customer: Customer, bills: Bill[]}> = ({customer, bills}) => {
    const logoUrl = "https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163";
    return (
        <div className="bg-white text-gray-800 relative" style={{ width: '1123px', height: '794px', display: 'flex', flexDirection: 'column' }}>
            {/* Background Logo */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img src={logoUrl} alt="Logo" className="w-2/3 h-2/3 object-contain opacity-5" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col flex-1">
                <header className="px-12 pt-8 pb-4 flex justify-between items-center border-b-2 border-brand-gold">
                    <div className="flex items-center">
                         <img src={logoUrl} alt="DEVAGIRIKAR JEWELLERYS Logo" className="w-20 h-20 object-contain mr-4" />
                        <div>
                             <h1 className="text-2xl font-bold font-serif tracking-wider text-brand-gold-dark" style={{ textShadow: '0px 1px 1px rgba(0,0,0,0.1)' }}>DEVAGIRIKAR JEWELLERYS</h1>
                            <p className="text-sm text-gray-600 mt-1">Jewelry store in Ilkal, Karnataka</p>
                        </div>
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-brand-charcoal-light">Customer Profile</h2>
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
                             <p className="font-semibold">{customer.phone}</p>
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
                                <thead className="sticky top-0 bg-gray-100 z-10">
                                    <tr>
                                        <th className="p-2 font-semibold">Bill ID</th>
                                        <th className="p-2 font-semibold">Date</th>
                                        <th className="p-2 font-semibold">Type</th>
                                        <th className="p-2 font-semibold text-right">Total (₹)</th>
                                        <th className="p-2 font-semibold text-right">Balance (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map(bill => (
                                        <tr key={bill.id} className="border-b odd:bg-gray-50">
                                            <td className="p-2 text-xs font-mono">{bill.id}</td>
                                            <td className="p-2">{new Date(bill.date).toLocaleDateString()}</td>
                                            <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${bill.type === 'INVOICE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{bill.type}</span></td>
                                            <td className="p-2 text-right">{bill.grandTotal.toLocaleString('en-IN')}</td>
                                            <td className="p-2 text-right font-semibold">{bill.balance > 0 ? <span className="text-red-600">{bill.balance.toLocaleString('en-IN')}</span> : 'Paid'}</td>
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
                    <p>GSTIN: 29BSWPD7616JZ0 | Phone: 9008604004 / 8618748300</p>
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
    const { getBillsByCustomerId } = useAppContext();
    const bills = getBillsByCustomerId(customer.id);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const generatePdf = async () => {
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
        root.render(<CustomerProfileTemplate customer={customer} bills={bills} />);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        const elementToCapture = tempContainer.children[0] as HTMLElement;

        if (elementToCapture) {
            const canvas = await html2canvas(elementToCapture, { scale: 2 });
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1123, 794] });
            pdf.addImage(imgData, 'JPEG', 0, 0, 1123, 794);
            pdf.save(`profile-${customer.id}.pdf`);
        }

        root.unmount();
        document.body.removeChild(tempContainer);
        setIsGeneratingPdf(false);
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
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-charcoal">Customer Profile</h1>
                </div>
                <button onClick={generatePdf} disabled={isGeneratingPdf} className="bg-brand-gold text-brand-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-brand-gold-dark transition flex items-center justify-center shadow-md disabled:bg-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    {isGeneratingPdf ? 'Generating...' : 'Generate PDF Profile'}
                </button>
            </div>
            <OnScreenCustomerProfile customer={customer} bills={bills}/>
        </div>
    );
};

// --- Main CustomersPage ---
const CustomersPage: React.FC = () => {
  const { customers } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  if (selectedCustomer) {
      return <CustomerDetailsView customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-serif tracking-wide text-brand-charcoal" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>
                    Customers
                </h1>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="hidden md:flex bg-brand-gold text-brand-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-brand-gold-dark transition flex items-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add New Customer
            </button>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="md:hidden fixed bottom-24 right-6 bg-brand-gold text-brand-charcoal w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-20" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer">
            <AddCustomerForm onClose={() => setIsModalOpen(false)} />
        </Modal>

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
                                    <button onClick={() => setSelectedCustomer(customer)} className="text-brand-gold hover:underline">View Details</button>
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
                <div key={customer.id} onClick={() => setSelectedCustomer(customer)} className="bg-white p-4 rounded-lg shadow-md border active:scale-95 transition-transform">
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