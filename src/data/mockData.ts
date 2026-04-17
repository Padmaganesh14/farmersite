export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: string;
  location: string;
  image: string;
  category: 'vegetables' | 'fruits' | 'grains' | 'dairy';
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  inStock: boolean;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  quantity: string;
  total: number;
  status: 'pending' | 'shipped' | 'out_for_delivery' | 'delivered';
  date: string;
  farmerLocation?: LatLng;
  buyerLocation?: LatLng;
  vehicleLocation?: LatLng;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Fresh Tomatoes',
    price: 40,
    quantity: '500 kg',
    location: 'Coimbatore, TN',
    image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=300&fit=crop',
    category: 'vegetables',
    farmerId: '1',
    farmerName: 'Rajan Kumar',
    farmerPhone: '+919876543210',
    inStock: true,
  },
  {
    id: '2',
    name: 'Organic Rice',
    price: 65,
    quantity: '1000 kg',
    location: 'Thanjavur, TN',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
    category: 'grains',
    farmerId: '1',
    farmerName: 'Rajan Kumar',
    farmerPhone: '+919876543210',
    inStock: true,
  },
  {
    id: '3',
    name: 'Fresh Mangoes',
    price: 120,
    quantity: '200 kg',
    location: 'Salem, TN',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
    category: 'fruits',
    farmerId: '3',
    farmerName: 'Muthu Vel',
    farmerPhone: '+919876543212',
    inStock: true,
  },
  {
    id: '4',
    name: 'Farm Fresh Milk',
    price: 55,
    quantity: '100 L',
    location: 'Erode, TN',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop',
    category: 'dairy',
    farmerId: '4',
    farmerName: 'Lakshmi Devi',
    farmerPhone: '+919876543213',
    inStock: true,
  },
  {
    id: '5',
    name: 'Green Chillies',
    price: 80,
    quantity: '300 kg',
    location: 'Madurai, TN',
    image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&h=300&fit=crop',
    category: 'vegetables',
    farmerId: '1',
    farmerName: 'Rajan Kumar',
    farmerPhone: '+919876543210',
    inStock: true,
  },
  {
    id: '6',
    name: 'Bananas',
    price: 35,
    quantity: '400 kg',
    location: 'Trichy, TN',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
    category: 'fruits',
    farmerId: '3',
    farmerName: 'Muthu Vel',
    farmerPhone: '+919876543212',
    inStock: false,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    productId: '1',
    productName: 'Fresh Tomatoes',
    productImage: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=300&fit=crop',
    buyerId: '2',
    buyerName: 'Priya Singh',
    buyerPhone: '+919876543211',
    farmerId: '1',
    farmerName: 'Rajan Kumar',
    farmerPhone: '+919876543210',
    quantity: '50 kg',
    total: 2000,
    status: 'shipped',
    date: '2026-04-14',
    farmerLocation: { lat: 11.0168, lng: 76.9558 },   // Coimbatore
    buyerLocation:  { lat: 13.0827, lng: 80.2707 },   // Chennai
    vehicleLocation: { lat: 11.9139, lng: 79.8145 },  // Villupuram (mid-route)
  },
  {
    id: 'ORD002',
    productId: '2',
    productName: 'Organic Rice',
    productImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
    buyerId: '2',
    buyerName: 'Priya Singh',
    buyerPhone: '+919876543211',
    farmerId: '1',
    farmerName: 'Rajan Kumar',
    farmerPhone: '+919876543210',
    quantity: '100 kg',
    total: 6500,
    status: 'pending',
    date: '2026-04-15',
    farmerLocation: { lat: 10.787,  lng: 79.1378 },   // Thanjavur
    buyerLocation:  { lat: 13.0827, lng: 80.2707 },   // Chennai
    vehicleLocation: { lat: 10.787, lng: 79.1378 },   // Still at farm
  },
  {
    id: 'ORD003',
    productId: '3',
    productName: 'Fresh Mangoes',
    productImage: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
    buyerId: '2',
    buyerName: 'Priya Singh',
    buyerPhone: '+919876543211',
    farmerId: '3',
    farmerName: 'Muthu Vel',
    farmerPhone: '+919876543212',
    quantity: '10 kg',
    total: 1200,
    status: 'delivered',
    date: '2026-04-10',
    farmerLocation: { lat: 11.6643, lng: 78.1460 },   // Salem
    buyerLocation:  { lat: 13.0827, lng: 80.2707 },   // Chennai
    vehicleLocation: { lat: 13.0827, lng: 80.2707 },  // Delivered - at destination
  },
];
