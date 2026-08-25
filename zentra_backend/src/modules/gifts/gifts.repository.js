const { randomUUID } =
  require("crypto");

const db =
  require("../../config/db");

const one = async (
  sql,
  params = [],
) => {
  const [rows] =
    await db.query(
      sql,
      params,
    );

  return rows[0] || null;
};

const findAccountByNumber = ({
  tenantId,
  accountNumber,
}) =>
  one(
    `
      SELECT
        id,
        tenant_id,
        user_id,
        account_number,
        account_name,
        currency,
        status
      FROM accounts
      WHERE tenant_id = ?
        AND account_number = ?
      LIMIT 1
    `,
    [
      tenantId,
      accountNumber,
    ],
  );

const createGift = async ({
  tenantId,
  clientUserId,
  clientAccountId,
  createdByUserId,
  amount,
  redemptionFee,
  currency,
  senderName,
  message = null,
  expiresAt,
}) => {
  const id =
    randomUUID();

  await db.query(
    `
      INSERT INTO gifts (
        id,
        tenant_id,
        client_user_id,
        client_account_id,
        created_by_user_id,

        amount,
        redemption_fee,
        currency,

        sender_name,
        message,
        expires_at,

        status
      )
      VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        'pending'
      )
    `,
    [
      id,
      tenantId,
      clientUserId,
      clientAccountId,
      createdByUserId,

      amount,
      redemptionFee,
      currency,

      senderName,
      message,
      expiresAt,
    ]
  );

  return findGiftById({
    tenantId,
    giftId: id,
  });
};

const findGiftById = ({
  tenantId,
  giftId,
}) =>
  one(
    `
      SELECT
        g.*,

        u.first_name AS client_first_name,
        u.middle_name AS client_middle_name,
        u.last_name AS client_last_name,
        u.email AS client_email,

        a.account_number,
        a.account_name

      FROM gifts g

      INNER JOIN users u
        ON u.id =
          g.client_user_id

      INNER JOIN accounts a
        ON a.id =
          g.client_account_id
       AND a.tenant_id =
          g.tenant_id

      WHERE g.id = ?
        AND g.tenant_id = ?

      LIMIT 1
    `,
    [
      giftId,
      tenantId,
    ],
  );

const findGiftsByTenant =
  async ({
    tenantId,
    status = null,
    limit = 20,
    offset = 0,
  }) => {
    const conditions = [
      "g.tenant_id = ?",
    ];

    const values = [
      tenantId,
    ];

    if (status) {
      conditions.push(
        "g.status = ?",
      );

      values.push(
        status,
      );
    }

    values.push(
      limit,
      offset,
    );

    const [rows] =
      await db.query(
        `
          SELECT
            g.*,

            u.first_name AS client_first_name,
            u.middle_name AS client_middle_name,
            u.last_name AS client_last_name,
            u.email AS client_email,

            a.account_number,
            a.account_name

          FROM gifts g

          INNER JOIN users u
            ON u.id =
              g.client_user_id

          INNER JOIN accounts a
            ON a.id =
              g.client_account_id
           AND a.tenant_id =
              g.tenant_id

          WHERE ${conditions.join(
            " AND ",
          )}

          ORDER BY
            g.created_at DESC

          LIMIT ?
          OFFSET ?
        `,
        values,
      );

    return rows;
  };

const countGiftsByTenant =
  async ({
    tenantId,
    status = null,
  }) => {
    const conditions = [
      "tenant_id = ?",
    ];

    const values = [
      tenantId,
    ];

    if (status) {
      conditions.push(
        "status = ?",
      );

      values.push(
        status,
      );
    }

    const row =
      await one(
        `
          SELECT
            COUNT(*) AS total
          FROM gifts
          WHERE ${conditions.join(
            " AND ",
          )}
        `,
        values,
      );

    return Number(
      row?.total || 0,
    );
  };

const findGiftsByClient =
  async ({
    tenantId,
    userId,
    status = null,
    limit = 20,
    offset = 0,
  }) => {
    const conditions = [
      "g.tenant_id = ?",
      "g.client_user_id = ?",
    ];

    const values = [
      tenantId,
      userId,
    ];

    if (status) {
      conditions.push(
        "g.status = ?",
      );

      values.push(
        status,
      );
    }

    values.push(
      limit,
      offset,
    );

    const [rows] =
      await db.query(
        `
          SELECT
            g.*,

            a.account_number,
            a.account_name

          FROM gifts g

          INNER JOIN accounts a
            ON a.id =
              g.client_account_id
           AND a.tenant_id =
              g.tenant_id

          WHERE ${conditions.join(
            " AND ",
          )}

          ORDER BY
            g.created_at DESC

          LIMIT ?
          OFFSET ?
        `,
        values,
      );

    return rows;
  };

