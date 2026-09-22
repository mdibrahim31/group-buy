import { Product, Bundle } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'প্রিমিয়াম লেদার ফর্মাল সু (Oxford Black)',
    category: 'জুতা',
    description: '১০০% জেনুইন লেদার সোল ও আরামদায়ক ইনসোল। অফিশিয়াল ও ক্যাজুয়াল দুই লুকেই মানানসই।',
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    wholesalePrice: 650,
    groupPrice: 890,
    fullBundlePricePerPiece: 750, // সম্পূর্ণ বান্ডিলে আরও ১৪০ টাকা ছাড় প্রতি পিসে!
    retailPrice: 2200,
    bundleSize: 6,
    availableSizes: ['৩৯', '৪০', '৪১', '৪২', '৪৩', '৪৪'],
  },
  {
    id: 'prod-2',
    title: 'ক্যাজুয়াল এয়ার-কুশন রানিং স্নিকার্স',
    category: 'জুতা',
    description: 'ব্রিদেবল মেশ ফ্যাব্রিক ও শক-অ্যাবজরবিং এয়ার কুশন বটম। খেলাধুলা ও দৈনন্দিন ব্যবহারের জন্য সেরা।',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    wholesalePrice: 580,
    groupPrice: 790,
    fullBundlePricePerPiece: 670, // সম্পূর্ণ বান্ডিলে আরও ১২০ টাকা ছাড় প্রতি পিসে!
    retailPrice: 1950,
    bundleSize: 6,
    availableSizes: ['৪০', '৪১', '৪২', '৪৩', '৪৪', '৪৫'],
  },
  {
    id: 'prod-3',
    title: 'এক্সক্লুসিভ জ্যাকার্ড কটন পাঞ্জাবি',
    category: 'কাপড়',
    description: 'উন্নত কটন সুতার সূক্ষ্ম কাজ ও মেটাল স্ন্যাপ বাটন। উৎসব ও নামাজের জন্য মার্জিত ডিজাইন।',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    wholesalePrice: 550,
    groupPrice: 750,
    fullBundlePricePerPiece: 640,
    retailPrice: 1800,
    bundleSize: 4,
    availableSizes: ['৩৮', '৪০', '৪২', '৪৪'],
  },
  {
    id: 'prod-4',
    title: 'হেভি ড্রপ শোল্ডার কটন পোলো টি-শার্ট',
    category: 'কাপড়',
    description: '২২০+ জিএসএম পিউর কটন ও কালার গ্যারান্টি। প্রিমিয়াম ডাইং ফিনিশিং।',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    wholesalePrice: 320,
    groupPrice: 460,
    fullBundlePricePerPiece: 380,
    retailPrice: 1100,
    bundleSize: 8,
    availableSizes: ['M (৩৮)', 'L (৪০)', 'XL (৪২)', 'XXL (৪৪)'],
  },
  {
    id: 'prod-5',
    title: 'ওয়াটারপ্রুফ আউটডোর হাইকিং বুট',
    category: 'জুতা',
    description: 'অ্যান্টি-স্লিপ রাবার গ্রিপ ও ডাবল স্টিচড আর্টিফিশিয়াল লেদার। যেকোনো প্রতিকূল রাস্তায় দীর্ঘস্থায়ী।',
    imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80',
    wholesalePrice: 900,
    groupPrice: 1250,
    fullBundlePricePerPiece: 1050,
    retailPrice: 3100,
    bundleSize: 6,
    availableSizes: ['৪০', '৪১', '৪২', '৪৩', '৪৪', '৪৫'],
  }
];

