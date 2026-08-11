const Joi =
  require("joi");

const profileBody =
  Joi.object({
    firstName:
      Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    middleName:
      Joi.string()
        .trim()
        .max(100)
        .allow("")
        .optional(),

    lastName:
      Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    dateOfBirth:
      Joi.date()
        .iso()
        .max("now")
        .required(),

    nationality:
      Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    phoneNumber:
      Joi.string()
        .trim()
        .min(7)
        .max(40)
        .required(),

    residentialAddress:
      Joi.string()
        .trim()
        .min(5)
        .max(500)
        .required(),

    city:
      Joi.string()
        .trim()
        .min(2)
        .max(120)
        .required(),

    stateRegion:
      Joi.string()
        .trim()
        .max(120)
        .allow("")
        .optional(),

    postalCode:
      Joi.string()
        .trim()
        .max(30)
        .allow("")
        .optional(),

    country:
      Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    identityType:
      Joi.string()
        .valid(
          "passport",
          "national_id",
          "drivers_license",
          "residence_permit"
        )
        .required(),

    identityNumber:
      Joi.string()
        .trim()
        .min(4)
        .max(120)
        .required(),

    identityExpiryDate:
      Joi.date()
        .iso()
        .greater("now")
        .optional(),
  });

const documentSchema = {
  body:
    Joi.object({
      documentType:
        Joi.string()
          .valid(
            "identity_front",
            "identity_back",
            "selfie",
            "proof_of_address",
            "supporting_document"
          )
          .required(),

      fileUrl:
        Joi.string()
          .uri()
          .max(1000)
          .required(),

      fileName:
        Joi.string()
          .trim()
          .max(255)
          .optional(),

      mimeType:
        Joi.string()
          .trim()
          .max(120)
          .optional(),
    }),
};


const uploadFileSchema = {
  body: Joi.object({
    documentType: Joi.string().valid(
      "identity_front", "identity_back", "selfie",
      "proof_of_address", "supporting_document"
    ).required(),
    fileName: Joi.string().trim().max(255).required(),
    mimeType: Joi.string().valid(
      "image/jpeg", "image/png", "image/webp", "application/pdf"
    ).required(),
    base64Data: Joi.string().min(16).required(),
  }),
};

const listSchema = {
  query:
    Joi.object({
      page:
        Joi.number()
          .integer()
          .min(1)
          .default(1),

      pageSize:
        Joi.number()
          .integer()
          .min(1)
          .max(100)
          .default(20),

      status:
        Joi.string()
          .valid(
            "submitted",
            "under_review"
          )
          .default(
            "submitted"
          ),
    }),
};

const reviewSchema = {
  params:
    Joi.object({
      profileId:
        Joi.string()
          .uuid()
          .required(),
    }),

  body:
    Joi.object({
      status:
        Joi.string()
          .valid(
            "under_review",
            "approved",
            "rejected"
          )
          .required(),

      riskLevel:
        Joi.string()
          .valid(
            "low",
            "medium",
            "high"
          )
          .optional(),

      rejectionReason:
        Joi.string()
          .trim()
          .max(1000)
          .allow("")
          .optional(),
    }),
};

module.exports = {
  saveProfileSchema: {
    body:
      profileBody,
  },

  documentSchema,
  uploadFileSchema,
  listSchema,
  reviewSchema,
};
