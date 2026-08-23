const Joi = require("joi");

const documentTypes = [
  "death_certificate",
  "claimant_id_front",
  "claimant_id_back",
  "claimant_id_document",
  "w9",
  "proof_of_address",
  "additional_identity",
  "signature",
];

module.exports = {
  uploadFile: {
    body: Joi.object({
      documentType: Joi.string()
        .valid(...documentTypes)
        .required(),
    }),
  },

  createClaim: {
    body: Joi.object({
      deceasedName: Joi.string()
        .trim()
        .min(2)
        .max(180)
        .required(),

      deceasedDateOfBirth: Joi.date()
        .iso()
        .allow(null, "")
        .optional(),

      deceasedIdentificationNumber: Joi.string()
        .trim()
        .max(120)
        .allow("")
        .optional(),

      deceasedAccountNumber: Joi.string()
        .trim()
        .min(4)
        .max(50)
        .required(),

      beneficiaryName: Joi.string()
        .trim()
        .min(2)
        .max(180)
        .required(),

      beneficiaryDateOfBirth: Joi.date()
        .iso()
        .allow(null, "")
        .optional(),

      relationshipToDeceased: Joi.string()
        .trim()
        .min(2)
        .max(120)
        .required(),

      contactDetails: Joi.string()
        .trim()
        .min(5)
        .max(1000)
        .required(),

      claimantIdType: Joi.string()
        .valid(
          "passport",
          "drivers_license",
          "national_id",
          "residence_permit"
        )
        .allow("")
        .optional(),

      claimantIdNumber: Joi.string()
        .trim()
        .max(150)
        .allow("")
        .optional(),

      claimantIdExpiryDate: Joi.date()
        .iso()
        .allow(null, "")
        .optional(),

      claimStatement: Joi.string()
        .trim()
        .min(10)
        .max(5000)
        .required(),

      paymentMethod: Joi.string()
        .valid(
          "ach_wire",
          "check",
          "same_bank"
        )
        .required(),

      indemnityFutureClaims: Joi.boolean()
        .valid(true)
        .required(),

      indemnityReturnErrorFunds: Joi.boolean()
        .valid(true)
        .required(),

      signatureDate: Joi.date()
        .iso()
        .allow(null, "")
        .optional(),

      documents: Joi.array()
  .items(
    Joi.object({
      fileId: Joi.string()
        .uuid()
        .required(),

      documentType: Joi.string()
        .valid(...documentTypes)
        .required(),
    })
  )
  .min(3)
  .max(10)
  .required(),
    }),
  },

  listMine: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),

      pageSize: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),

      status: Joi.string()
        .valid(
          "draft",
          "submitted",
          "under_review",
          "more_information_required",
          "approved",
          "rejected",
          "completed",
          "cancelled"
        )
        .optional(),
    }),
  },

  listClaims: {
  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),

    pageSize: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),

    status: Joi.string()
      .valid(
        "draft",
        "submitted",
        "under_review",
        "more_information_required",
        "approved",
        "rejected",
        "completed",
        "cancelled"
      )
      .optional(),
  }),
},

updateClaimStatus: {
  params: Joi.object({
    claimId: Joi.string()
      .uuid()
      .required(),
  }),

  body: Joi.object({
    status: Joi.string()
      .valid(
        "submitted",
        "under_review",
        "more_information_required",
        "approved",
        "rejected",
        "completed",
        "cancelled"
      )
      .required(),

    rejectionReason: Joi.when(
      "status",
      {
        is: "rejected",

        then: Joi.string()
          .trim()
          .min(3)
          .max(2000)
          .required(),

        otherwise: Joi.string()
          .trim()
          .max(2000)
          .allow("", null)
          .optional(),
      }
    ),

    moreInformationRequest: Joi.when(
      "status",
      {
        is: "more_information_required",

        then: Joi.string()
          .trim()
          .min(3)
          .max(3000)
          .required(),

        otherwise: Joi.string()
          .trim()
          .max(3000)
          .allow("", null)
          .optional(),
      }
    ),
  }),
},

claimFile: {
  params: Joi.object({
    claimId: Joi.string()
      .uuid()
      .required(),

    fileId: Joi.string()
      .uuid()
      .required(),
  }),
},

  claimId: {
    params: Joi.object({
      claimId: Joi.string()
        .uuid()
        .required(),
    }),
  },
submitAdditionalInformation: {
  params: Joi.object({
    claimId: Joi.string()
      .uuid()
      .required(),
  }),

  body: Joi.object({
    message: Joi.string()
      .trim()
      .min(3)
      .max(3000)
      .required(),

    documents: Joi.array()
      .items(
        Joi.object({
          fileId: Joi.string()
            .uuid()
            .required(),

          documentType: Joi.string()
            .valid(...documentTypes)
            .required(),
        })
      )
      .max(10)
      .default([]),
  }),
},
  
};