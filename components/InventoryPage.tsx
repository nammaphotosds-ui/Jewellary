import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { JewelryCategory } from '../types';
import type { JewelryItem } from '../types';


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

const AddInventoryItemForm: React.FC<{onClose: ()=>void}> = ({onClose}) => {
    const { addInventoryItem } = useAppContext();
    const [name, setName] = useState('');
    const [category, setCategory] = useState<string>(JewelryCategory.RING);
    const [otherCategory, setOtherCategory] = useState('');
    const [weight, setWeight] = useState('');
    const [purity, setPurity] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [photo, setPhoto] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const finalCategory = category === JewelryCategory.OTHER ? otherCategory : category;
        if (!finalCategory) {
            alert('Please specify a category for "Other".');
            setIsSubmitting(false);
            return;
        }
        
        const imageUrl = photo ? await fileToBase64(photo) : undefined;

        await addInventoryItem({
            name,
            category: finalCategory,
            weight: parseFloat(weight),
            purity: parseFloat(purity),
            price: parseFloat(price),
            quantity: parseInt(quantity, 10),
            imageUrl,
        });
        onClose();
        setIsSubmitting(false);
    };
    
    const FileInput: React.FC<{label: string, file: File | null, onFileChange: (file: File | null) => void, id: string}> = ({label, file, onFileChange, id}) => (
         <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 flex items-center space-x-4">
                {file ? <img src={URL.createObjectURL(file)} alt="preview" className="w-12 h-12 rounded-lg object-cover"/> : <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>}
                <label htmlFor={id} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    <span>{file ? 'Change' : 'Upload'}</span>
                    <input id={id} name={id} type="file" accept="image/*" className="sr-only" onChange={e => onFileChange(e.target.files ? e.target.files[0] : null)}/>
                </label>
                 {file && <button type="button" onClick={() => onFileChange(null)} className="text-sm text-red-600">Remove</button>}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required/>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded">
                {Object.values(JewelryCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {category === JewelryCategory.OTHER && (
                <input type="text" placeholder="Specify Category" value={otherCategory} onChange={e => setOtherCategory(e.target.value)} className="w-full p-2 border rounded" required/>
            )}
            <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Weight (grams)" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-2 border rounded" required/>
                <input type="number" step="0.1" placeholder="Purity (carat)" value={purity} onChange={e => setPurity(e.target.value)} className="w-full p-2 border rounded" required/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price (₹)" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border rounded" required/>
                <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full p-2 border rounded" required min="1"/>
            </div>
            <FileInput label="Item Photo (Optional)" file={photo} onFileChange={setPhoto} id="item-photo-upload"/>
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-gold text-brand-charcoal p-3 rounded-lg font-semibold hover:bg-brand-gold-dark transition disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Add Item'}
            </button>
        </form>
    );
};

const InventoryStatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center border border-gray-100">
        <div className="p-3 bg-brand-gold-light text-brand-gold-dark rounded-full mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-brand-charcoal">{value}</p>
        </div>
    </div>
);

const ProductCard: React.FC<{ item: JewelryItem; onDelete: (itemId: string, itemName: string) => void; }> = ({ item, onDelete }) => {
    return (
        <div className="bg-white rounded-lg shadow-md border overflow-hidden group relative transition-shadow hover:shadow-xl">
            <div className="aspect-square w-full overflow-hidden">
                 <img src={item.imageUrl || `https://via.placeholder.com/300/D4AF37/FFFFFF?text=${item.name.charAt(0)}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
            </div>
            <div className="p-3 text-sm">
                <h3 className="font-bold text-brand-charcoal truncate" title={item.name}>{item.name}</h3>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-800 font-semibold">₹{item.price.toLocaleString('en-IN')}</p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.quantity > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {item.quantity > 0 ? `Qty: ${item.quantity}` : 'Sold Out'}
                    </span>
                </div>
            </div>
             <button 
                onClick={() => onDelete(item.id, item.name)} 
                className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                aria-label={`Delete ${item.name}`}
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
        </div>
    );
};

const InventoryPage: React.FC = () => {
    const { inventory, deleteInventoryItem } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = useMemo(() => {
        const allCategories = inventory.map(item => item.category);
        return ['All', ...Array.from(new Set(allCategories)).sort()];
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        if (selectedCategory === 'All') {
            return inventory;
        }
        return inventory.filter(item => item.category === selectedCategory);
    }, [inventory, selectedCategory]);

    const inventoryStats = useMemo(() => {
        const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = inventory.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return {
            uniqueItemCount: inventory.length,
            totalStock,
            totalValue
        };
    }, [inventory]);
    
    const handleDelete = (itemId: string, itemName: string) => {
        if (window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
            deleteInventoryItem(itemId);
        }
    };

    return (
    <div>
        <div className="flex flex-col md:flex-row justify-end md:items-center mb-6 gap-4">
            <button onClick={() => setIsModalOpen(true)} className="hidden md:flex bg-brand-gold text-brand-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-brand-gold-dark transition items-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add New Item
            </button>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="md:hidden fixed bottom-28 right-6 bg-brand-gold text-brand-charcoal w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Inventory Item">
            <AddInventoryItemForm onClose={() => setIsModalOpen(false)} />
        </Modal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <InventoryStatCard title="Unique Items" value={inventoryStats.uniqueItemCount} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>} />
            <InventoryStatCard title="Total Stock" value={inventoryStats.totalStock} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>} />
            <InventoryStatCard title="Inventory Value" value={`₹${inventoryStats.totalValue.toLocaleString('en-IN')}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
        </div>

        {/* Category Filters */}
        <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                            selectedCategory === category
                                ? 'bg-brand-gold text-brand-charcoal shadow'
                                : 'bg-white text-gray-700 border hover:bg-gray-100'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredInventory.length > 0 ? (
                filteredInventory.map(item => (
                    <ProductCard key={item.id} item={item} onDelete={handleDelete} />
                ))
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-md col-span-full">
                    <p className="text-gray-500">
                        {inventory.length === 0
                            ? 'No items in inventory. Add one to get started!'
                            : `No items found in the "${selectedCategory}" category.`}
                    </p>
                </div>
            )}
        </div>
    </div>
    );
};

export default InventoryPage;