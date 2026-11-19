
const crypto = require("crypto");
const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

setGlobalOptions({maxInstances: 10});

/**
 * Creates a SHA-256 hash of a private room invitation code.
 * @param {string} code The invitation code.
 * @return {string} The resulting hexadecimal hash.
 */
function hashInviteCode(code) {
  return crypto
      .createHash("sha256")
      .update(code.trim())
      .digest("hex");
}

// Create a new study room.
exports.createRoom = onCall(async (request) => {
  // 1. Verify authentication.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "You must be logged in to create a room.",
    );
  }

  const userId = request.auth.uid;
  const {name, description = "", visibility = "public"} = request.data || {};

  // 2. Validate input.
  if (typeof name !== "string" || name.trim().length < 3 ||
      name.trim().length > 60) {
    throw new HttpsError(
        "invalid-argument",
        "Room name must contain between 3 and 60 characters.",
    );
  }

  if (typeof description !== "string" || description.length > 500) {
    throw new HttpsError(
        "invalid-argument",
        "Description must not exceed 500 characters.",
    );
  }

  if (!["public", "private"].includes(visibility)) {
    throw new HttpsError(
        "invalid-argument",
        "Visibility must be public or private.",
    );
  }

  // 3. Generate a unique room ID.
  const roomRef = db.collection("rooms").doc();
  const memberRef = roomRef.collection("members").doc(userId);

  // 4. Create room and owner membership atomically.
  await db.runTransaction(async (transaction) => {
    const roomData = {
      name: name.trim(),
      description: description.trim(),
      createdBy: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      visibility: visibility,
    };

    const memberData = {
      userId: userId,
      role: "owner",
      joinedAt: FieldValue.serverTimestamp(),
      status: "active",
    };

    transaction.create(roomRef, roomData);
    transaction.create(memberRef, memberData);
  });

  // 5. Return the new room ID.
  return {
    success: true,
    roomId: roomRef.id,
    message: "Study room created successfully.",
  };
});

// Join an existing public study room.
exports.joinPublicRoom = onCall(async (request) => {
  // 1. Verify authentication.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "You must be logged in to join a room.",
    );
  }

  const userId = request.auth.uid;
  const {roomId} = request.data || {};

  // 2. Validate room ID.
  if (typeof roomId !== "string" || !roomId.trim()) {
    throw new HttpsError(
        "invalid-argument",
        "A valid room ID is required.",
    );
  }

  // 3. Get room and membership references.
  const roomRef = db.collection("rooms").doc(roomId.trim());
  const memberRef = roomRef.collection("members").doc(userId);

  // 4. Verify room and create membership atomically.
  await db.runTransaction(async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);

    if (!roomSnapshot.exists) {
      throw new HttpsError(
          "not-found",
          "Study room not found.",
      );
    }

    const roomData = roomSnapshot.data();

    if (roomData.visibility !== "public") {
      throw new HttpsError(
          "permission-denied",
          "This is a private room. An invitation is required.",
      );
    }

    const memberSnapshot = await transaction.get(memberRef);


    if (memberSnapshot.exists) {
      const membership = memberSnapshot.data();

      if (membership.status === "active") {
        throw new HttpsError(
            "already-exists",
            "You are already a member of this room.",
        );
      }

      if (membership.status === "banned") {
        throw new HttpsError(
            "permission-denied",
            "You are banned from this room.",
        );
      }

      if (membership.status !== "left") {
        throw new HttpsError(
            "failed-precondition",
            "Your membership status does not allow rejoining.",
        );
      }

      // Reactivate the existing membership without replacing its document.
      transaction.update(memberRef, {
        role: "member",
        joinedAt: FieldValue.serverTimestamp(),
        status: "active",
      });
    } else {
      // Create a new membership for a first-time member.
      transaction.create(memberRef, {
        userId: userId,
        role: "member",
        joinedAt: FieldValue.serverTimestamp(),
        status: "active",
      });
    }
  });

  return {
    success: true,
    roomId: roomId.trim(),
    message: "You have successfully joined the study room.",
  };
});

// Leave a study room.
exports.leaveRoom = onCall(async (request) => {
  // 1. Verify authentication.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "You must be logged in to leave a room.",
    );
  }

  const userId = request.auth.uid;
  const {roomId} = request.data || {};

  // 2. Validate room ID.
  if (typeof roomId !== "string" || !roomId.trim()) {
    throw new HttpsError(
        "invalid-argument",
        "A valid room ID is required.",
    );
  }

  const roomRef = db.collection("rooms").doc(roomId.trim());
  const memberRef = roomRef.collection("members").doc(userId);

  // 3. Verify membership and update status.
  await db.runTransaction(async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);

    if (!roomSnapshot.exists) {
      throw new HttpsError(
          "not-found",
          "Study room not found.",
      );
    }

    const memberSnapshot = await transaction.get(memberRef);

    if (!memberSnapshot.exists ||
        memberSnapshot.data().status !== "active") {
      throw new HttpsError(
          "failed-precondition",
          "You are not an active member of this room.",
      );
    }

    if (memberSnapshot.data().role === "owner") {
      throw new HttpsError(
          "failed-precondition",
          "Transfer room ownership before leaving.",
      );
    }

    transaction.update(memberRef, {
      status: "left",
    });
  });

  return {
    success: true,
    roomId: roomId.trim(),
    message: "You have successfully left the study room.",
  };
});


