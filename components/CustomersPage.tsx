import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useAppContext } from '../context/AppContext';
import type { Customer, Bill } from '../types';
import Logo from './Logo';


// --- Helper Functions & Components ---

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
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
    const [photo, setPhoto] = useState<File | null>(null);
    const [addressProof, setAddressProof] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (name && phone) {
            const photoUrl = photo ? await fileToBase64(photo) : undefined;
            const addressProofUrl = addressProof ? await fileToBase64(addressProof) : undefined;

            addCustomer({
                name,
                phone,
                photoUrl,
                addressProofUrl
            });
            onClose();
        }
        setIsSubmitting(false);
    };
    
    const FileInput: React.FC<{label: string, file: File | null, onFileChange: (file: File | null) => void, id: string}> = ({label, file, onFileChange, id}) => (
         <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 flex items-center space-x-4">
                {file && <img src={URL.createObjectURL(file)} alt="preview" className="w-12 h-12 rounded-full object-cover"/>}
                <label htmlFor={id} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    <span>{file ? 'Change' : 'Upload'}</span>
                    <input id={id} name={id} type="file" className="sr-only" onChange={e => onFileChange(e.target.files ? e.target.files[0] : null)}/>
                </label>
                 {file && <button type="button" onClick={() => onFileChange(null)} className="text-sm text-red-600">Remove</button>}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Customer Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
            <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded" required />
            <FileInput label="Customer Photo" file={photo} onFileChange={setPhoto} id="photo-upload"/>
            <FileInput label="Address Proof" file={addressProof} onFileChange={setAddressProof} id="address-proof-upload"/>
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-gold text-brand-dark p-3 rounded-lg font-semibold hover:bg-brand-gold-dark transition disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Add Customer'}
            </button>
        </form>
    );
};

// --- PDF Template (For Generation Only) ---
const CustomerProfileTemplate: React.FC<{customer: Customer, bills: Bill[]}> = ({customer, bills}) => {
    return (
        <div className="bg-white text-gray-800" style={{ width: '1123px', height: '794px', display: 'flex', flexDirection: 'column' }}>
            <header className="px-12 pt-8 pb-4 flex justify-between items-center border-b-2 border-brand-gold">
                <div>
                    <Logo className="text-brand-dark" simple={true} />
                    <p className="text-sm text-gray-600 mt-1">Jewelry store in Ilkal, Karnataka</p>
                </div>
                <h2 className="text-3xl font-serif font-bold text-brand-dark-light">Customer Profile</h2>
            </header>
            <main className="flex-1 flex px-12 py-6 gap-8">
                {/* Left Column */}
                <div className="w-1/3 flex flex-col gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-md bg-gray-200 flex items-center justify-center">
                            <img src={customer.photoUrl || 'https://picsum.photos/200'} alt={customer.name} className="w-full h-full rounded-full" style={{objectFit: 'contain'}}/>
                        </div>
                        <h3 className="text-2xl font-bold text-center">{customer.name}</h3>
                        <p className="text-center text-gray-500 font-mono">{customer.id}</p>
                    </div>
                     <div className="bg-gray-50 p-4 rounded-lg border flex-1">
                        <h4 className="font-bold border-b pb-2 mb-2">Contact Details</h4>
                        <p><strong>Phone:</strong> {customer.phone}</p>
                        <p><strong>Joined:</strong> {new Date(customer.joinDate).toLocaleDateString()}</p>
                        <h4 className="font-bold border-b pb-2 mb-2 mt-4">Financials</h4>
                        <p><strong>Pending:</strong> <span className="font-bold text-red-600">₹{customer.pendingBalance.toLocaleString('en-IN')}</span></p>
                    </div>
                    {customer.addressProofUrl && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                             <h4 className="font-bold border-b pb-2 mb-2">Address Proof</h4>
                             <img src={customer.addressProofUrl} alt="Address Proof" className="w-full rounded-md object-contain max-h-32 bg-gray-200" style={{objectFit: 'contain'}}/>
                        </div>
                    )}
                </div>
                {/* Right Column */}
                <div className="w-2/3 bg-gray-50 p-4 rounded-lg border">
                     <h4 className="font-bold border-b pb-2 mb-2 text-xl">Transaction History</h4>
                     <div className="overflow-y-auto h-[550px]">
                         <table className="w-full text-left">
                            <thead className="sticky top-0 bg-gray-100">
                                <tr>
                                    <th className="p-2">Bill ID</th>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Type</th>
                                    <th className="p-2 text-right">Total (₹)</th>
                                    <th className="p-2 text-right">Balance (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map(bill => (
                                    <tr key={bill.id} className="border-b">
                                        <td className="p-2 text-xs font-mono">{bill.id}</td>
                                        <td className="p-2">{new Date(bill.date).toLocaleDateString()}</td>
                                        <td className="p-2">{bill.type}</td>
                                        <td className="p-2 text-right">{bill.finalAmount.toLocaleString('en-IN')}</td>
                                        <td className="p-2 text-right font-semibold">{bill.balance > 0 ? <span className="text-red-600">{bill.balance.toLocaleString('en-IN')}</span> : 'Paid'}</td>
                                    </tr>
                                ))}
                                {bills.length === 0 && (<tr><td colSpan={5} className="text-center p-8 text-gray-500">No transactions found.</td></tr>)}
                            </tbody>
                         </table>
                     </div>
                </div>
            </main>
        </div>
    );
};

