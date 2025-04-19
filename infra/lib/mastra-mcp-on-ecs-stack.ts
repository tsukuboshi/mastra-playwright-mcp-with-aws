import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as aws_ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as imagedeploy from "cdk-docker-image-deployment";
import { Construct } from "constructs";
import * as path from "path";

export interface MastraMcpOnEcsStackProps extends cdk.StackProps {
  targetEnv: string;
}

export class MastraMcpOnEcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MastraMcpOnEcsStackProps) {
    super(scope, id, props);

    const targetEnv = props.targetEnv;

    // Create ECR Repository
    const repo = new ecr.Repository(this, "EcrRepository", {
      repositoryName: `mastra-repo-${targetEnv}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // Create VPC and Subnet
    const vpc = new ec2.Vpc(this, "Vpc", {
      vpcName: `mastra-vpc-${targetEnv}`,
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, "EcsCluster", {
      clusterName: `mastra-cluster-${targetEnv}`,
      vpc,
    });

    // Build and Push Docker Image from Dockerfile to ECR
    new imagedeploy.DockerImageDeployment(this, "ImageDeploymentWithTag", {
      source: imagedeploy.Source.directory(path.join(__dirname, "../../app"), {
        platform: aws_ecr_assets.Platform.LINUX_AMD64,
      }),
      destination: imagedeploy.Destination.ecr(repo, {
        tag: "latest",
      }),
    });

    const image = ecs.ContainerImage.fromEcrRepository(repo, "latest");

    // Define the Mastra default port
    const containerPort = 4111;

    // Define the CPU and Memory Limit
    const cpu = 1024;
    const memoryLimitMiB = 2048;

    // Create ALB and ECS Fargate Service
    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "FargateService",
      {
        cluster,
        serviceName: `mastra-service-${targetEnv}`,
        loadBalancerName: `mastra-alb-${targetEnv}`,
        assignPublicIp: true,
        cpu,
        memoryLimitMiB,
        taskImageOptions: {
          containerName: `mastra-container-${targetEnv}`,
          containerPort,
          image,
          environment: {
            NODE_ENV: "production",
          },
        },
      }
    );

    // Add Managed Policy to Task Role
    service.taskDefinition.taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonBedrockFullAccess")
    );
  }
}
