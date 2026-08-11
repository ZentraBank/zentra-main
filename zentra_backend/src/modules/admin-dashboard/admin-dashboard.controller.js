const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./admin-dashboard.service");

const overview =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.overview({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Dashboard overview retrieved successfully",

          data,
        }
      );
    }
  );

const transferTrend =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.transferTrend({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Transfer trend retrieved successfully",

          data,
        }
      );
    }
  );

const customerGrowth =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.customerGrowth({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Customer growth retrieved successfully",

          data,
        }
      );
    }
  );

const accountDistribution =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.accountDistribution({
          auth:
            req.auth,
        });

      return sendSuccess(
        res,
        {
          message:
            "Account distribution retrieved successfully",

          data,
        }
      );
    }
  );

const recentActivity =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.recentActivity({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Recent activity retrieved successfully",

          data,
        }
      );
    }
  );

const pendingActions =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.pendingActions({
          auth:
            req.auth,
        });

      return sendSuccess(
        res,
        {
          message:
            "Pending actions retrieved successfully",

          data,
        }
      );
    }
  );

const fullDashboard =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.fullDashboard({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Admin dashboard retrieved successfully",

          data,
        }
      );
    }
  );

module.exports = {
  overview,
  transferTrend,
  customerGrowth,
  accountDistribution,
  recentActivity,
  pendingActions,
  fullDashboard,
};
