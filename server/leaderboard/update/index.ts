import express, { Request, Response } from "express";

const app = express();
app.use(express.json()); // parse JSON automatically

// POST endpoint to receive payload from Kwala
app.post("/update-leaderboard", (req: Request, res: Response) => {
  const { wallet, tokenId, chain } = req.body;

  console.log("Received from Kwala:", req.body);

  // TODO: Update your DB/leaderboard logic here
  // e.g. increase NFT count for this wallet

  res.status(200).json({ success: true, message: "Leaderboard updated!" });
});