const countGiftsByClient =
  async ({
    tenantId,
    userId,
    status = null,
  }) => {
    const conditions = [
      "tenant_id = ?",
      "client_user_id = ?",
    ];

    const values = [
      tenantId,
      userId,
    ];

    if (status) {
      conditions.push(
        "status = ?",
      );

      values.push(
        status,
      );
    }

    const row =
      await one(
        `
          SELECT
            COUNT(*) AS total
          FROM gifts
          WHERE ${conditions.join(
            " AND ",
          )}
        `,
        values,
      );

    return Number(
      row?.total || 0,
    );
  };

const updateGiftDecision =
  async ({
    tenantId,
    giftId,
    userId,
    currentStatus,
    status,
  }) => {
    const accepted =
      status ===
      "accepted";

    const declined =
      status ===
      "declined";

    const [result] =
      await db.query(
        `
          UPDATE gifts
          SET
            status = ?,

            accepted_at =
              CASE
                WHEN ?
                THEN NOW()
                ELSE accepted_at
              END,

            declined_at =
              CASE
                WHEN ?
                THEN NOW()
                ELSE declined_at
              END

          WHERE id = ?
            AND tenant_id = ?
            AND client_user_id = ?
            AND status = ?
        `,
        [
          status,

          accepted
            ? 1
            : 0,

          declined
            ? 1
            : 0,

          giftId,
          tenantId,
          userId,
          currentStatus,
        ],
      );

    if (
      result.affectedRows !== 1
    ) {
      return null;
    }

    return findGiftById({
      tenantId,
      giftId,
    });
  };

const cancelGift =
  async ({
    tenantId,
    giftId,
    currentStatus,
  }) => {
    const [result] =
      await db.query(
        `
          UPDATE gifts
          SET
            status =
              'cancelled',

            cancelled_at =
              NOW()

          WHERE id = ?
            AND tenant_id = ?
            AND status = ?
        `,
        [
          giftId,
          tenantId,
          currentStatus,
        ],
      );

    if (
      result.affectedRows !== 1
    ) {
      return null;
    }

    return findGiftById({
      tenantId,
      giftId,
    });
  };

const findTenantGiftManagers = async ({
  tenantId,
}) => {
  const [rows] =
    await db.query(
      `
        SELECT DISTINCT
          u.id AS user_id,
          u.first_name,
          u.middle_name,
          u.last_name,
          u.email,

          r.id AS role_id,
          r.name AS role_name,
          r.code AS role_code

        FROM tenant_memberships tm

        INNER JOIN users u
          ON u.id = tm.user_id

        INNER JOIN roles r
          ON r.id = tm.role_id
         AND (
           r.tenant_id = tm.tenant_id
           OR r.tenant_id IS NULL
         )

        INNER JOIN role_permissions rp
          ON rp.role_id = r.id

        INNER JOIN permissions p
          ON p.id = rp.permission_id

        WHERE tm.tenant_id = ?
          AND tm.status = 'active'
          AND u.status = 'active'
          AND u.deleted_at IS NULL
          AND r.is_active = 1
          AND p.code = 'gifts.manage'

        ORDER BY
          u.first_name ASC,
          u.last_name ASC
      `,
      [
        tenantId,
      ]
    );

  return rows;
};

const updatePendingGift = async ({
  tenantId,
  giftId,
  currentStatus,
  clientUserId,
  clientAccountId,
  amount,
  currency,
  senderName,
  message,
  redemptionFee,
  expiresAt,
}) => {
  const [result] =
    await db.query(
      `
        UPDATE gifts
        SET
            client_user_id = ?,
            client_account_id = ?,
            amount = ?,
            redemption_fee = ?,
            currency = ?,
            sender_name = ?,
            message = ?,
            expires_at = ?

        WHERE id = ?
          AND tenant_id = ?
          AND status = ?
      `,
      [
        clientUserId,
        clientAccountId,
        amount,
        redemptionFee,
        currency,
        senderName,
        message,
        expiresAt,
        giftId,
        tenantId,
        currentStatus,
        ],
    );

  if (
    result.affectedRows !== 1
  ) {
    return null;
  }

  return findGiftById({
    tenantId,
    giftId,
  });
};

const expireGiftIfNeeded = async ({
  tenantId,
  giftId,
}) => {
  await db.query(
    `
      UPDATE gifts
      SET
        status = 'expired',
        expired_at = NOW()

      WHERE id = ?
        AND tenant_id = ?
        AND status = 'pending'
        AND expires_at IS NOT NULL
        AND expires_at <= NOW()
    `,
    [
      giftId,
      tenantId,
    ],
  );

  return findGiftById({
    tenantId,
    giftId,
  });
};

const expirePendingGiftsByTenant =
  async ({
    tenantId,
  }) => {
    const [result] =
      await db.query(
        `
          UPDATE gifts
          SET
            status = 'expired',
            expired_at = NOW()

          WHERE tenant_id = ?
            AND status = 'pending'
            AND expires_at IS NOT NULL
            AND expires_at <= NOW()
        `,
        [
          tenantId,
        ],
      );

    return result.affectedRows;
  };

