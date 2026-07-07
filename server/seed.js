const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Navigation = require('./models/Navigation');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Dress');
    console.log('Connected to MongoDB');

    const nav = await Navigation.findOne({ location: 'header' });
    if (nav) {
      const hasCollections = nav.items.some(function(i) { return i.label === 'Collections'; });
      if (!hasCollections) {
        nav.items.push({ label: 'Collections', url: '/collections', type: 'internal', displayOrder: 2.5 });
        nav.items.sort(function(a, b) { return a.displayOrder - b.displayOrder; });
        await nav.save();
        console.log('Collections link added to navigation header');
      } else {
        console.log('Collections link already exists in navigation');
      }
    } else {
      await Navigation.create({
        location: 'header',
        items: [
          { label: 'Shop', url: '/shop', type: 'internal', displayOrder: 1 },
          { label: 'Collections', url: '/collections', type: 'internal', displayOrder: 2 },
          { label: 'New Arrivals', url: '/shop?sort=newest', type: 'internal', displayOrder: 3 },
          { label: 'Sale', url: '/shop?sale=true', type: 'internal', displayOrder: 4 },
        ],
        isActive: true,
      });
      console.log('Navigation header seeded with Collections link');
    }

    console.log('Seed completed');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
