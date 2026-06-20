/* Plexa – E-Ticaret Platformu */

Plexa, kullanıcıların en yeni teknoloji ürünlerini kolayca keşfetmesini, sepetine eklemesini ve güvenle sipariş vermesini sağlayan; satıcıların ise ürünlerini ve siparişlerini profesyonelce yönetebildiği tam kapsamlı bir e-ticaret platformudur.

* Özellikler : 

 -> Ürün Listeleme ve Filtreleme: Kategori bazlı gelişmiş filtreleme ve arama sistemi ile ürünlere hızlı erişim.
 -> Sepet ve Sipariş Yönetimi: Dinamik sepet sistemi, adres yönetimi ve adım adım sipariş oluşturma süreci.
 -> Gelişmiş Satıcı Paneli: Satıcıların kendi ürünlerini ekleyebildiği, siparişlerini yönetebildiği ve istatistiklerini takip edebildiği arayüz.
 -> Profesyonel Admin Paneli: Tüm platform verilerini, kullanıcı rollerini ve sistem ayarlarını yöneten merkezi kontrol merkezi.
 -> Kullanıcı Yorumları ve Puanlama: Teslim edilen siparişler üzerinden gerçek kullanıcı geri bildirimleri ve yıldız değerlendirmeleri.
 -> Favoriler ve Kupon Sistemi: Ürünleri favorilere ekleme, kişiselleştirilmiş indirim kuponları tanımlama ve kullanma.
 -> Zırhlı API Mimarisi: Rate Limit, Helmet ve Girdi Doğrulama ile halka açık yayına hazır güvenli yapı.
 -> Modern UI/UX: Glassmorphism destekli, responsive ve karanlık tema odaklı premium kullanıcı arayüzü.

* Kullanılan Teknolojiler :

    Frontend : 

   -> React.js (Vite)
   -> Vanilla CSS (Modern & Glassmorphism)
   -> Framer Motion (Akıcı Animasyonlar)
   -> React Icons (Zengin İkon Seti)
   -> React Hot Toast (Bildirim Yönetimi)

    Backend :

   -> Node.js (Express)
   -> PostgreSQL (NeonDB)
   -> JWT & BcryptJS (Güvenli Kimlik Yönetimi)
   -> Helmet & Express Rate Limit (API Güvenliği)

* Geliştirici : Eren Söğütlü

-----------------------------------------------------------------------------------------------------------------

/* Plexa – E-Commerce Platform */

Plexa is a comprehensive e-commerce platform that enables users to easily discover the latest tech products, add them to their cart, and order securely, while providing sellers with a professional dashboard to manage their products and orders.

* Features : 

 -> Product Listing and Filtering: Fast access to products with an advanced category-based filtering and search system.
 -> Cart and Order Management: Dynamic cart system, address management, and a step-by-step order creation process.
 -> Advanced Seller Panel: An interface where sellers can add their own products, manage orders, and track statistics.
 -> Professional Admin Panel: A central control hub managing all platform data, user roles, and system settings.
 -> User Reviews and Ratings: Real user feedback and star ratings based on delivered orders.
 -> Favorites and Coupon System: Ability to favorite products and define/use personalized discount coupons.
 -> Armored API Architecture: Secure structure ready for public release with Rate Limiting, Helmet, and Input Validation.
 -> Modern UI/UX: Premium user interface with Glassmorphism support, responsive design, and dark theme focus.

* Technologies Used : 

    Frontend : 

   -> React.js (Vite)
   -> Vanilla CSS (Modern & Glassmorphism)
   -> Framer Motion (Smooth Animations)
   -> React Icons
   -> React Hot Toast

    Backend : 

   -> Node.js (Express)
   -> PostgreSQL (NeonDB)
   -> JWT & BcryptJS
   -> Helmet & Express Rate Limit

* Developer : Eren Söğütlü

-----------------------------------------------------------------------------------------------------------------

## Kurulum ve Çalıştırma

### 1. Gerekli Paketlerin Yüklenmesi

Frontend için:

```bash
cd frontend
npm install
```

Backend için:

```bash
cd backend
npm install
```

---

### 2. Çevre Değişkenleri Ayarları (.env)

Backend tarafında `backend` dizininde `.env` dosyasını oluşturup bilgileri girin:

```env
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=production
```

---

### 3. Projeyi Çalıştırma

Kurulum tamamlandıktan sonra iki ayrı terminal kullanın:

#### Backend (Sunucu)

```bash
cd backend
npm start
```

> Sunucu: http://localhost:5000

---

#### Frontend (Arayüz)

```bash
cd frontend
npm run dev
```

> Uygulama: http://localhost:5173

-----------------------------------------------------------------------------------------------------------------

## Installation and Operation

### 1. Installing Required Packages

For frontend:

```bash
cd frontend
npm install
```

For backend:

```bash
cd backend
npm install
```

---

### 2. Environment Variables Settings (.env)

Create an `.env` file in the `backend` directory and fill in the contents:

```env
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=production
```

---

### 3. Running the Project

Once the installation is complete, use two separate terminals:

#### Backend

```bash
cd backend
npm start
```

> Server: http://localhost:5000

---

#### Frontend

```bash
cd frontend
npm run dev
```

> Application: http://localhost:5173