
const {
  before,
  afterEach,
  after,
  test,
} = require("node:test");

const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");

const {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
} = require("firebase/firestore");

const fs = require("fs");
const path = require("path");

let testEnv;

const PROJECT_ID = "study-room-rules-test";

before(async () => {
  const rules = fs.readFileSync(
      path.resolve(__dirname, "../../firestore.rules"),
      "utf8",
  );

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

/**
 * Seeds the emulator with public and private test rooms.
 */
async function seedTestData() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await setDoc(doc(db, "rooms", "public-room"), {
      name: "Public Study Room",
      visibility: "public",
    });

    await setDoc(doc(db, "rooms", "private-room"), {
      name: "Private Study Room",
      visibility: "private",
    });

    await setDoc(
        doc(db, "rooms", "private-room", "members", "user1"),
        {
          userId: "user1",
          role: "owner",
          status: "active",
        },
    );
  });
}

test("Unauthenticated users can list public rooms", async () => {
  await seedTestData();

  const db = testEnv.unauthenticatedContext().firestore();

  const publicRoomsQuery = query(
      collection(db, "rooms"),
      where("visibility", "==", "public"),
  );

  await assertSucceeds(getDocs(publicRoomsQuery));
});

test("Unauthenticated users cannot read private rooms", async () => {
  await seedTestData();

  const db = testEnv.unauthenticatedContext().firestore();

  await assertFails(
      getDoc(doc(db, "rooms", "private-room")),
  );
});

test("Active members can read their private room", async () => {
  await seedTestData();

  const db = testEnv.authenticatedContext("user1").firestore();

  await assertSucceeds(
      getDoc(doc(db, "rooms", "private-room")),
  );
});

test("Non-members cannot read private room membership lists", async () => {
  await seedTestData();

  const db = testEnv.authenticatedContext("user2").firestore();

  await assertFails(
      getDocs(collection(db, "rooms", "private-room", "members")),
  );
});

test("Clients cannot create rooms directly", async () => {
  const db = testEnv.authenticatedContext("user1").firestore();

  await assertFails(
      setDoc(doc(db, "rooms", "new-room"), {
        name: "Unauthorized Room",
        visibility: "public",
      }),
  );
});

test("Clients cannot modify membership records directly", async () => {
  await seedTestData();

  const db = testEnv.authenticatedContext("user1").firestore();

  await assertFails(
      updateDoc(
          doc(db, "rooms", "private-room", "members", "user1"),
          {role: "admin"},
      ),
  );
});

test("Active members can read membership lists", async () => {
  await seedTestData();

  const db = testEnv.authenticatedContext("user1").firestore();

  await assertSucceeds(
      getDocs(collection(db, "rooms", "private-room", "members")),
  );
});

test("Clients cannot read private invitation configuration", async () => {
  await seedTestData();

  const db = testEnv.authenticatedContext("user1").firestore();

  await assertFails(
      getDoc(doc(db, "rooms", "private-room", "private", "config")),
  );
});
