# Multi-Role Testing Guide (Same Browser, Different Tabs)

## ✅ What's Changed

Your application now uses **sessionStorage** instead of **localStorage** for storing user authentication data. This allows each browser tab to maintain its **own independent session**.

### Key Changes:

- **localStorage** → **sessionStorage** for user and admin data
- Each tab now has its own session that doesn't interfere with others
- Login sessions are isolated per tab
- No cross-tab session conflicts

---

## 🧪 How to Test Multiple Roles

### Test Scenario: Login as User, Seller, and Admin in Separate Tabs

**Step 1: Prepare Test Accounts**
Make sure you have test credentials for:

- Regular User (role: `user`)
- Seller (role: `seller`)
- Admin (role: `admin`)

**Step 2: Open 3 Browser Tabs**

**Tab 1 - Regular User:**

1. Open `http://localhost:5173` (or your frontend URL)
2. Login with user credentials
3. You should see: User Navbar, Cart, Orders, Favorites, etc.

**Tab 2 - Seller:**

1. Open `http://localhost:5173` in a **new tab**
2. Login with seller credentials
3. You should see: Seller Dashboard, Products, Inventory, Orders (seller view), Analytics, etc.
4. **Tab 1 still shows user interface** - not affected!

**Tab 3 - Admin:**

1. Open `http://localhost:5173/admin/login` in a **new tab**
2. Login with admin credentials
3. You should see: Admin Dashboard, Shop Management, User Management, Analytics, etc.
4. **Tab 1 and Tab 2 still show their respective interfaces** - completely independent!

---

## 🔍 Verify Isolation

### Test 1: Cross-Tab Logout

1. In Tab 2 (Seller), click Logout
2. You should see: Seller is logged out
3. **Tab 1 (User) should STILL be logged in** ✓
4. **Tab 3 (Admin) should STILL be logged in** ✓

### Test 2: Session Refresh

1. In Tab 1, refresh the page (F5)
2. **User session persists** in that tab ✓
3. Tab 2 and Tab 3 remain unchanged ✓

### Test 3: Switch Between Roles

1. In Tab 1 (User role), note your username
2. Go to Tab 2 (Seller role), note the different username
3. Go back to Tab 1 - still shows original user ✓
4. All tabs maintain their independent identities ✓

---

## 🛠️ Technical Details

### Files Modified:

The following files were updated to use `sessionStorage` instead of `localStorage`:

**Context Files:**

- `src/context/AuthContext.jsx`
- `src/context/AdminContext.jsx`

**Component Files:**

- `src/components/SellerNavbar.jsx`

**Layout Files:**

- `src/layouts/SellerLayout.jsx`

**User Pages:**

- `src/pages/user/Orders.jsx`
- `src/pages/user/Checkout.jsx`

**Seller Pages:**

- `src/pages/seller/Profile.jsx`
- `src/pages/seller/Analytics.jsx`
- `src/pages/seller/Inventory.jsx`
- `src/pages/seller/CreateShop.jsx`
- `src/pages/seller/Orders.jsx`
- `src/pages/seller/Products.jsx`

**Admin Pages:**

- `src/pages/admin/Dashboard.jsx`
- `src/pages/admin/Analytics.jsx`
- `src/pages/admin/Settings.jsx`
- `src/pages/admin/AdminManagement.jsx`
- `src/pages/admin/ShopManagement.jsx`

### How It Works:

```javascript
// BEFORE (localStorage - shared across all tabs)
const user = JSON.parse(localStorage.getItem("user"));

// AFTER (sessionStorage - independent per tab)
const user = JSON.parse(sessionStorage.getItem("user"));
```

**Key Difference:**
| Feature | localStorage | sessionStorage |
|---------|-------------|-----------------|
| Scope | Browser-wide (all tabs) | Tab-specific |
| Persistence | Survives tab close | Lost when tab closes |
| Use Case | Settings, preferences | Session data |

---

## ⚠️ Important Notes

1. **Cookies still work browser-wide**: Backend JWT tokens are sent via `credentials: "include"` in cookies, which work across tabs (for API calls)
2. **Frontend state is now tab-isolated**: UI state and user info are now separate per tab
3. **Logout affects only current tab**: When you logout in one tab, other tabs remain logged in (as expected with sessionStorage)
4. **Refresh behavior**: Each tab maintains its own session after refresh

---

## 🎯 Use Cases

### Development Testing:

- Test user flow while logged in as seller
- Test admin features without logging out of user account
- Compare UI differences between roles simultaneously

### Bug Debugging:

- Reproduce seller-specific bugs while keeping user session active
- Test order interactions from both buyer and seller perspective at once

### Demo/Presentation:

- Show multiple user roles in action side-by-side
- Demonstrate order flow from both perspectives

---

## ✅ Troubleshooting

| Issue                          | Solution                                              |
| ------------------------------ | ----------------------------------------------------- |
| All tabs still share session   | Clear browser cache and hard-refresh (Ctrl+Shift+R)   |
| Can't login after logout       | Refresh the tab and try again                         |
| Lost session after tab refresh | Normal behavior - close and reopen tab to login again |
| Cookies not working            | Ensure backend is sending `credentials: include`      |

---

## 🚀 Ready to Test!

Start your frontend and backend servers and open those 3 tabs. You should now have independent sessions for User, Seller, and Admin all running simultaneously!
