# Equipment Rental System - Updated Documentation

## Overview

This WordPress plugin provides a comprehensive equipment rental management system with single and multi-item booking capabilities, featuring an improved date-first workflow for optimal user experience.

## Recent Updates

### 1. Fixed Price Calculation
- **Deposit Issue Fixed**: Deposit is now properly included in the total rental price
- **Weekend Pricing Updated**: Weekend rates now apply to Friday-Sunday (instead of Saturday-Sunday)
- **Improved Logic**: Better detection of weekend periods for accurate pricing

### 2. Enhanced Multi-Request System with Date-First UX
- **Date-First Workflow**: Users must select dates before seeing equipment
- **Real-Time Availability**: Only available equipment is shown for selected dates
- **Smart Filtering**: Equipment availability calculated based on existing bookings
- **Dedicated Checkout**: Separate checkout page for professional booking experience
- **Live Price Calculation**: Real-time totals based on selected rental period

## Improved User Experience Flow

### Multi-Request Workflow (NEW!)
1. **📅 Select Dates First** → User picks rental period at the top
2. **🔍 Check Availability** → System filters to show only available items
3. **🛒 Add to Cart** → Select quantities and build cart with live pricing
4. **💳 Proceed to Checkout** → Navigate to dedicated checkout page
5. **📋 Complete Booking** → Fill details and submit final request

### Benefits of New Flow:
- **No Wasted Time**: Only see equipment that's actually available
- **Accurate Pricing**: Totals calculated immediately based on dates
- **Professional UX**: Separate checkout page like e-commerce sites
- **Clear Process**: Step-by-step guided workflow

## Shortcodes Available

### 1. Single-Item Catalog: `[equipment_catalog]`
Traditional one-item-at-a-time rental system.

**Parameters:**
- `category`: Filter by equipment category slug
- `limit`: Number of items to display (default: 12)
- `columns`: Grid layout columns (default: 3)

**Example:**
```
[equipment_catalog category="microphones" limit="8" columns="4"]
```

### 2. Multi-Item Cart System: `[equipment_rental_cart]`
**ENHANCED!** Date-first shopping cart system with availability filtering.

**Parameters:**
- `category`: Filter by equipment category slug
- `limit`: Number of items to display (default: 12) 
- `columns`: Grid layout columns (default: 3)

**Example:**
```
[equipment_rental_cart limit="20" columns="3"]
```

**New Features:**
- Date selection at the top (required first step)
- Availability checking with feedback
- Only shows equipment available for selected dates
- Floating cart with rental period display
- "Zur Kasse" button for professional checkout

### 3. Checkout Page: `[equipment_checkout]`
**NEW!** Dedicated checkout page for final booking submission.

**Usage:**
Create a new WordPress page (e.g., `/checkout/`) and add:
```
[equipment_checkout]
```

**Features:**
- Complete rental period summary
- Detailed equipment list with quantities
- Full price breakdown (rental + deposits)
- Professional contact form
- Form validation and error handling
- Success confirmation with email notifications

### 4. Category Filter: `[equipment_category_filter]`
Search and filter functionality for equipment catalog.

**Parameters:**
- `show_all`: Display "All" category button (default: true)
- `show_search`: Display search input (default: true)

**Example:**
```
[equipment_category_filter]
[equipment_catalog]
```

## Implementation Guide

### Setting Up Multi-Request System

**1. Create Multi-Request Page**
```html
<h2>Equipment mieten - Mehrere Artikel</h2>
<p>Wählen Sie Ihren gewünschten Mietzeitraum und fügen Sie Equipment zu Ihrem Warenkorb hinzu.</p>

[equipment_rental_cart limit="30" columns="3"]
```

**2. Create Checkout Page**
Create a new page at `/checkout/` with:
```html
<h1>Checkout - Mietanfrage abschließen</h1>
[equipment_checkout]
```

**3. Update JavaScript Redirect**
In `rental-system.js`, update the checkout URL:
```javascript
// Line ~375
window.location.href = '/checkout/'; // Update to your checkout page URL
```

### Setting Up Single-Item System
```html
<h2>Our Equipment</h2>
[equipment_category_filter]
[equipment_catalog limit="12" columns="3"]
```