export const INITIAL_BUNDLES: Bundle[] = [
  {
    id: 'bundle-prod-1-batch-1',
    productId: 'prod-1',
    batchNumber: 1,
    totalSlots: 6,
    filledSlots: 4,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 28).toISOString(),
    slots: [
      { id: 'slot-1-1', bundleId: 'bundle-prod-1-batch-1', size: '৩৯', status: 'available' },
      { id: 'slot-1-2', bundleId: 'bundle-prod-1-batch-1', size: '৪০', status: 'booked', userId: 'demo-1', userName: 'রাকিব আহমেদ', userPhoneMasked: '0171****82' },
      { id: 'slot-1-3', bundleId: 'bundle-prod-1-batch-1', size: '৪১', status: 'booked', userId: 'demo-2', userName: 'তানভীর হাসান', userPhoneMasked: '0182****44' },
      { id: 'slot-1-4', bundleId: 'bundle-prod-1-batch-1', size: '৪২', status: 'booked', userId: 'demo-3', userName: 'সাকিব চৌধুরী', userPhoneMasked: '0191****19' },
      { id: 'slot-1-5', bundleId: 'bundle-prod-1-batch-1', size: '৪৩', status: 'booked', userId: 'demo-4', userName: 'ইমরান খান', userPhoneMasked: '0163****90' },
      { id: 'slot-1-6', bundleId: 'bundle-prod-1-batch-1', size: '৪৪', status: 'available' },
    ]
  },
  {
    id: 'bundle-prod-2-batch-1',
    productId: 'prod-2',
    batchNumber: 1,
    totalSlots: 6,
    filledSlots: 5,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 16).toISOString(),
    slots: [
      { id: 'slot-2-1', bundleId: 'bundle-prod-2-batch-1', size: '৪০', status: 'booked', userId: 'demo-5', userName: 'মামুন হোসেন', userPhoneMasked: '0175****11' },
      { id: 'slot-2-2', bundleId: 'bundle-prod-2-batch-1', size: '৪১', status: 'booked', userId: 'demo-6', userName: 'কামরুল ইসলাম', userPhoneMasked: '0130****76' },
      { id: 'slot-2-3', bundleId: 'bundle-prod-2-batch-1', size: '৪২', status: 'booked', userId: 'demo-7', userName: 'নাঈম রহমান', userPhoneMasked: '0188****32' },
      { id: 'slot-2-4', bundleId: 'bundle-prod-2-batch-1', size: '৪৩', status: 'booked', userId: 'demo-8', userName: 'আরিফুল হক', userPhoneMasked: '0152****98' },
      { id: 'slot-2-5', bundleId: 'bundle-prod-2-batch-1', size: '৪৪', status: 'available' },
      { id: 'slot-2-6', bundleId: 'bundle-prod-2-batch-1', size: '৪৫', status: 'booked', userId: 'demo-9', userName: 'জাকির হোসেন', userPhoneMasked: '0172****05' },
    ]
  },
  {
    id: 'bundle-prod-3-batch-1',
    productId: 'prod-3',
    batchNumber: 1,
    totalSlots: 4,
    filledSlots: 4,
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 8).toISOString(),
    slots: [
      { id: 'slot-3-1', bundleId: 'bundle-prod-3-batch-1', size: '৩৮', status: 'booked', userId: 'demo-10', userName: 'মাহমুদ হাসান', userPhoneMasked: '0191****55' },
      { id: 'slot-3-2', bundleId: 'bundle-prod-3-batch-1', size: '৪০', status: 'booked', userId: 'demo-11', userName: 'ফারহান তাহের', userPhoneMasked: '0171****99' },
      { id: 'slot-3-3', bundleId: 'bundle-prod-3-batch-1', size: '৪২', status: 'booked', userId: 'demo-12', userName: 'শামীম রেজা', userPhoneMasked: '0184****23' },
      { id: 'slot-3-4', bundleId: 'bundle-prod-3-batch-1', size: '৪৪', status: 'booked', userId: 'demo-13', userName: 'বোরহান উদ্দিন', userPhoneMasked: '0168****12' },
    ]
  },
  {
    id: 'bundle-prod-3-batch-2',
    productId: 'prod-3',
    batchNumber: 2,
    totalSlots: 4,
    filledSlots: 1,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 45).toISOString(),
    slots: [
      { id: 'slot-3-2-1', bundleId: 'bundle-prod-3-batch-2', size: '৩৮', status: 'available' },
      { id: 'slot-3-2-2', bundleId: 'bundle-prod-3-batch-2', size: '৪০', status: 'booked', userId: 'demo-14', userName: 'তাহমিদ আলম', userPhoneMasked: '0173****48' },
      { id: 'slot-3-2-3', bundleId: 'bundle-prod-3-batch-2', size: '৪২', status: 'available' },
      { id: 'slot-3-2-4', bundleId: 'bundle-prod-3-batch-2', size: '৪৪', status: 'available' },
    ]
  }
];
