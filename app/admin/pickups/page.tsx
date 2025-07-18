
'use client'
import AdminLayout from '@/components/shared/adminLayout'
import DynamicTable from '@/components/shared/dashboardTable'
import React from 'react'

export default function page() {
    const sampleData = [
    {
      id: 1,
      icon: '♻️',
      name: 'sarah Bottles',
      productId: '#R087640',
      price: 0.50,
      stock: '2500 kg',
      type: 'Plastic',
      status: 'recycled'
    },
    {
      id: 2,
      icon: '📦',
      name: 'Cardboard Boxes',
      productId: '#R199636',
      price: 0.25,
      stock: '1500 kg',
      type: 'Paper',
      status: 'processing'
    },
    {
      id: 3,
      icon: '🥤',
      name: 'Aluminum Cans',
      productId: '#R686536',
      price: 1.20,
      stock: '800 kg',
      type: 'Metal',
      status: 'collected'
    },
    {
      id: 4,
      icon: '🧴',
      name: 'Glass Bottles',
      productId: '#R888836',
      price: 0.75,
      stock: '1200 kg',
      type: 'Glass',
      status: 'recycled'
    },
    {
      id: 5,
      icon: '📱',
      name: 'Electronic Waste',
      productId: '#R687641',
      price: 5.00,
      stock: '150 units',
      type: 'Electronics',
      status: 'processing'
    },
    {
      id: 1,
      icon: '♻️',
      name: 'Plastic Bottles',
      productId: '#R087640',
      price: 0.50,
      stock: '2500 kg',
      type: 'Plastic',
      status: 'recycled'
    },
    {
      id: 2,
      icon: '📦',
      name: 'Cardboard Boxes',
      productId: '#R199636',
      price: 0.25,
      stock: '1500 kg',
      type: 'Paper',
      status: 'processing'
    },
    {
      id: 3,
      icon: '🥤',
      name: 'Aluminum Cans',
      productId: '#R686536',
      price: 1.20,
      stock: '800 kg',
      type: 'Metal',
      status: 'collected'
    },
    {
      id: 4,
      icon: '🧴',
      name: 'Glass Bottles',
      productId: '#R888836',
      price: 0.75,
      stock: '1200 kg',
      type: 'Glass',
      status: 'recycled'
    },
    {
      id: 5,
      icon: '📱',
      name: 'Electronic Waste',
      productId: '#R687641',
      price: 5.00,
      stock: '150 units',
      type: 'Electronics',
      status: 'processing'
    }
  ];
  const columns = [
    { key: 'icon', label: '', type: 'image' },
    { key: 'name', label: 'Material Name', sortable: true },
    { key: 'productId', label: 'Material ID', sortable: true },
      { key: 'price', label: 'Price/kg', type: 'price', sortable: true },
      { key: 'stock', label: 'Stock', sortable: true },
      { key: 'type', label: 'Category', sortable: true },
  ];
  return <>
  <AdminLayout>
<DynamicTable data={sampleData} columns={columns} title='orders' itemsPerPage={5}/>
  </AdminLayout>
  </>
  
}