## Technical Implementation

### Date-First Availability Checking

The system now checks real availability by:
1. **Querying Existing Bookings**: Checks both single and multi-bookings
2. **Date Overlap Detection**: Identifies conflicting rental periods
3. **Quantity Calculation**: Subtracts booked quantities from total inventory
4. **Real-Time Updates**: Recalculates when dates change

### Smart Booking Conflict Detection
```php
// Checks for overlapping bookings
$overlapping_bookings = get_posts(array(
    'meta_query' => array(
        array(
            'key' => '_rental_start',
            'value' => $end_date,
            'compare' => '<='
        ),
        array(
            'key' => '_rental_end', 
            'value' => $start_date,
            'compare' => '>='
        )
    )
));
```

### Checkout Data Flow
1. **Cart Storage**: Uses localStorage for checkout data transfer
2. **Data Validation**: Server-side validation of all booking data
3. **Email Integration**: Automatic notifications to admin and customer
4. **Booking Creation**: Creates unified booking post with cart data

## Pricing Logic (Updated)

### Weekend Detection (Friday-Sunday)
- **3 days**: Friday to Sunday 
- **2 days**: Friday-Saturday, Saturday-Sunday, or Friday-Sunday
- **Rate**: Uses `wochenendmiete` if available

### Pricing Hierarchy
1. **Monthly**: 28+ days uses `monatsmiete`
2. **Weekly**: 7-27 days uses `wochenmiete` 
3. **Weekend**: Friday-Sunday uses `wochenendmiete`
4. **Daily**: Default uses `tagesmiete`

### Total Calculation
```
Total = Rental Price + Deposit
```
Both rental price and deposit are properly included in displayed totals.

## Styling and Customization

### Color Scheme
- **Primary**: `#1a1a1a` (deep black)
- **Secondary**: `#333` (medium gray)
- **Accent**: `#666` (light gray)
- **Background**: `#f8f8f8` (very light gray)

### Responsive Design
- **Desktop**: Fixed cart positioning, multi-column layouts
- **Mobile**: Responsive cart, stacked form layouts
- **Touch-Friendly**: Large buttons and input fields

### Custom CSS Hooks
```css
.rental-date-selection { /* Date picker section */ }
.equipment-selection-section { /* Equipment grid area */ }
.rental-cart { /* Floating cart widget */ }
.equipment-checkout { /* Checkout page styles */ }
```

## Backend Management

### Enhanced Booking Types
- **Single**: Traditional one-equipment booking
- **Multi**: Shopping cart booking with detailed equipment list
- **Booking Details**: Shows equipment breakdown and quantities

### Admin Features
- **Visual Indicators**: Multi-bookings clearly marked in admin
- **Equipment Links**: Direct links to individual equipment pages
- **Status Management**: Same workflow for all booking types
- **Enhanced Emails**: Detailed equipment lists in notifications

## API Endpoints

### New AJAX Actions
- `check_equipment_availability`: Filters equipment by date range
- `multi_rental_request`: Processes multi-item bookings
- `calculate_rental_price`: Calculates pricing for date ranges

### Data Structure
```json
{
  "cart": [
    {
      "equipmentId": 123,
      "title": "Shure SM58",
      "quantity": 2,
      "dailyRate": 15.00,
      "deposit": 50.00
    }
  ],
  "dates": {
    "start": "2024-01-15",
    "end": "2024-01-17",
    "days": 3
  }
}
```

## Migration and Compatibility

### Backwards Compatibility
- Existing single-item bookings work unchanged
- Old `[equipment_catalog]` shortcode still functional
- Admin interface supports both booking types

### Database Changes
- New meta fields: `_booking_type`, `_cart_data`, `_total_items`
- Enhanced availability checking functions
- No data migration required

## Performance Considerations

### Optimization Features
- **Efficient Queries**: Smart booking overlap detection
- **Client-Side Storage**: localStorage reduces server requests
- **AJAX Loading**: Equipment loads only when needed
- **Caching-Friendly**: Static shortcode output

This enhanced system provides a professional, user-friendly rental experience with industry-standard UX patterns and comprehensive booking management. 