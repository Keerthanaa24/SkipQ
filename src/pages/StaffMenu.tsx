import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ArrowLeft, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { categories } from '@/data/menuData';
import { MenuItem } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

// FIREBASE
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type FormItem = Omit<MenuItem, 'price' | 'preparationTime'> & {
  price: number | '';
  preparationTime: number | '';
};

const StaffMenu: React.FC = () => {
  const { toast } = useToast();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // FETCH MENU
  useEffect(() => {
    const fetchMenu = async () => {
      const snapshot = await getDocs(collection(db, 'menu'));
      setItems(
        snapshot.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<MenuItem, 'id'>),
        }))
      );
    };
    fetchMenu();
  }, []);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'All' || item.category === selectedCategory)
  );

  const toggleAvailability = async (item: MenuItem) => {
    await updateDoc(doc(db, 'menu', item.id), { available: !item.available });
    setItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, available: !i.available } : i))
    );
    toast({ title: 'Availability updated' });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    await deleteDoc(doc(db, 'menu', id));
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Item deleted' });
  };

  const handleSave = async (form: FormItem) => {
    const payload: MenuItem = {
      ...form,
      price: Number(form.price),
      preparationTime: Number(form.preparationTime),
    };

    if (editingItem) {
      await updateDoc(doc(db, 'menu', editingItem.id), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      setItems(prev =>
        prev.map(i => (i.id === editingItem.id ? { ...payload, id: i.id } : i))
      );
      toast({ title: 'Item updated' });
    } else {
      const ref = await addDoc(collection(db, 'menu'), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setItems(prev => [...prev, { ...payload, id: ref.id }]);
      toast({ title: 'Item added' });
    }

    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const ItemFormDialog = () => {
    const [formData, setFormData] = useState<FormItem>(
      editingItem
        ? { ...editingItem }
        : {
            id: '',
            name: '',
            description: '',
            price: '',
            preparationTime: '',
            category: categories.find(c => c !== 'All') || 'Snacks',
            image: '',
            available: true,
          }
    );

    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input placeholder="Name" value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })} />

          <Input placeholder="Description" value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })} />

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Price in Rupees"
              value={formData.price}
              onChange={e =>
                setFormData({
                  ...formData,
                  price: e.target.value === '' ? '' : Number(e.target.value),
                })
              }
              className="no-spinner"
            />
            <Input
              type="number"
              placeholder="Time for Preparing (min)"
              value={formData.preparationTime}
              onChange={e =>
                setFormData({
                  ...formData,
                  preparationTime: e.target.value === '' ? '' : Number(e.target.value),
                })
              }
              className="no-spinner"
            />
          </div>

          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-11 px-4 rounded-lg border border-border bg-secondary"
          >
            {categories.filter(c => c !== 'All').map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <Input placeholder="Image URL" value={formData.image}
            onChange={e => setFormData({ ...formData, image: e.target.value })} />

          <div className="flex justify-between items-center">
            <span>Available</span>
            <Switch checked={formData.available}
              onCheckedChange={v => setFormData({ ...formData, available: v })} />
          </div>

          <Button className="w-full" variant="gradient" onClick={() => handleSave(formData)}>
            {editingItem ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between mb-6">
          <Link to="/staff" className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" onClick={() => setEditingItem(null)}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </DialogTrigger>
            <ItemFormDialog />
          </Dialog>
        </div>

        {filteredItems.map(item => (
          <Card key={item.id} className="mb-3">
            <CardContent className="p-4 flex gap-4">
              <img src={item.image} className="w-20 h-20 rounded object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-sm text-muted-foreground">
                  <IndianRupee className="w-3 h-3 inline" /> {item.price} • {item.preparationTime} min • {item.category}
                </p>
                <div className="flex justify-between mt-2">
                  <Switch checked={item.available} onCheckedChange={() => toggleAvailability(item)} />
                  <div className="flex gap-2">
                    <Button size="icon" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default StaffMenu;
