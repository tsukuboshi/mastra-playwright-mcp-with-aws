#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { MastraMcpOnEcsStack } from "../lib/mastra-mcp-on-ecs-stack";

const targetEnv = "playwright";

const app = new cdk.App();
new MastraMcpOnEcsStack(app, `MastraMcpOnEcsStack-${targetEnv}`, {
  targetEnv,
});
