const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
require('dotenv').config();

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

main()
.then(() => {
    console.log("Connected to database");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const addGeometryToExistingListings = async () => {
    try {
        // Get all listings that don't have geometry
        const listingsWithoutGeometry = await Listing.find({ 
            $or: [
                { geometry: { $exists: false } },
                { geometry: null },
                { "geometry.coordinates": { $exists: false } }
            ]
        });

        console.log(`Found ${listingsWithoutGeometry.length} listings without geometry data`);

        for (let listing of listingsWithoutGeometry) {
            try {
                console.log(`Processing: ${listing.title} - ${listing.location}, ${listing.country}`);
                
                // Use location and country for geocoding
                const searchQuery = `${listing.location}, ${listing.country}`;
                
                let response = await geocodingClient.forwardGeocode({
                    query: searchQuery,
                    limit: 1
                }).send();

                if (response.body.features && response.body.features.length > 0) {
                    const geometry = response.body.features[0].geometry;
                    
                    // Update the listing with geometry data
                    await Listing.findByIdAndUpdate(listing._id, {
                        geometry: geometry
                    });
                    
                    console.log(`✅ Added geometry for: ${listing.title}`);
                    console.log(`   Coordinates: [${geometry.coordinates[0]}, ${geometry.coordinates[1]}]`);
                } else {
                    console.log(`❌ No coordinates found for: ${listing.title}`);
                }
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.log(`Error processing ${listing.title}:`, error.message);
            }
        }
        
        console.log("Geometry update process completed!");
        
    } catch (error) {
        console.log("Error in addGeometryToExistingListings:", error);
    }
};

addGeometryToExistingListings()
    .then(() => {
        console.log("Script completed successfully");
        process.exit(0);
    })
    .catch((err) => {
        console.log("Script failed:", err);
        process.exit(1);
    });
