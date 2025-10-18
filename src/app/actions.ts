"use server";

import type {
  PaginatedResponse,
  Product,
} from "@/lib/types";
import { type PaginationState } from "@tanstack/table-core";

// Mock database with all products
const allProducts: Product[] = [
  { id: "DFO-001", name: "Dog Food", price: 18.99, category: "Pet Supplies", stock: 45 },
  { id: "CTO-002", name: "Cat Toy", price: 12.49, category: "Pet Supplies", stock: 32 },
  { id: "BKS-003", name: "Science Book", price: 24.99, category: "Books", stock: 18 },
  { id: "HDM-004", name: "HDMI Cable", price: 8.99, category: "Electronics", stock: 120 },
  { id: "COF-005", name: "Coffee Beans", price: 15.99, category: "Food", stock: 67 },
  { id: "YGM-006", name: "Yoga Mat", price: 29.99, category: "Sports", stock: 23 },
  { id: "PHL-007", name: "Phone Case", price: 14.99, category: "Electronics", stock: 89 },
  { id: "GRC-008", name: "Green Tea", price: 9.99, category: "Food", stock: 54 },
  { id: "BKP-009", name: "Backpack", price: 49.99, category: "Accessories", stock: 15 },
  { id: "MOU-010", name: "Wireless Mouse", price: 22.99, category: "Electronics", stock: 78 },
  { id: "WTB-011", name: "Water Bottle", price: 16.99, category: "Sports", stock: 41 },
  { id: "NVL-012", name: "Mystery Novel", price: 19.99, category: "Books", stock: 27 },
  { id: "HDP-013", name: "Headphones", price: 79.99, category: "Electronics", stock: 33 },
  { id: "SHM-014", name: "Shampoo", price: 11.99, category: "Personal Care", stock: 95 },
  { id: "SKT-015", name: "Skateboard", price: 89.99, category: "Sports", stock: 8 },
  { id: "BLN-016", name: "Blender", price: 39.99, category: "Home & Kitchen", stock: 52 },
  { id: "TRP-017", name: "Camera Tripod", price: 27.99, category: "Electronics", stock: 29 },
  { id: "FPN-018", name: "Frying Pan", price: 21.49, category: "Home & Kitchen", stock: 74 },
  { id: "JRN-019", name: "Travel Journal", price: 14.49, category: "Books", stock: 38 },
  { id: "LPT-020", name: "Laptop Stand", price: 33.99, category: "Electronics", stock: 61 },
  { id: "PLT-021", name: "Succulent Plant", price: 17.99, category: "Home & Garden", stock: 45 },
  { id: "TWL-022", name: "Bath Towel Set", price: 25.99, category: "Home & Kitchen", stock: 48 },
  { id: "GLV-023", name: "Winter Gloves", price: 19.49, category: "Apparel", stock: 36 },
  { id: "PNC-024", name: "Pencil Case", price: 8.49, category: "Accessories", stock: 58 },
  { id: "BTY-025", name: "Facial Cleanser", price: 13.99, category: "Personal Care", stock: 72 },
  { id: "KBR-026", name: "Mechanical Keyboard", price: 49.99, category: "Electronics", stock: 47 },
  { id: "TSH-027", name: "Graphic T-Shirt", price: 22.49, category: "Apparel", stock: 64 },
  { id: "BRB-028", name: "Barbecue Grill", price: 129.99, category: "Outdoor", stock: 12 },
  { id: "LGT-029", name: "Desk Lamp", price: 34.99, category: "Home & Garden", stock: 55 },
  { id: "STP-030", name: "Step Tracker", price: 59.99, category: "Electronics", stock: 26 },
];

export async function getProducts(
  pagination: PaginationState
): Promise<PaginatedResponse<Product>> {
  // Simulate async data fetching with a small delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const { pageIndex, pageSize } = pagination;

  // Calculate pagination
  const totalCount = allProducts.length;
  const pageCount = Math.ceil(totalCount / pageSize);
  const start = pageIndex * pageSize;
  const end = start + pageSize;

  // Slice the data for the current page
  const data = allProducts.slice(start, end);

  return {
    data,
    pageCount,
    totalCount,
  };
}
