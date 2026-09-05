const Item = require("../models/Item");
const FoundResponse = require("../models/FoundResponse");

const createItem = async (req, res) => {
  try {
    const { title, description, category, type, location, date } = req.body;

    if (new Date(date) > new Date()) {
      return res.status(400).json({
        message: "Item date cannot be in the future",
      });
    }

    if (!title || !description || !category || !type || !location || !date) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }
    const item = await Item.create({
      title,
      description,
      category,
      type,
      location,
      date,
      reportedBy: req.user.id,
    });

    res.status(201).json({
      message: "Item reported successfully",
      item,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to report item",
      error: err.message,
    });
  }
};

const getItems = async (req, res) => {
  try {
    const { type, category, status, search } = req.query;

    const query = {};

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Item.find(query)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: items.length,
      items,
    });
  } catch (err) {
    console.error("Get Items Error:", err);

    res.status(500).json({
      message: "Failed to fetch items",
      error: err.message,
    });
  }
};

const getReturnedItems = async (req, res) => {
  try {
    const items = await Item.find({
      status: "returned",
    })
      .populate("reportedBy", "name email")
      .sort({ updatedBy: -1 })
      .limit(3);

    const returnedItems = await Promise.all(
      items.map(async (item) => {
        const acceptedResponse = await FoundResponse.findOne({
          itemId: item._id,
          status: "accepted",
        }).select("image");
        return {
          ...item.toObject(),
          returnedImage: acceptedResponse?.image || "",
        };
      }),
    );
    res.json({
      count: returnedItems.length,
      items: returnedItems,
    });
  } catch (err) {
    console.log("Get returned Items Error: ", err);

    res.status(500).json({
      message: "Failed to fetch returned items",
      error: err.message,
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "reportedBy",
      "name email",
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }
    res.json({
      item,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch item",
      error: err.message,
    });
  }
};

const updatedItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }
    if (item.status === "returned") {
      return res.status(400).json({
        message: "Returned items cannot be edited",
      });
    }
    if (
      item.reportedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not authorized to update this item",
      });
    }
    const allowedFields = [
      "title",
      "description",
      "category",
      "location",
      "date",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();

    res.json({
      message: "Item updated successfully",
      item,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update item",
      error: err.message,
    });
  }
};

const deletedItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (
      item.reportedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not authorized to delete this item",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Item deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete item",
      error: err.message,
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getReturnedItems,
  getItemById,
  updatedItem,
  deletedItem,
};
