import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// Clear placeholder sale prices — badge stays, real prices come from admin
async function main() {
  const res = await db.product.updateMany({
    where: { onSale: true, salePrice: "Ask for sale price" },
    data: { salePrice: null },
  });
  console.log(`Cleared placeholder sale price on ${res.count} products`);
}

main().then(() => db.$disconnect());
