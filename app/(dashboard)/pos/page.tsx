"use client";

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { createClient } from "@/lib/supabase/client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem, updateQuantity, removeItem, clearCart } from "@/store/slices/cartSlice";
import { selectCartItems, selectCartSubtotal, selectCartTax, selectCartTotal, selectUser, selectProfile } from "@/store/selectors";
import { Product, ProductWithCategory } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Search,
  CreditCard,
  Scan,
  Grid3x3,
  List,
} from "lucide-react";
import toast from "react-hot-toast";
import CheckoutModal from "@/components/pos/CheckoutModal";
import ProductCard from "@/components/pos/ProductCard";
import ProductTableRow from "@/components/pos/ProductTableRow";
import CartItem from "@/components/pos/CartItem";
import { playSuccessBeep } from "@/lib/utils/soundUtils";

export default function POSPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const barcodeTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 30; // More items per page for POS

  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const tax = useAppSelector(selectCartTax);
  const total = useAppSelector(selectCartTotal);
  const authUser = useAppSelector(selectUser);
  const authProfile = useAppSelector(selectProfile);
  const supabase = createClient();

  // Removed debug logging for performance

  useEffect(() => {
    loadCategories();
    // Load saved view mode from localStorage
    const savedViewMode = localStorage.getItem("posViewMode") as
      | "grid"
      | "table";
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory]);

  // Barcode scanner listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in search input or any other input field
      if (
        e.target === searchInputRef.current ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Clear previous timeout
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }

      // Handle Enter key (barcode scanner sends Enter after scanning)
      if (e.key === "Enter") {
        if (barcodeBuffer.length >= 8) {
          setIsScanning(true);
          searchProductByBarcode(barcodeBuffer);
          setBarcodeBuffer("");
          // Clear scanning indicator after 1 second
          setTimeout(() => setIsScanning(false), 1000);
        }
        return;
      }

      // Build barcode string (only accept numbers for barcode)
      if (e.key.length === 1 && /[0-9]/.test(e.key)) {
        setBarcodeBuffer((prev) => prev + e.key);
        setIsScanning(true);

        // Auto-clear buffer after 100ms of no input
        barcodeTimeoutRef.current = setTimeout(() => {
          setBarcodeBuffer("");
          setIsScanning(false);
        }, 100);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, [barcodeBuffer]);


  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("name")
        .eq("is_active", true)
        .order("name");

      const categoryNames = data?.map((c) => c.name) || [];
      setCategories(["All", ...categoryNames]);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("products")
        .select("*, categories(id, name)", { count: "exact" })
        .eq("is_active", true)
        .order("name");

      // Apply category filter if not 'All'
      if (selectedCategory !== "All") {
        // First get category ID
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .eq("name", selectedCategory)
          .single();

        if (categoryData) {
          query = query.eq("category_id", categoryData.id);
        }
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      setProducts((data as any) || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  // Memoized filtered products to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchQuery) return products;
    
    const query = debouncedSearchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.toLowerCase().includes(query))
    );
  }, [products, debouncedSearchQuery]);

  // Memoized event handlers to prevent unnecessary re-renders
  const toggleViewMode = useCallback((mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("posViewMode", mode);
  }, []);

  const handleAddToCart = useCallback((product: ProductWithCategory) => {
    dispatch(addItem(product));
  }, [dispatch]);

  const handleRemoveFromCart = useCallback((productId: string) => {
    dispatch(removeItem(productId));
  }, [dispatch]);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  }, [dispatch]);

  const handleCheckoutComplete = useCallback(() => {
    dispatch(clearCart());
    setIsCheckoutOpen(false);
    toast.success("Sale completed successfully!");
  }, [dispatch]);

  // Search product by barcode with memoization
  const searchProductByBarcode = useCallback(async (barcode: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name)")
        .eq("barcode", barcode)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error(`Product not found: ${barcode}`, {
          icon: "❌",
          duration: 2000,
        });
        return;
      }

      // Check stock
      if (data.stock <= 0) {
        toast.error(`${data.name} is out of stock!`, {
          icon: "⚠️",
        });
        return;
      }

      // Add to cart
      dispatch(addItem(data));
      toast.success(`Added: ${data.name}`, {
        icon: "✅",
        duration: 2000,
      });

      // Play success sound (optional)
      const audio = new Audio(
        "data:audio/wav;base64,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"
      );
      audio.play().catch(() => {}); // Ignore if audio doesn't play
    } catch (error) {
      console.error("Barcode scan error:", error);
      toast.error("Failed to scan barcode");
    }
  }, [supabase, dispatch]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-gray-600 mt-2">
              Select products to add to cart or scan barcode
            </p>
          </div>
          {isScanning && (
            <div className="flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg animate-pulse">
              <Scan className="w-5 h-5" />
              <span className="font-semibold">Scanning: {barcodeBuffer}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        {/* Products Section */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Search and Filter */}
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Scan className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Categories and View Toggle */}
            <div className="flex gap-4 items-center">
              <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-primary-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-white border border-gray-300 rounded-lg p-1 gap-1 shrink-0">
                <button
                  onClick={() => toggleViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleViewMode("table")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "table"
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Table View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Display */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === "grid" ? (
              // Grid View with Pictures
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </>
            ) : (
              // Table View without Pictures
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <ProductTableRow
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-sm text-gray-700">
                Page <span className="font-semibold">{currentPage}</span> of{" "}
                <span className="font-semibold">{totalPages}</span> (
                {totalCount} products)
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-primary-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Cart</h2>
              <p className="text-sm text-gray-600">{items.length} items</p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <CartItem
                    key={item.product.id}
                    item={item}
                    onRemoveItem={handleRemoveFromCart}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))
              )}
            </div>

            {/* Cart Summary */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  ₱{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax (10%):</span>
                <span className="font-semibold">₱{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total:</span>
                <span>₱{total.toFixed(2)}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                icon={CreditCard}
                className="w-full"
                disabled={items.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
              >
                Checkout
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onComplete={handleCheckoutComplete}
      />
    </div>
  );
}