const findPrivateFileById = ({
  tenantId,
  fileId,
}) =>
  one(
    `
      SELECT *
      FROM private_files
      WHERE id = ?
        AND tenant_id = ?
        AND status = 'active'
      LIMIT 1
    `,
    [
      fileId,
      tenantId,
    ]
  );

  const findRedemptionProofByGift = ({
  tenantId,
  giftId,
}) =>
  one(
    `
      SELECT
        grp.*,

        pf.original_name,
        pf.mime_type,
        pf.size_bytes

      FROM gift_redemption_proofs grp

      INNER JOIN private_files pf
        ON pf.id = grp.file_id
       AND pf.tenant_id = grp.tenant_id

      WHERE grp.tenant_id = ?
        AND grp.gift_id = ?

      LIMIT 1
    `,
    [
      tenantId,
      giftId,
    ]
  );

  const saveRedemptionProof = async ({
  tenantId,
  giftId,
  clientUserId,
  fileId,
  amountPaid,
  paymentReference = null,
  paymentMethod,
  note = null,
}) => {
  const existing =
    await findRedemptionProofByGift({
      tenantId,
      giftId,
    });

  if (existing) {
    await db.query(
      `
        UPDATE gift_redemption_proofs
        SET
          file_id = ?,
          amount_paid = ?,
          payment_reference = ?,
          payment_method = ?,
          note = ?,

          status = 'submitted',

          rejection_reason = NULL,
          reviewed_at = NULL,
          submitted_at = NOW()

        WHERE tenant_id = ?
          AND gift_id = ?
          AND client_user_id = ?
      `,
      [
        fileId,
        amountPaid,
        paymentReference,
        paymentMethod,
        note,

        tenantId,
        giftId,
        clientUserId,
      ]
    );
  } else {
    const id =
      randomUUID();

    await db.query(
      `
        INSERT INTO gift_redemption_proofs (
          id,
          tenant_id,
          gift_id,
          client_user_id,

          file_id,

          amount_paid,
          payment_reference,
          payment_method,
          note,

          status,
          submitted_at
        )
        VALUES (
          ?, ?, ?, ?,
          ?,
          ?, ?, ?, ?,
          'submitted',
          NOW()
        )
      `,
      [
        id,
        tenantId,
        giftId,
        clientUserId,

        fileId,

        amountPaid,
        paymentReference,
        paymentMethod,
        note,
      ]
    );
  }

  return findRedemptionProofByGift({
    tenantId,
    giftId,
  });
};


const updateGiftRedemptionStatus = async ({
  tenantId,
  giftId,
  currentStatus,
  status,
}) => {
  const [result] =
    await db.query(
      `
        UPDATE gifts
        SET
          status = ?,

          processed_at =
            CASE
              WHEN ?
              THEN COALESCE(
                processed_at,
                NOW()
              )
              ELSE processed_at
            END

        WHERE id = ?
          AND tenant_id = ?
          AND status = ?
      `,
      [
        status,

        status ===
        "processed"
          ? 1
          : 0,

        giftId,
        tenantId,
        currentStatus,
      ]
    );

  if (
    result.affectedRows !== 1
  ) {
    return null;
  }

  return findGiftById({
    tenantId,
    giftId,
  });
};

const createPrivateFileRecord =
  async ({
    id,
    tenantId,
    userId,
    module,
    documentType,
    originalName,
    storedName,
    mimeType,
    sizeBytes,
    storagePath,
  }) => {
    await db.query(
      `
        INSERT INTO private_files (
          id,
          tenant_id,
          user_id,
          module,
          document_type,
          original_name,
          stored_name,
          mime_type,
          size_bytes,
          storage_path
        )
        VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `,
      [
        id,
        tenantId,
        userId,
        module,
        documentType,
        originalName,
        storedName,
        mimeType,
        sizeBytes,
        storagePath,
      ]
    );

    return findPrivateFileById({
      tenantId,
      fileId: id,
    });
  };

 const reviewRedemptionProof =
  async ({
    tenantId,
    giftId,
    status,
    rejectionReason = null,
  }) => {
    const [result] =
      await db.query(
        `
          UPDATE gift_redemption_proofs
          SET
            status = ?,
            rejection_reason = ?,
            reviewed_at = NOW()

          WHERE tenant_id = ?
            AND gift_id = ?
            AND status = 'submitted'
        `,
        [
          status,
          rejectionReason,
          tenantId,
          giftId,
        ]
      );

    if (
      result.affectedRows !== 1
    ) {
      return null;
    }

    return findRedemptionProofByGift({
      tenantId,
      giftId,
    });
  };

module.exports = {
  db,

  findAccountByNumber,

  createGift,
  findGiftById,

  findGiftsByTenant,
  countGiftsByTenant,

  findGiftsByClient,
  countGiftsByClient,

  updateGiftDecision,
  cancelGift,

  findTenantGiftManagers,

  updatePendingGift,

  expireGiftIfNeeded,
  expirePendingGiftsByTenant,

  createPrivateFileRecord,
  findPrivateFileById,

  findRedemptionProofByGift,
  saveRedemptionProof,
  reviewRedemptionProof,

  updateGiftRedemptionStatus,
};