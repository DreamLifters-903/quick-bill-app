import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2, Receipt, Calendar, Hash, Save } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// Demo items with static prices
const DEMO_ITEMS = [
  { name: "Tea", price: 20 },
  { name: "Coffee", price: 40 },
  { name: "Green Tea", price: 30 },
  { name: "Cappuccino", price: 60 },
  { name: "Espresso", price: 50 },
  { name: "Latte", price: 55 },
  { name: "Sandwich", price: 80 },
  { name: "Burger", price: 120 },
  { name: "Samosa", price: 15 },
  { name: "Chips", price: 25 },
  { name: "Cookies", price: 35 },
  { name: "Cake Slice", price: 70 },
  { name: "Cold Drink", price: 30 },
  { name: "Juice", price: 45 },
  { name: "Water Bottle", price: 20 },
];

interface BillItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  amount: number;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const BillingContent = () => {
  const [orderNumber, setOrderNumber] = useState(1);
  const [currentDate] = useState(formatDate(new Date()));
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ name: string; price: number } | null>(null);
  const [quantity, setQuantity] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nextId, setNextId] = useState(1);
  
  const quantityRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredItems = DEMO_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = billItems.reduce((sum, item) => sum + item.amount, 0);

  const handleSelectItem = (item: { name: string; price: number }) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setShowDropdown(false);
    setTimeout(() => quantityRef.current?.focus(), 0);
  };

  const handleAddItem = () => {
    if (!selectedItem || !quantity || parseInt(quantity) <= 0) return;

    const qty = parseInt(quantity);
    const amount = qty * selectedItem.price;

    if (editingId !== null) {
      setBillItems((items) =>
        items.map((item) =>
          item.id === editingId
            ? { ...item, name: selectedItem.name, price: selectedItem.price, quantity: qty, amount }
            : item
        )
      );
      setEditingId(null);
    } else {
      const newItem: BillItem = {
        id: nextId,
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: qty,
        amount,
      };
      setBillItems((items) => [...items, newItem]);
      setNextId((id) => id + 1);
    }

    setSearchTerm("");
    setSelectedItem(null);
    setQuantity("");
    searchRef.current?.focus();
  };

  const handleEditItem = (item: BillItem) => {
    setEditingId(item.id);
    setSelectedItem({ name: item.name, price: item.price });
    setSearchTerm(item.name);
    setQuantity(item.quantity.toString());
    searchRef.current?.focus();
  };

  const handleRemoveItem = (id: number) => {
    setBillItems((items) => items.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setSearchTerm("");
      setSelectedItem(null);
      setQuantity("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-background p-4 md:p-6 lg:p-8 overflow-auto">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger className="md:hidden h-10 w-10 bg-secondary rounded-lg" />
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-primary mb-2">
              <Receipt className="h-8 w-8" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quick Bill</h1>
            </div>
            <p className="text-muted-foreground text-sm">Fast & Simple Billing System</p>
          </div>
        </div>

        {/* Order Info Card */}
        <div className="bg-card rounded-xl border border-border p-4 md:p-6 card-glow animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Order Number</p>
                <p className="text-lg font-semibold text-foreground">#{orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="text-lg font-semibold text-foreground">{currentDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Item Input Card */}
        <div className="bg-card rounded-xl border border-border p-4 md:p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Add Item</h2>
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedItem(null);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                />
              </div>
              {showDropdown && searchTerm && filteredItems.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-48 overflow-auto">
                  {filteredItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleSelectItem(item)}
                      className="w-full px-4 py-2.5 text-left hover:bg-secondary transition-colors flex justify-between items-center"
                    >
                      <span className="text-foreground">{item.name}</span>
                      <span className="text-primary font-medium">₹{item.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity Input */}
            <div className="w-full md:w-32">
              <Input
                ref={quantityRef}
                type="number"
                placeholder="Qty"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Add/Save Button */}
            <Button
              onClick={handleAddItem}
              disabled={!selectedItem || !quantity || parseInt(quantity) <= 0}
              variant={editingId !== null ? "success" : "default"}
              className="w-full md:w-auto"
            >
              {editingId !== null ? (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </div>
          {selectedItem && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: <span className="text-foreground font-medium">{selectedItem.name}</span> @ 
              <span className="text-primary font-medium"> ₹{selectedItem.price}</span>
            </p>
          )}
        </div>

        {/* Bill Table Card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="p-4 md:p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Bill Items</h2>
          </div>
          
          {billItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No items added yet</p>
              <p className="text-sm text-muted-foreground/70">Search and add items to start billing</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Sl</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Item</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-border/50 transition-colors hover:bg-secondary/30 ${
                        editingId === item.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-foreground">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-primary">₹{item.amount}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="icon"
                            size="icon"
                            onClick={() => handleEditItem(item)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="icon"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Total Card */}
        <div className="bg-card rounded-xl border border-border p-4 md:p-6 card-glow animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Amount</p>
              <p className="text-xs text-muted-foreground">
                {billItems.length} item{billItems.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl md:text-4xl font-bold text-primary">₹{total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <BillingContent />
      </div>
    </SidebarProvider>
  );
};

export default Index;
