// This one create prisma client everytime so we no need to create all the time

import { PrismaClient } from "@prisma/client";

export default new PrismaClient();
