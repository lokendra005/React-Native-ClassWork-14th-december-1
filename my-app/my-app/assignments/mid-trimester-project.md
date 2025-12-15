* 🏗 App architecture
* 📱 Screens required
* 🧠 Data models
* 🔌 APIs & Expo features
* 🧩 Core logic
* ✅ Final checklist



---

# ✅ 1. **City Pulse – Smart City News & Alerts App**

## 🏗 Project Setup

```bash
npx create-expo-app city-pulse
cd city-pulse
npm install axios react-native-webview @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
```

---

## 📱 Screens

1. **City Selector Screen**
2. **News Feed Screen**
3. **News WebView Screen**
4. **Bookmarks Screen**
5. **Emergency Alerts Screen**

---

## 🧠 Data Models

```js
News = {
  title: string,
  description: string,
  image: string,
  url: string,
  date: string
}
```

---

## 🔌 API

Use:

* NewsAPI.org
  or
* GNews API

---

## 🧩 Build Flow

### 1️⃣ City Selection

* Use `Picker` or `Modal`
* Store selected city in `useState`
* Pass city to news API query

---

### 2️⃣ Fetch News

Using Axios:

```js
axios.get(`https://newsapi.org/v2/everything?q=${city}`)
```

* Store in `useState`
* Show via `FlatList`

---

### 3️⃣ Open News in WebView

```js
<WebView source={{ uri: article.url }} />
```

---

### 4️⃣ Bookmarking

* Use `AsyncStorage`
* Add/remove bookmarks
* Load bookmarks on app start

---

### 5️⃣ Emergency Alerts

* Hardcoded JSON list
* Color-coded cards
* Optional API-based alerts

---

## ✅ Final Checklist

✅ City-based news
✅ WebView integration
✅ Bookmark system
✅ Emergency section
✅ Pull-to-refresh

---

# ✅ 2. **Pocket Bazaar – Mini E-Commerce App**

## 🏗 Setup

```bash
npx create-expo-app pocket-bazaar
npm install axios @react-navigation/native
```

---

## 📱 Screens

1. Product List
2. Product Details
3. Cart
4. Checkout
5. Orders History

---

## 🧠 Data Models

```js
Product = {
  id, title, price, image, description
}

CartItem = {
  product,
  quantity
}
```

---

## 🔌 API

Use:

* FakeStore API

```
https://fakestoreapi.com/products
```

---

## 🧩 Build Steps

### 1️⃣ Product Listing

* Fetch products
* Render using `FlatList`

---

### 2️⃣ Product Detail Page

* Show image, title, description
* “Add to Cart” button

---

### 3️⃣ Cart Logic

* Store cart in `useState`
* Increment/decrement quantity
* Auto price calculation

---

### 4️⃣ Checkout Form

* Name, address, phone
* Validate empty fields
* On submit → Save order in AsyncStorage

---

### 5️⃣ Order History

* Show previous orders from storage

---

## ✅ Final Checklist

✅ Shopping flow
✅ Cart persistence
✅ Checkout validation
✅ History tracking

---

# ✅ 3. **Campus Mate – Student Utility App**

## 🏗 Setup

```bash
npx create-expo-app campus-mate
npx expo install expo-document-picker expo-notifications
npm install axios react-native-webview
```

---

## 📱 Screens

1. Dashboard
2. Timetable
3. Assignment Tracker
4. Notes
5. Announcements
6. Campus Map

---

## 🧠 Data Models

```js
Assignment = {
  title, subject, deadline, status
}
```

---

## 🧩 Build Steps

### 1️⃣ Timetable

* Static JSON
* Render using `FlatList`

---

### 2️⃣ Assignment CRUD

* Add / Edit / Delete
* Store in AsyncStorage
* Filter by subject & date

---

### 3️⃣ Notes Upload

* Use `DocumentPicker`
* Show file list with delete

---

### 4️⃣ Announcements

* API Fetch
* FlatList display

---

### 5️⃣ Campus Map

* Google Maps embedded via WebView

---

## ✅ Final Checklist

✅ Local file uploads
✅ Task management
✅ Announcement feed
✅ Campus navigation

---

# ✅ 4. **Travel Buddy – Trip Planner**

## 🏗 Setup

```bash
npx create-expo-app travel-buddy
npx expo install expo-image-picker
npm install axios
```

---

## 📱 Screens

1. Trip List
2. Create Trip
3. Itinerary Planner
4. Expense Tracker
5. Trip Gallery
6. Trip Summary

---

## 🧠 Data Models

```js
Trip = {
  name, startDate, endDate,
  itinerary: [],
  expenses: [],
  images: []
}
```

---

## 🧩 Build Steps

### 1️⃣ Trip Creation

* Form with date picker
* Validate start < end date

---

### 2️⃣ Daily Planner

* Add activities per day
* Store inside Trip object

---

### 3️⃣ Expense Tracker

* Amount + category
* Auto sum calculation

---

### 4️⃣ Photo Upload

* `ImagePicker.launchImageLibraryAsync()`
* Save image URI

---

### 5️⃣ Currency API

* Convert total using exchangerate API

---

## ✅ Final Checklist

✅ Multiple trips
✅ Expenses total
✅ Daily planning
✅ Gallery support

---

# ✅ 5. **FitTrack Pro – Fitness & Diet App**

## 🏗 Setup

```bash
npx create-expo-app fittrack-pro
npx expo install expo-notifications
npm install react-native-chart-kit
```

---

## 📱 Screens

1. Dashboard
2. Workout Tracker
3. Water Tracker
4. Meal Tracker
5. Weekly Report
6. Profile

---

## 🧠 Data Models

```js
Workout = { type, duration, calories }
Meal = { food, calories }
```

---

## 🧩 Build Steps

### 1️⃣ Daily Trackers

* Reset at midnight using date check
* Store daily data in AsyncStorage

---

### 2️⃣ Goal System

* User sets daily water & calorie goal
* Show % achieved

---

### 3️⃣ Weekly Chart

* Aggregate 7-day data
* Show progress graph

---

### 4️⃣ Notifications

* Water reminder
* Workout reminder

---

## ✅ Final Checklist

✅ Goal setting
✅ Graph analytics
✅ Notifications
✅ Profile tracking

