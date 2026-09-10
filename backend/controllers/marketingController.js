const MarketingContact = require("../models/MarketingContact");

// =====================================================
// ADD NUMBER
// =====================================================

const addNumber = async (req, res) => {
  try {
    let { number } = req.body;

    if (!number) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp number is required",
      });
    }

    // Remove + spaces -
    number = String(number).replace(/[+\s-]/g, "");

    // Indian 10 digit number
    if (number.length === 10) {
      number = "91" + number;
    }

    // Validate number
    if (!/^\d{10,15}$/.test(number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid WhatsApp number",
      });
    }

    // Check duplicate
    const existingNumber =
      await MarketingContact.findOne({ number });

    if (existingNumber) {
      return res.status(409).json({
        success: false,
        message: "This number already exists",
      });
    }

    const contact = await MarketingContact.create({
      number,
    });

    return res.status(201).json({
      success: true,
      message: "Number added successfully",
      contact,
    });
  } catch (error) {
    console.error("ADD MARKETING NUMBER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add number",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL NUMBERS
// =====================================================

const getNumbers = async (req, res) => {
  try {
    const contacts = await MarketingContact.find()
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error(
      "GET MARKETING NUMBERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch numbers",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE NUMBER
// =====================================================

const deleteNumber = async (req, res) => {
  try {
    const { id } = req.params;

    const contact =
      await MarketingContact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Number not found",
      });
    }

    await MarketingContact.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Number deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE MARKETING NUMBER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete number",
      error: error.message,
    });
  }
};


module.exports = {
  addNumber,
  getNumbers,
  deleteNumber,
};