/* Local-only demo catalogue and sample data; never used by a server. */
window.VESTA_MOCK_SEED = {
  "users": [
    {
      "id": "u-admin",
      "phone": "09037099476",
      "name": "مدیر کل فروشگاه",
      "role": "super_admin",
      "wallet": 500000,
      "points": 2500,
      "referralCode": "VESTAADMIN",
      "referredBy": null,
      "createdAt": 1787768664343,
      "token": null,
      "isBanned": false
    },
    {
      "id": "u-support",
      "phone": "09961217945",
      "name": "پشتیبان فروشگاه",
      "role": "support",
      "wallet": 100000,
      "points": 800,
      "referralCode": "VESTASUPPORT",
      "referredBy": null,
      "createdAt": 1790360664343,
      "token": null,
      "isBanned": false
    },
    {
      "id": "u-demo",
      "phone": "09120000000",
      "name": "کاربر نمونه",
      "role": "customer",
      "wallet": 250000,
      "points": 1250,
      "referralCode": "VESTADEMO1",
      "referredBy": null,
      "createdAt": 1792952664343,
      "token": null,
      "isBanned": false
    }
  ],
  "categories": [
    {
      "id": "cat-shoes",
      "name": "کفش",
      "slug": "shoes",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
      "description": "کفش‌های اسپرت، مجلسی و روزمره"
    },
    {
      "id": "cat-winter",
      "name": "لباس زمستانه",
      "slug": "winter",
      "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
      "description": "کاپشن، هودی، بافت و پالتو"
    },
    {
      "id": "cat-summer",
      "name": "لباس تابستونه",
      "slug": "summer",
      "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "description": "تیشرت، پیراهن و لباس‌های خنک تابستانی"
    },
    {
      "id": "cat-accessories",
      "name": "اکسسوری",
      "slug": "accessories",
      "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
      "description": "کیف، ساعت، کمربند و اکسسوری‌های شیک"
    },
    {
      "id": "cat-women",
      "name": "زنانه",
      "slug": "women",
      "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
      "description": "پوشاک زنانه؛ مانتو، شومیز و پیراهن"
    },
    {
      "id": "cat-men",
      "name": "مردانه",
      "slug": "men",
      "image": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop",
      "description": "پوشاک مردانه؛ پیراهن، شلوار و کت"
    }
  ],
  "products": [
    {
      "id": "p1",
      "title": "کاپشن چرم مردانه کلاسیک",
      "categoryId": "cat-winter",
      "price": 2890000,
      "oldPrice": 3490000,
      "stock": 14,
      "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "کاپشن چرم اصل با آستر گرم، دوخت درجه‌یک و طراحی کلاسیک. مناسب پاییز و زمستان، ضد آب و باد.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.8,
      "reviewsCount": 17,
      "isFlash": true,
      "flashEnds": 1795638264343,
      "isActive": true,
      "createdAt": 1793989464343,
      "createdBy": "admin",
      "soldCount": 39
    },
    {
      "id": "p2",
      "title": "هودی اورسایز پشمی",
      "categoryId": "cat-winter",
      "price": 890000,
      "oldPrice": 1190000,
      "stock": 32,
      "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "هودی نرم و گرم با پارچه پشمی، جیب کانگورویی و کلاه بزرگ. انتخابی راحت برای روزهای سرد.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.6,
      "reviewsCount": 19,
      "isFlash": true,
      "flashEnds": 1795638264343,
      "isActive": true,
      "createdAt": 1794680664343,
      "createdBy": "admin",
      "soldCount": 89
    },
    {
      "id": "p3",
      "title": "کفش رانینگ نایک ایرزوم",
      "categoryId": "cat-shoes",
      "price": 1950000,
      "oldPrice": 2400000,
      "stock": 21,
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "کفش رانینگ سبک با زیره ایرزوم، تنفس‌پذیر و مناسب دویدن و استفاده روزانه.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.7,
      "reviewsCount": 7,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1795371864343,
      "createdBy": "admin",
      "soldCount": 12
    },
    {
      "id": "p4",
      "title": "کفش اسنیکر سفید مینیمال",
      "categoryId": "cat-shoes",
      "price": 1290000,
      "oldPrice": null,
      "stock": 45,
      "image": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "اسنیکر سفید مینیمال با چرم طبیعی، ست‌شونده با هر استایلی. زیره راحت و ضد لغزش.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.5,
      "reviewsCount": 31,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1794680664343,
      "createdBy": "admin",
      "soldCount": 29
    },
    {
      "id": "p5",
      "title": "تیشرت بیسیک نخی یقه‌دار",
      "categoryId": "cat-summer",
      "price": 390000,
      "oldPrice": 520000,
      "stock": 80,
      "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "تیشرت نخی ۱۰۰٪ پنبه، نرم و خنک برای تابستان. رنگ‌بندی متنوع و فرم آزاد.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.4,
      "reviewsCount": 5,
      "isFlash": true,
      "flashEnds": 1795638264343,
      "isActive": true,
      "createdAt": 1795285464343,
      "createdBy": "admin",
      "soldCount": 108
    },
    {
      "id": "p6",
      "title": "پیراهن لینن تابستانی",
      "categoryId": "cat-summer",
      "price": 790000,
      "oldPrice": null,
      "stock": 28,
      "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "پیراهن لینن سبک و تنفس‌پذیر، ایده‌آل برای روزهای گرم. برش راحت و شیک.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.6,
      "reviewsCount": 18,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1795544664343,
      "createdBy": "admin",
      "soldCount": 17
    },
    {
      "id": "p7",
      "title": "پیراهن مجلسی زنانه ساتن",
      "categoryId": "cat-women",
      "price": 1190000,
      "oldPrice": 1490000,
      "stock": 18,
      "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "پیراهن ساتن براق با فرم خوش‌نشین، مناسب مهمانی و استفاده روزمره شیک.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.7,
      "reviewsCount": 21,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1794594264343,
      "createdBy": "admin",
      "soldCount": 31
    },
    {
      "id": "p8",
      "title": "مانتو کتی زنانه",
      "categoryId": "cat-women",
      "price": 1590000,
      "oldPrice": null,
      "stock": 22,
      "image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "مانتو کتی با پارچه کرپ، دوخت تمیز و جزئیات ظریف. مناسب بهار و تابستان.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.5,
      "reviewsCount": 36,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1793903064343,
      "createdBy": "admin",
      "soldCount": 31
    },
    {
      "id": "p9",
      "title": "شلوار جین اسکینی",
      "categoryId": "cat-men",
      "price": 690000,
      "oldPrice": 890000,
      "stock": 36,
      "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "جین اسکینی کشی با فیت عالی، رنگ ثابت و راحت برای استفاده روزانه.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.4,
      "reviewsCount": 11,
      "isFlash": true,
      "flashEnds": 1795638264343,
      "isActive": true,
      "createdAt": 1794335064343,
      "createdBy": "admin",
      "soldCount": 51
    },
    {
      "id": "p10",
      "title": "پیراهن مردانه آکسفورد",
      "categoryId": "cat-men",
      "price": 590000,
      "oldPrice": null,
      "stock": 40,
      "image": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "پیراهن آکسفورد کلاسیک با یقه دکمه‌دار، مناسب کار و مهمانی.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.3,
      "reviewsCount": 19,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1794075864343,
      "createdBy": "admin",
      "soldCount": 83
    },
    {
      "id": "p11",
      "title": "کیف چرم دوشی",
      "categoryId": "cat-accessories",
      "price": 1490000,
      "oldPrice": 1890000,
      "stock": 12,
      "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "کیف چرم طبیعی با جیب‌های کاربردی و بند قابل تنظیم. دست‌ساز و بادوام.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.8,
      "reviewsCount": 12,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1795458264343,
      "createdBy": "admin",
      "soldCount": 102
    },
    {
      "id": "p12",
      "title": "ساعت مچی کلاسیک",
      "categoryId": "cat-accessories",
      "price": 2290000,
      "oldPrice": null,
      "stock": 9,
      "image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "ساعت مچی با بند چرم و صفحه مینیمال، ضد آب تا ۳ ATM. هدیه‌ای شیک.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.6,
      "reviewsCount": 41,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1793989464343,
      "createdBy": "admin",
      "soldCount": 53
    },
    {
      "id": "p13",
      "title": "بافت یقه‌دار زنانه",
      "categoryId": "cat-winter",
      "price": 990000,
      "oldPrice": 1290000,
      "stock": 25,
      "image": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "بافت نرم و لطیف با یقه‌دار، گرم و راحت برای زمستان.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.5,
      "reviewsCount": 14,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1794507864343,
      "createdBy": "admin",
      "soldCount": 105
    },
    {
      "id": "p14",
      "title": "شلوارک جین تابستانی",
      "categoryId": "cat-summer",
      "price": 490000,
      "oldPrice": null,
      "stock": 50,
      "image": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "شلوارک جین خنک و راحت برای تابستان، فیت آزاد و رنگ روشن.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.2,
      "reviewsCount": 16,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1794507864343,
      "createdBy": "admin",
      "soldCount": 110
    },
    {
      "id": "p15",
      "title": "کت تک مردانه",
      "categoryId": "cat-men",
      "price": 2490000,
      "oldPrice": 2990000,
      "stock": 11,
      "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "کت تک با برش مدرن و پارچه پشمی، مناسب مراسم و استایل رسمی.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.7,
      "reviewsCount": 18,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1794421464343,
      "createdBy": "admin",
      "soldCount": 118
    },
    {
      "id": "p16",
      "title": "کفش پاشنه‌دار مجلسی",
      "categoryId": "cat-shoes",
      "price": 1390000,
      "oldPrice": null,
      "stock": 16,
      "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop"
      ],
      "description": "کفش پاشنه‌دار شیک و راحت با زیره نرم، مناسب مجالس.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colors": [
        "#5e6d8c",
        "#eacec5",
        "#bac2d9",
        "#222",
        "#fff"
      ],
      "rating": 4.4,
      "reviewsCount": 32,
      "isFlash": false,
      "flashEnds": null,
      "isActive": true,
      "createdAt": 1794248664343,
      "createdBy": "admin",
      "soldCount": 114
    }
  ],
  "otps": [],
  "orders": [],
  "coupons": [
    {
      "id": "c1",
      "code": "WELCOME10",
      "percent": 10,
      "maxDiscount": 200000,
      "minAmount": 500000,
      "isActive": true,
      "usageLimit": 1000,
      "usedCount": 12,
      "createdAt": 1795544664343
    },
    {
      "id": "c2",
      "code": "VESTA20",
      "percent": 20,
      "maxDiscount": 500000,
      "minAmount": 1500000,
      "isActive": true,
      "usageLimit": 500,
      "usedCount": 5,
      "createdAt": 1795544664343
    },
    {
      "id": "c3",
      "code": "FREESHIP",
      "percent": 0,
      "maxDiscount": 0,
      "minAmount": 0,
      "isActive": true,
      "usageLimit": 1000,
      "usedCount": 20,
      "freeShipping": true,
      "createdAt": 1795544664343
    }
  ],
  "walletTx": [
    {
      "id": "tx_40fa02bfb294",
      "userId": "u-demo",
      "amount": 250000,
      "type": "gift",
      "description": "هدیه عضویت باشگاه مشتریان",
      "createdAt": 1792952664343
    },
    {
      "id": "tx_bcf36880f136",
      "userId": "u-admin",
      "amount": 500000,
      "type": "charge",
      "description": "شارژ اولیه کیف پول مدیر",
      "createdAt": 1787768664343
    }
  ],
  "reviews": [
    {
      "id": "r_85a5463367ef",
      "productId": "p1",
      "userId": "u-demo",
      "userName": "کاربر نمونه",
      "rating": 5,
      "comment": "کیفیت عالی، دقیقاً مثل عکس بود. ارسال هم سریع انجام شد.",
      "createdAt": 1795112664343
    },
    {
      "id": "r_4eda1ce98ffc",
      "productId": "p3",
      "userId": "u-demo",
      "userName": "کاربر نمونه",
      "rating": 4,
      "comment": "خیلی راحته، برای دویدن عالیه.",
      "createdAt": 1795285464343
    }
  ],
  "settings": {
    "siteName": "پوشاک وستا",
    "freeShippingThreshold": 1000000,
    "shippingCost": 49000,
    "pointsPer100k": 10,
    "walletGiftOnSignup": 50000,
    "referralBonus": 30000,
    "supportPhone": "09961217945"
  },
  "seq": {
    "order": 1000
  }
};
