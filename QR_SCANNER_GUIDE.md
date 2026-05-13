# QR Code Scanner Integration Guide

## Overview
The Maankuli Restaurant system supports scanning QR codes from both built-in smartphone cameras and third-party QR scanner applications.

## How It Works

### QR Code Format
All table QR codes contain URLs in the following format:
```
http://localhost:3000/scan?table=1
```

Replace `localhost:3000` with your restaurant's domain and `1` with the actual table number.

### Scanner Flow

#### 1. **Built-in Smartphone Camera**
- User points camera at a table QR code
- Smartphone camera app recognizes the QR code
- Tapping the notification or link opens the `/scan` endpoint
- Server redirects to `scan.html` for processing
- `scan.html` redirects to `order.html?table={tableNumber}`
- Customer sees their table's menu and can order

#### 2. **Third-Party QR Scanner Apps**
- User opens their preferred QR scanner app (Google Lens, QR Reader, etc.)
- Points app at a table QR code
- App scans and displays the URL
- User taps on the URL or "Open" button
- Browser opens to the `/scan` endpoint
- Same flow as above: redirect → processing → order page

### Server Endpoints

#### `/scan` (GET)
- **Purpose**: Handles QR code scan redirects
- **Query Parameters**: 
  - `table` (required): Table number (1-10)
- **Response**: Redirects to `/scan.html?table={table}`
- **Example**: `/scan?table=5` → `/scan.html?table=5`

#### `/scan.html` (GET)
- **Purpose**: Landing page that processes table parameter
- **Features**:
  - Shows loading animation
  - Displays table number
  - Redirects to `/order.html?table={table}`
  - Handles errors for invalid QR codes

#### `/order.html` (GET)
- **Purpose**: Main ordering page
- **Query Parameters**:
  - `table` (required): Table number
- **Features**:
  - Displays table-specific menu
  - Processes orders
  - Shows cooking animations

### File Structure

```
server.js          # Express server with /scan route
scan.html          # QR scan landing/redirect page
order.html         # Customer ordering page
order.js           # Order page logic
index.html         # Homepage with QR display and info
script.js          # Homepage logic & QR generation
styles.css         # Styling for all pages
```

## Testing External Scanner Apps

### Using Google Lens
1. Open Google Lens
2. Point camera at table QR code
3. Tap the URL that appears
4. App redirects through `/scan` → `/scan.html` → `/order.html`

### Using iOS Camera App
1. Open Camera app
2. Point at table QR code
3. Tap notification "Scan for..." 
4. Browser opens and follows redirect flow

### Using QR Scanner App
1. Open your QR scanner app
2. Scan a table QR code
3. App shows the URL
4. Tap "Open" or tap the URL directly
5. Browser follows the redirect flow

## Error Handling

- **Invalid Table Number**: `scan.html` displays error message and offers home button
- **Missing Table Parameter**: Redirects to homepage
- **Network Issues**: Browser's standard error handling applies

## Customization

### Change QR Code Format
Edit `getTableQrUrl()` in `script.js`:
```javascript
function getTableQrUrl(tableId) {
  return `${window.location.origin}/scan?table=${tableId}`;
}
```

### Update Redirect Behavior
Edit the `/scan` route in `server.js`:
```javascript
app.get('/scan', (req, res) => {
  const table = req.query.table;
  // Custom logic here
  res.redirect(`/scan.html?table=${table}`);
});
```

### Modify Landing Page
Edit `scan.html` to customize:
- Loading animation
- Error messages
- Redirect delay
- Styling

## Browser Compatibility

The QR system works with:
- ✅ All modern browsers (Chrome, Safari, Firefox, Edge)
- ✅ iOS 11+
- ✅ Android 6+
- ✅ Third-party scanner apps that support URL opening

## Security Considerations

- QR codes link to relative URLs (`/scan?table=...`)
- Server validates table numbers (1-10)
- No sensitive data in QR codes
- Uses standard HTTP redirects
- Works over both HTTP and HTTPS

## Future Enhancements

- Add QR code expiration/invalidation
- Track scan analytics
- Support for reservation codes
- Integration with restaurant management systems
- Multi-language support in scan.html
