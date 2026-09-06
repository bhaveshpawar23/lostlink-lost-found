const FoundResponse = require("../models/FoundResponse");
const Item = require("../models/Item");

const createFoundResponse = async (req, res) => {
  try {
    console.log("CREATE FOUND RESPONSE CALLED");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);

    const { itemId, message } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({
        message: "Item id amd message are required",
      });
    }
    const item = await Item.findById(itemId);

    const existingResponse = await FoundResponse.findOne({
      itemId,
      responderId: req.user.id,
    });

    if (existingResponse) {
      return res.status(400).json({
        message: "You have already submitted a response for this item",
      });
    }

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.type !== "lost") {
      return res.status(400).json({
        message: "You can only response to lsot items",
      });
    }

    if (item.status !== "active") {
      return res.status(400).json({
        message: "This item is no longer active",
      });
    }

    if (item.reportedBy.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot respond to your own lost item",
      });
    }
    const response = await FoundResponse.create({
      itemId,
      responderId: req.user.id,
      message,
      image: req.file ? req.file.path : "",
    });

    res.status(201).json({
      message: "Found response submitted successfully",
      response,
    });
  } catch (err) {
    console.log("Found Response Error: ", err);

    res.status(500).json({
      message: "Failed to submit found response",
      error: err.message,
    });
  }
};

const getMyFoundResponses = async (req, res) => {
  try {
    const myItems = await Item.find({
      reportedBy: req.user.id,
    }).select("_id");

    const itemIds = myItems.map((item) => item._id);

    const responses = await FoundResponse.find({
      itemId: { $in: itemIds },
    })
      .populate("itemId", "title description location type status")
      .populate("responderId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: responses.length,
      responses,
    });
  } catch (err) {
    console.log("Get Found Responses Error:", err);
    res.status(500).json({
      message: "Failed to fetch found responses",
      error: err.message,
    });
  }
};

const getMySubmittedFoundResponses = async (req, res) => {
  try {
    const responses = await FoundResponse.find({
      responderId: req.user.id,
    })
      .populate({
        path: "itemId",
        select: "title description location type status reportedBy",
        populate: {
          path: "reportedBy",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });
    res.json({
      count: responses.length,
      responses,
    });
  } catch (err) {
    console.log("Get My Submitted Found Responses Error:", err);

    res.status(500).json({
      message: "Faaiiled to fetch your submitted found responses",
      error: err.message,
    });
  }
};

const updateFoundResponseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be accepted or rejected",
      });
    }

    const response = await FoundResponse.findById(req.params.id);

    if (!response) {
      return res.status(404).json({
        message: "Found response not found",
      });
    }

    const item = await Item.findById(response.itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    console.log("ITEM REPORTER ID:", item.reportedBy.toString());
    console.log("REQUEST USER ID:", req.user.id);

    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the item owner can update this response",
      });
    }

    if (response.status !== "pending") {
      return res.status(400).json({
        message: "This response has already been processed",
      });
    }

    response.status = status;
    await response.save();

    if (status === "accepted") {
      await FoundResponse.updateMany(
        {
          itemId: response.itemId,
          _id: { $ne: response._id },
          status: "pending",
        },
        {
          $set: { status: "rejected" },
        },
      );
      item.status = "returned";
      await item.save();
    }

    res.json({
      message: `Found response ${status} successfully`,
      response,
    });
  } catch (err) {
    console.log("Update Found Response Error:", err);

    res.status(500).json({
      message: "Failed to update found response",
      error: err.message,
    });
  }
};

module.exports = {
  createFoundResponse,
  getMyFoundResponses,
  getMySubmittedFoundResponses,
  updateFoundResponseStatus,
};
