import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || "";

connectDB(mongoUri).then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
