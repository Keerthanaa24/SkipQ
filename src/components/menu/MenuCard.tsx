import React from 'react';
import { Plus, Minus, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';

interface MenuCardProps {
  item: MenuItem;
}

const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <Card variant="interactive" className="overflow-hidden group">
      <div className="relative h-40 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-destructive font-semibold">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs">
          <Clock className="w-3 h-3 text-primary" />
          <span>{item.preparationTime} min</span>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-base">{item.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-primary">₹{item.price}</span>
          {quantity > 0 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.id, quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <Button
                variant="gradient"
                size="icon"
                className="h-8 w-8"
                onClick={() => addItem(item)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => addItem(item)}
              disabled={!item.available}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
