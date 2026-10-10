if (!process.env.DATABASE_URL) process.loadEnvFile(".env.local");

const { readDb, writeDb, prisma, id, now } = await import("../lib/postgres.ts");
const customerId = id();
const productId = id();
const saleId = id();

try {
  const before = await readDb();
  if (!before.workspaces.length) throw new Error("No workspace was imported.");
  const workspace = before.workspaces[0];
  const owner = before.users.find((user) => user.id === workspace.ownerId);
  if (!owner) throw new Error("The imported workspace owner is missing.");
  const timestamp = now();
  before.customers.push({ id: customerId, workspaceId: workspace.id, name: "Migration write check", source: "MANUAL", createdAt: timestamp, updatedAt: timestamp });
  before.products.push({ id: productId, workspaceId: workspace.id, name: "Migration test product", category: "GENERAL", details: {}, sku: `CHECK-${productId}`, price: 5, currency: "USD", stock: 2, reorderLevel: 1, createdAt: timestamp, updatedAt: timestamp });
  before.sales.push({ id: saleId, workspaceId: workspace.id, productId, productName: "Migration test product", productSku: `CHECK-${productId}`, quantity: 1, total: 5, currency: "USD", customerId, customerName: "Migration write check", status: "SOLD", recordedBy: owner.id, createdAt: timestamp, updatedAt: timestamp });
  await writeDb(before);

  const afterInsert = await readDb();
  if (!afterInsert.customers.some((customer) => customer.id === customerId) || !afterInsert.products.some((product) => product.id === productId) || !afterInsert.sales.some((sale) => sale.id === saleId)) throw new Error("PostgreSQL insert/read check failed.");
  afterInsert.sales = afterInsert.sales.filter((sale) => sale.id !== saleId);
  afterInsert.products = afterInsert.products.filter((product) => product.id !== productId);
  afterInsert.customers = afterInsert.customers.filter((customer) => customer.id !== customerId);
  await writeDb(afterInsert);

  const afterDelete = await readDb();
  if (afterDelete.customers.some((customer) => customer.id === customerId) || afterDelete.products.some((product) => product.id === productId) || afterDelete.sales.some((sale) => sale.id === saleId)) throw new Error("PostgreSQL delete check failed.");
  console.log("PostgreSQL customer/product/sale write/read/delete round trip passed.");
} finally {
  await prisma.sale.deleteMany({ where: { id: saleId } });
  await prisma.customer.deleteMany({ where: { id: customerId } });
  await prisma.product.deleteMany({ where: { id: productId } });
  await prisma.$disconnect();
}
