import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MenuCard from '@/components/menu/MenuCard';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

const Menu: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const { totalItems, totalAmount } = useCart();

  // 🔥 Real-time menu updates from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menu'), snapshot => {
      const data: MenuItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<MenuItem, 'id'>),
      }));

      setMenuItems(data);

      // Update categories dynamically
      const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
      setCategories(['All', ...uniqueCategories]);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Filter items by search query and selected category
  const filteredItems = menuItems.filter(item => {
  if (!item.available) return false;

  const matchesSearch =
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesCategory =
    selectedCategory === 'All' || item.category === selectedCategory;

  return matchesSearch && matchesCategory;
});


  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Today's Menu 🍽️
          </h1>
          <p className="text-muted-foreground">
            Fresh and delicious food waiting for you
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'gradient' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredItems.map(item => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No items found matching your search</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
              Clear filters
            </Button>
          </div>
        )}

        {/* Floating Cart Button */}
        {totalItems > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <Link to="/cart">
              <Button variant="gradient" size="lg" className="shadow-xl glow-primary px-6">
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span className="mr-2">{totalItems} items</span>
                <span className="font-bold">₹{totalAmount}</span>
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Menu;
