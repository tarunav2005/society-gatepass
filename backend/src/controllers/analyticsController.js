import Visitor from "../models/Visitor.js";
import Tower from "../models/Tower.js";

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    // Daily visitor trend (last 14 days)
    const dailyTrend = await Visitor.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Status breakdown (all-time)
    const statusBreakdown = await Visitor.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Category breakdown
    const categoryBreakdown = await Visitor.aggregate([
      {
        $lookup: {
          from: "visitorcategories",
          localField: "category",
          foreignField: "_id",
          as: "cat",
        },
      },
      { $unwind: "$cat" },
      { $group: { _id: "$cat.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Tower-wise distribution
    const towerBreakdown = await Visitor.aggregate([
      {
        $lookup: {
          from: "towers",
          localField: "tower",
          foreignField: "_id",
          as: "t",
        },
      },
      { $unwind: "$t" },
      { $group: { _id: "$t.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Fill in missing days with 0 for a smooth chart
    const trendMap = Object.fromEntries(
      dailyTrend.map((d) => [d._id, d.count]),
    );
    const filledTrend = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      filledTrend.push({ date: key, count: trendMap[key] || 0 });
    }
    // Peak visiting hours (0-23), filled with 0 for empty hours
    const peakHoursRaw = await Visitor.aggregate([
      { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
    ]);
    const peakHoursMap = Object.fromEntries(
      peakHoursRaw.map((h) => [h._id, h.count]),
    );
    const peakHours = Array.from({ length: 24 }, (_, h) => ({
      hour: `${h}:00`,
      count: peakHoursMap[h] || 0,
    }));

    // Frequently visited flats (top 5)
    const frequentFlats = await Visitor.aggregate([
      {
        $lookup: {
          from: "flats",
          localField: "flat",
          foreignField: "_id",
          as: "f",
        },
      },
      { $unwind: "$f" },
      { $group: { _id: "$f.flatNumber", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Average approval time — only visitors that actually required resident approval
    // (excludes auto-approved deliveries/categories where respondedAt = createdAt by design)
    const approvalTimes = await Visitor.aggregate([
      {
        $match: {
          respondedAt: { $ne: null },
          status: { $in: ["approved", "rejected"] },
          $expr: { $gt: [{ $subtract: ["$respondedAt", "$createdAt"] }, 1000] }, // more than 1 second gap
        },
      },
      {
        $project: {
          diffMinutes: {
            $divide: [{ $subtract: ["$respondedAt", "$createdAt"] }, 60000],
          },
        },
      },
      { $group: { _id: null, avgMinutes: { $avg: "$diffMinutes" } } },
    ]);

    // Entry vs Exit (checked_in vs checked_out counts)
    const entryExitStats = await Visitor.aggregate([
      { $match: { status: { $in: ["checked_in", "checked_out"] } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyTrend: filledTrend,
        statusBreakdown: statusBreakdown.map((s) => ({
          name: s._id,
          value: s.count,
        })),
        categoryBreakdown: categoryBreakdown.map((c) => ({
          name: c._id,
          value: c.count,
        })),
        towerBreakdown: towerBreakdown.map((t) => ({
          name: t._id,
          value: t.count,
        })),
        peakHours,
        frequentFlats: frequentFlats.map((f) => ({
          name: f._id,
          value: f.count,
        })),
        avgApprovalSeconds: approvalTimes[0]
          ? Math.round(approvalTimes[0].avgMinutes * 60)
          : 0,
        entryExitStats: entryExitStats.map((s) => ({
          name: s._id,
          value: s.count,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
