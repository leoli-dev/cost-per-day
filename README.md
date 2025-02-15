# Cost Per Day Tracker

A simple yet powerful web application to track your daily costs for purchased items. This app helps you understand how much you're spending per day on your purchases by calculating the daily cost from the purchase date until now.

## Features

- **Daily Cost Calculation**: Automatically calculates the cost per day for each item
- **Total Daily Spending**: Shows the sum of all daily costs at a glance
- **Item Management**: 
  - Add new items with name, price, and purchase date
  - Edit existing items
  - Delete items with confirmation
- **Modern UI/UX**:
  - Responsive design
  - Smooth animations
  - Intuitive interface
  - Date picker with month/year selection
- **Persistent Storage**: Uses IndexedDB for local data storage

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone git@github.com:leoli-dev/cost-per-day.git
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

1. **Adding Items**
   - Click the "添加新物品" (Add New Item) button
   - Enter the item name
   - Input the purchase price
   - Select the purchase date
   - Click "保存" (Save)

2. **Editing Items**
   - Click the "修改" (Edit) button on any item
   - Modify the details as needed
   - Click "保存" (Save) to update

3. **Deleting Items**
   - Go to the edit page of an item
   - Click the "删除物品" (Delete Item) button
   - Confirm the deletion in the popup dialog

4. **Viewing Costs**
   - The total daily cost is displayed at the top
   - Each item shows its individual daily cost
   - All costs are automatically updated based on the current date

## Technologies Used

- React
- React Router
- IndexedDB
- CSS3 with modern features
- date-fns for date handling
