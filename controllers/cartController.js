const Cart = require('../models/cart');
const Medicine = require('../models/medicine');

exports.addtocart = async (req, res) => {
    const userId = req.user.id;
    const { medicineId, quantity = 1 } = req.body;
  
    if (!medicineId) {
      return res.status(400).json({ message: 'Medicine ID is required' });
    }
  
    try {
      // Verify medicine exists
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
      }
  
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        // Create new cart with the item
        cart = new Cart({
          userId,
          items: [{ medicineId, quantity }],
        });
      } else {
        // Check if item already exists in cart
        const itemIndex = cart.items.findIndex(
          (item) => item.medicineId?.toString() === medicineId
        );
  
        if (itemIndex > -1) {
          // Item exists, update quantity
          cart.items[itemIndex].quantity += quantity;
        } else {
          // Add new item
          cart.items.push({ medicineId, quantity });
        }
      }
  
      await cart.save();
      res.status(200).json({ message: 'Item added to cart', cart });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
exports.getCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const cart = await Cart.findOne({ userId }).populate('items.medicineId');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const formattedItems = cart.items
            .filter(item => item.medicineId)
            .map(item => ({
                name: item.medicineId.name,
                description: item.medicineId.description,
                price: item.medicineId.price,
                image: item.medicineId.image,
                quantity: item.quantity,
            }));

        res.status(200).json({ items: formattedItems });
    } catch (error) {
        console.error("Error in getCart:", error);
        res.status(500).json({ message: 'Failed to fetch cart' });
    }
};



exports.removeItem = async (req, res) => {
    const userId = req.user.id;
    const { medicineId } = req.body;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => item.medicineId.toString() !== medicineId);
        cart.updatedAt = Date.now();
        await cart.save();

        res.status(200).json({ message: 'Item removed', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to remove item' });
    }
};

// Create or update an address
