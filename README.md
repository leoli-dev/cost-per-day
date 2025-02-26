# Cost Per Day

A progressive web application that helps you track the daily cost of your purchased items. Calculate how much your possessions cost you per day from the purchase date until now.

## Features

- **Daily Cost Calculation**: Automatically calculates the cost per day for each item
- **Total Daily Spending**: Shows the sum of all daily costs at a glance
- **Item Management**: 
  - Add new items with name, price, and purchase date
  - Edit existing items
  - Delete items with confirmation
- **Data Management**:
  - Export data to JSON file
  - Import data from JSON file
  - Data persistence using IndexedDB
- **Customization**:
  - Multiple language support (English, French, Chinese)
  - Currency selection (USD, EUR, CNY)
- **Modern UI/UX**:
  - Responsive design for mobile and desktop
  - Smooth animations and transitions
  - Intuitive navigation
  - Mobile-optimized date picker
  - Progressive Web App capabilities

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/leoli-dev/cost-per-day.git
cd cost-per-day
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open in your default browser at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` folder.

## How to Use

### Adding Items
1. Click the "+" icon in the bottom navigation
2. Enter the item name
3. Input the purchase price
4. Select the purchase date using the date picker
5. Click "Save"

### Viewing Items
1. The home screen displays all your items with their daily cost
2. The total daily cost is shown at the top
3. Click on any item to expand and see details

### Editing Items
1. Click on an item to expand it
2. Click the "Edit" button
3. Modify the details as needed
4. Click "Save" to update

### Deleting Items
1. Navigate to the edit page of an item
2. Click the "Delete Item" button
3. Confirm the deletion in the popup dialog

### Managing Data
1. Go to the Settings page by clicking the gear icon
2. Under "Data Management":
   - Click "Export Data" to download your data as a JSON file
   - Click "Import Data" to upload a previously exported JSON file

### Changing Settings
1. Go to the Settings page
2. Change language: Select from English, French, or Chinese
3. Change currency: Select from USD ($), EUR (€), or CNY (¥)

## Technologies Used

- **Frontend**: React, React Router
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB
- **Internationalization**: i18next
- **Icons**: React Icons

## Browser Support

The application works on all modern browsers including:
- Chrome (and Chromium-based browsers)
- Firefox
- Safari
- Edge

## Mobile Support

The app is designed with a mobile-first approach and includes:
- Touch-friendly interface
- Native date picker on mobile devices
- Responsive layout for all screen sizes
- PWA support for installation on home screen

## License

This project is licensed under the MIT License - see the LICENSE file for details.
