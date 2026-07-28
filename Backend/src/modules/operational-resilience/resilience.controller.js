const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./resilience.service");

const createCriticalService =
  asyncHandler(async (req, res) => {
    const data =
      await service.createCriticalService({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Critical business service created successfully",
        data,
      },
      201
    );
  });

const addDependency =
  asyncHandler(async (req, res) => {
    const data =
      await service.addDependency({
        auth: req.auth,
        serviceId:
          req.params.serviceId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Service dependency created successfully",
        data,
      },
      201
    );
  });

const createIncident =
  asyncHandler(async (req, res) => {
    const data =
      await service.createIncident({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Operational incident created successfully",
        data,
      },
      201
    );
  });

const updateIncidentStatus =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateIncidentStatus({
        auth: req.auth,
        incidentId:
          req.params.incidentId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Operational incident status updated successfully",
      data,
    });
  });

const addAffectedService =
  asyncHandler(async (req, res) => {
    const data =
      await service.addAffectedService({
        auth: req.auth,
        incidentId:
          req.params.incidentId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Affected critical service recorded successfully",
        data,
      },
      201
    );
  });

const createIncidentAction =
  asyncHandler(async (req, res) => {
    const data =
      await service.createIncidentAction({
        auth: req.auth,
        incidentId:
          req.params.incidentId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Incident action created successfully",
        data,
      },
      201
    );
  });

const updateIncidentActionStatus =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .updateIncidentActionStatus({
          auth: req.auth,
          actionId:
            req.params.actionId,
          body: req.body,
        });

    return sendSuccess(res, {
      message:
        "Incident action updated successfully",
      data,
    });
  });

const createContinuityPlan =
  asyncHandler(async (req, res) => {
    const data =
      await service.createContinuityPlan({
        auth: req.auth,
        serviceId:
          req.params.serviceId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Business continuity plan created successfully",
        data,
      },
      201
    );
  });

const createExercise =
  asyncHandler(async (req, res) => {
    const data =
      await service.createExercise({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Resilience exercise created successfully",
        data,
      },
      201
    );
  });

const completeExercise =
  asyncHandler(async (req, res) => {
    const data =
      await service.completeExercise({
        auth: req.auth,
        exerciseId:
          req.params.exerciseId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Resilience exercise completed successfully",
      data,
    });
  });

const createPostIncidentReview =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .createPostIncidentReview({
          auth: req.auth,
          incidentId:
            req.params.incidentId,
          body: req.body,
        });

    return sendSuccess(
      res,
      {
        message:
          "Post-incident review created successfully",
        data,
      },
      201
    );
  });

module.exports = {
  createCriticalService,
  addDependency,
  createIncident,
  updateIncidentStatus,
  addAffectedService,
  createIncidentAction,
  updateIncidentActionStatus,
  createContinuityPlan,
  createExercise,
  completeExercise,
  createPostIncidentReview,
};
