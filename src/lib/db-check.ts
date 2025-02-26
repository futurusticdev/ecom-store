import prisma from "./prisma";

/**
 * Checks if the database connection is working
 * @returns {Promise<boolean>} True if connection is successful, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Try to connect to the database
    await prisma.$connect();

    // Run a simple query to verify connection
    await prisma.$queryRaw`SELECT 1 as result`;

    // Disconnect after successful test
    await prisma.$disconnect();

    return true;
  } catch (error) {
    console.error("Database connection check failed:", { error });

    // Try to disconnect in case connection was partially established
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", { disconnectError });
    }

    return false;
  }
}

/**
 * Gets the database connection status with details
 * @returns {Promise<{isConnected: boolean, message: string}>} Connection status and message
 */
export async function getDatabaseStatus(): Promise<{
  isConnected: boolean;
  message: string;
}> {
  try {
    // Try to connect to the database
    await prisma.$connect();

    // Run a simple query to verify connection
    const result = await prisma.$queryRaw`SELECT current_timestamp as time`;

    // Disconnect after successful test
    await prisma.$disconnect();

    return {
      isConnected: true,
      message: `Connected successfully. Server time: ${JSON.stringify(result)}`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Try to disconnect in case connection was partially established
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", { disconnectError });
    }

    return {
      isConnected: false,
      message: `Connection failed: ${errorMessage}`,
    };
  }
}