// --- Responsive On-Screen View ---
const OnScreenCustomerProfile: React.FC<{customer: Customer, bills: Bill[]}> = ({customer, bills}) => {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-6 border">
                <img src={customer.photoUrl || 'https://picsum.photos/128'} alt={customer.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-brand-gold-light shadow-lg" />
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold font-serif text-brand-dark">{customer.name}</h2>
                    <p className="font-mono text-gray-500">{customer.id}</p>
                    <p className="text-gray-600 mt-2">{customer.phone}</p>
                    <p className="text-sm text-gray-500">Member since {new Date(customer.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-auto text-center md:text-right bg-red-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-red-700">Pending Balance</p>
                    <p className="text-3xl font-bold text-red-600">₹{customer.pendingBalance.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {customer.addressProofUrl && (
                    <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-xl font-bold mb-4 text-brand-dark">Address Proof</h3>
                        <img src={customer.addressProofUrl} alt="Address Proof" className="w-full rounded-md object-contain max-h-64"/>
                    </div>
                )}
                
                <div className={customer.addressProofUrl ? "lg:col-span-2" : "lg:col-span-3"}>
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-xl font-bold mb-4 text-brand-dark">Transaction History</h3>
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
                                            <td className="p-2 text-sm text-right">{bill.finalAmount.toLocaleString('en-IN')}</td>
                                            <td className="p-2 text-sm text-right font-semibold">{bill.balance > 0 ? <span className="text-red-600">{bill.balance.toLocaleString('en-IN')}</span> : 'Paid'}</td>
                                        </tr>
                                    ))}
                                    {bills.length === 0 && (<tr><td colSpan={5} className="text-center p-8 text-gray-500">No transactions found.</td></tr>)}
                                </tbody>
                             </table>
                        </div>
                    </div>
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
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1123, 794] });
            pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
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
                     <button onClick={onBack} className="flex items-center text-gray-600 hover:text-brand-dark transition mb-2">
                        {/* FIX: Corrected a malformed `viewBox` attribute in an SVG element that was causing a parsing error. */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Customers
                    </button>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark">Customer Profile</h1>
                </div>
                <button onClick={generatePdf} disabled={isGeneratingPdf} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-semibold hover:bg-brand-gold-dark transition flex items-center justify-center shadow-md disabled:bg-gray-400">
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
        <div className="hidden md:flex justify-between items-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-brand-dark">Customers</h1>
            <button onClick={() => setIsModalOpen(true)} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-semibold hover:bg-brand-gold-dark transition flex items-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add New Customer
            </button>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="md:hidden fixed bottom-24 right-4 bg-brand-gold text-brand-dark w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-20">
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
                                        <img src={customer.photoUrl || `https://i.pravatar.cc/150?u=${customer.id}`} alt={customer.name} className="w-10 h-10 rounded-full mr-4 object-cover"/>
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
                         <img src={customer.photoUrl || `https://i.pravatar.cc/150?u=${customer.id}`} alt={customer.name} className="w-12 h-12 rounded-full mr-4 object-cover"/>
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