import {spawnSync} from "node:child_process";const r=spawnSync("prisma",process.argv.slice(2),{stdio:"inherit",shell:process.platform==="win32"});process.exit(r.status??1);