/**
 * Generates or replaces a private room invitation code.
 */
exports.regenerateInviteCode = onCall(async (request) => {
  // 1. Verify authentication.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "You must be logged in.",
    );
  }

  const userId = request.auth.uid;
  const {roomId} = request.data || {};

  // 2. Validate room ID.
  if (typeof roomId !== "string" || !roomId.trim()) {
    throw new HttpsError(
        "invalid-argument",
        "A valid room ID is required.",
    );
  }

  const roomRef = db.collection("rooms").doc(roomId.trim());
  const memberRef = roomRef.collection("members").doc(userId);
  const configRef = roomRef.collection("private").doc("config");

  // 3. Generate a secure random invitation code.
  const inviteCode = crypto.randomBytes(32).toString("hex");
  const inviteCodeHash = hashInviteCode(inviteCode);

  // 4. Verify ownership and save the hash.
  await db.runTransaction(async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);

    if (!roomSnapshot.exists) {
      throw new HttpsError(
          "not-found",
          "Study room not found.",
      );
    }

    const roomData = roomSnapshot.data();

    if (roomData.visibility !== "private") {
      throw new HttpsError(
          "failed-precondition",
          "Invitation codes are only available for private rooms.",
      );
    }

    const memberSnapshot = await transaction.get(memberRef);

    if (!memberSnapshot.exists ||
        memberSnapshot.data().status !== "active" ||
        memberSnapshot.data().role !== "owner") {
      throw new HttpsError(
          "permission-denied",
          "Only the room owner can generate an invitation code.",
      );
    }

    transaction.set(configRef, {
      inviteCodeHash: inviteCodeHash,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: userId,
    });
  });

  // 5. Return the code to the owner.
  return {
    success: true,
    roomId: roomId.trim(),
    inviteCode: inviteCode,
    message: "Invitation code generated successfully.",
  };
});

/**
 * Allows an authenticated user to join a private room using an invitation code.
 */
exports.joinPrivateRoom = onCall(async (request) => {
  // 1. Verify authentication.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "You must be logged in to join a room.",
    );
  }

  const userId = request.auth.uid;
  const {roomId, inviteCode} = request.data || {};

  // 2. Validate input.
  if (typeof roomId !== "string" || !roomId.trim()) {
    throw new HttpsError(
        "invalid-argument",
        "A valid room ID is required.",
    );
  }

  if (typeof inviteCode !== "string" ||
      !/^[a-f0-9]{64}$/i.test(inviteCode.trim())) {
    throw new HttpsError(
        "invalid-argument",
        "A valid invitation code is required.",
    );
  }

  // 3. Get Firestore references.
  const roomRef = db.collection("rooms").doc(roomId.trim());
  const memberRef = roomRef.collection("members").doc(userId);
  const configRef = roomRef.collection("private").doc("config");

  // 4. Verify invitation and create membership atomically.
  await db.runTransaction(async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);

    if (!roomSnapshot.exists) {
      throw new HttpsError(
          "not-found",
          "Study room not found.",
      );
    }

    if (roomSnapshot.data().visibility !== "private") {
      throw new HttpsError(
          "failed-precondition",
          "This is not a private room.",
      );
    }

    const configSnapshot = await transaction.get(configRef);

    if (!configSnapshot.exists ||
        typeof configSnapshot.data().inviteCodeHash !== "string") {
      throw new HttpsError(
          "failed-precondition",
          "This room does not have an active invitation code.",
      );
    }

    const submittedHash = Buffer.from(
        hashInviteCode(inviteCode),
        "hex",
    );

    const storedHash = Buffer.from(
        configSnapshot.data().inviteCodeHash,
        "hex",
    );

    if (submittedHash.length !== storedHash.length ||
        !crypto.timingSafeEqual(submittedHash, storedHash)) {
      throw new HttpsError(
          "permission-denied",
          "Invalid invitation code.",
      );
    }

    const memberSnapshot = await transaction.get(memberRef);


    if (memberSnapshot.exists) {
      const membership = memberSnapshot.data();

      if (membership.status === "active") {
        throw new HttpsError(
            "already-exists",
            "You are already a member of this room.",
        );
      }

      if (membership.status === "banned") {
        throw new HttpsError(
            "permission-denied",
            "You are banned from this room.",
        );
      }

      if (membership.status !== "left") {
        throw new HttpsError(
            "failed-precondition",
            "Your membership status does not allow rejoining.",
        );
      }

      transaction.update(memberRef, {
        role: "member",
        joinedAt: FieldValue.serverTimestamp(),
        status: "active",
      });
    } else {
      transaction.create(memberRef, {
        userId: userId,
        role: "member",
        joinedAt: FieldValue.serverTimestamp(),
        status: "active",
      });
    }
  });

  return {
    success: true,
    roomId: roomId.trim(),
    message: "You have successfully joined the private room.",
  };
});
