import bcrypt from "bcryptjs";

async function generateHash() {
  const password = "password123";
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Password:", password);
    console.log("Generated Hash:", hash);

    // Verify the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log("Verification result:", isValid);

    return hash;
  } catch (error) {
    console.error("Error generating hash:", error);
  }
}

generateHash();
