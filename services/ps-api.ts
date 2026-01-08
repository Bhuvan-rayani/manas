import { ProductItem, ProductStatus } from '../types';
import { getAllProducts, getProductsBySerialNumber } from './db';

/**
 * PS API (Product Serial Access API)
 * Access and retrieve product tracking data by serial number or trip ID
 */

/**
 * Get all products in a trip with optional filtering
 * @param tripId - The trip ID to retrieve products for
 * @returns Array of all products in the trip
 */
export const getAllProductsInTrip = async (tripId: string): Promise<ProductItem[]> => {
  try {
    const products = await getAllProducts(tripId);
    console.log(`✅ Retrieved ${products.length} products from trip ${tripId}`);
    return products;
  } catch (error) {
    console.error('❌ Error retrieving products:', error);
    throw error;
  }
};

/**
 * Get product by serial number (PS)
 * @param tripId - The trip ID
 * @param serialNumber - The product serial number (PS)
 * @returns Product item or null if not found
 */
export const getProductBySerialNumber = async (tripId: string, serialNumber: string): Promise<ProductItem | null> => {
  try {
    const product = await getProductsBySerialNumber(tripId, serialNumber);
    if (product) {
      console.log(`✅ Found product with PS: ${serialNumber}`);
    } else {
      console.log(`⚠️  No product found with PS: ${serialNumber}`);
    }
    return product;
  } catch (error) {
    console.error(`❌ Error retrieving product by serial number:`, error);
    throw error;
  }
};

/**
 * Get products filtered by status
 * @param tripId - The trip ID
 * @param status - Status to filter by
 * @returns Array of products with matching status
 */
export const getProductsByStatus = async (tripId: string, status: ProductStatus): Promise<ProductItem[]> => {
  try {
    const products = await getAllProducts(tripId);
    const filtered = products.filter(p => p.status === status);
    console.log(`✅ Found ${filtered.length} products with status: ${status}`);
    return filtered;
  } catch (error) {
    console.error('❌ Error retrieving products by status:', error);
    throw error;
  }
};

/**
 * Get products added by a specific person
 * @param tripId - The trip ID
 * @param personName - Name of the person who added the products
 * @returns Array of products added by the person
 */
export const getProductsByPerson = async (tripId: string, personName: string): Promise<ProductItem[]> => {
  try {
    const products = await getAllProducts(tripId);
    const filtered = products.filter(p => p.addedBy === personName);
    console.log(`✅ Found ${filtered.length} products added by ${personName}`);
    return filtered;
  } catch (error) {
    console.error('❌ Error retrieving products by person:', error);
    throw error;
  }
};

/**
 * Get products by subsystem
 * @param tripId - The trip ID
 * @param subsystem - Subsystem name to filter by
 * @returns Array of products in the subsystem
 */
export const getProductsBySubsystem = async (tripId: string, subsystem: string): Promise<ProductItem[]> => {
  try {
    const products = await getAllProducts(tripId);
    const filtered = products.filter(p => p.subsystem === subsystem);
    console.log(`✅ Found ${filtered.length} products in subsystem: ${subsystem}`);
    return filtered;
  } catch (error) {
    console.error('❌ Error retrieving products by subsystem:', error);
    throw error;
  }
};

/**
 * Get product inventory statistics
 * @param tripId - The trip ID
 * @returns Statistics about the products
 */
export const getProductStats = async (tripId: string): Promise<{
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  byStatus: { [key in ProductStatus]?: number };
  byPerson: { [key: string]: number };
  bySubsystem: { [key: string]: number };
}> => {
  try {
    const products = await getAllProducts(tripId);
    
    const stats = {
      totalProducts: products.length,
      totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
      totalValue: products.reduce((sum, p) => sum + (p.totalPrice || 0), 0),
      byStatus: {} as { [key in ProductStatus]?: number },
      byPerson: {} as { [key: string]: number },
      bySubsystem: {} as { [key: string]: number }
    };

    products.forEach(product => {
      // By Status
      if (!stats.byStatus[product.status]) {
        stats.byStatus[product.status] = 0;
      }
      stats.byStatus[product.status]!++;

      // By Person
      if (!stats.byPerson[product.addedBy]) {
        stats.byPerson[product.addedBy] = 0;
      }
      stats.byPerson[product.addedBy]++;

      // By Subsystem
      if (product.subsystem) {
        if (!stats.bySubsystem[product.subsystem]) {
          stats.bySubsystem[product.subsystem] = 0;
        }
        stats.bySubsystem[product.subsystem]++;
      }
    });

    console.log(`✅ Retrieved stats for ${products.length} products`);
    return stats;
  } catch (error) {
    console.error('❌ Error retrieving product stats:', error);
    throw error;
  }
};

/**
 * Export products as CSV
 * @param tripId - The trip ID
 * @returns CSV formatted string
 */
export const exportProductsAsCSV = async (tripId: string): Promise<string> => {
  try {
    const products = await getAllProducts(tripId);
    
    const headers = ['Serial Number', 'Item Name', 'Quantity', 'Status', 'Added By', 'Subsystem', 'Price Per Unit', 'Total Price', 'Comments', 'Date Added'];
    const rows = products.map(p => [
      p.serialNumber,
      p.itemName,
      p.quantity,
      p.status,
      p.addedBy,
      p.subsystem || '',
      p.pricePerUnit || '',
      p.totalPrice || '',
      p.comments || '',
      new Date(p.createdAt).toLocaleDateString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    console.log(`✅ Exported ${products.length} products as CSV`);
    return csv;
  } catch (error) {
    console.error('❌ Error exporting products:', error);
    throw error;
  }
};

/**
 * Generate a product report
 * @param tripId - The trip ID
 * @returns Formatted product report
 */
export const generateProductReport = async (tripId: string): Promise<string> => {
  try {
    const products = await getAllProducts(tripId);
    const stats = await getProductStats(tripId);

    let report = '=== PRODUCT TRACKING REPORT ===\n\n';
    report += `Total Products: ${stats.totalProducts}\n`;
    report += `Total Quantity: ${stats.totalQuantity}\n`;
    report += `Total Value: ₹${stats.totalValue.toFixed(2)}\n\n`;

    report += 'STATUS BREAKDOWN:\n';
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      report += `  • ${status}: ${count}\n`;
    });

    report += '\nPERSON BREAKDOWN:\n';
    Object.entries(stats.byPerson).forEach(([person, count]) => {
      report += `  • ${person}: ${count} products\n`;
    });

    report += '\nSUBSYSTEM BREAKDOWN:\n';
    Object.entries(stats.bySubsystem).forEach(([subsystem, count]) => {
      report += `  • ${subsystem}: ${count} products\n`;
    });

    report += '\nDETAILED PRODUCTS:\n';
    products.forEach((product, index) => {
      report += `\n${index + 1}. [${product.serialNumber}] ${product.itemName}\n`;
      report += `   Status: ${product.status}\n`;
      report += `   Added By: ${product.addedBy}\n`;
      report += `   Quantity: ${product.quantity}\n`;
      if (product.subsystem) report += `   Subsystem: ${product.subsystem}\n`;
      if (product.totalPrice) report += `   Total Price: ₹${product.totalPrice.toFixed(2)}\n`;
      if (product.comments) report += `   Comments: ${product.comments}\n`;
    });

    console.log(`✅ Generated report for ${products.length} products`);
    return report;
  } catch (error) {
    console.error('❌ Error generating report:', error);
    throw error;
  }
};
