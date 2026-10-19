import * as cdk from "aws-cdk-lib"
import * as cloudfront from "aws-cdk-lib/aws-cloudfront"
import * as origins from "aws-cdk-lib/aws-cloudfront-origins"
import * as ec2 from "aws-cdk-lib/aws-ec2"
import * as ecs from "aws-cdk-lib/aws-ecs"
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2"
import * as rds from "aws-cdk-lib/aws-rds"
import * as s3 from "aws-cdk-lib/aws-s3"
import type { Construct } from "constructs"

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const vpc = new ec2.Vpc(this, "Vpc", { maxAzs: 2 })
    const uploads = new s3.Bucket(this, "Uploads", { versioned: true })
    const db = new rds.DatabaseInstance(this, "Db", {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc,
    })

    const cluster = new ecs.Cluster(this, "Cluster", { vpc })
    const task = new ecs.FargateTaskDefinition(this, "Task", { cpu: 256, memoryLimitMiB: 512 })
    task.addContainer("api", {
      image: ecs.ContainerImage.fromRegistry("public.ecr.aws/nginx/nginx:stable"),
      portMappings: [{ containerPort: 80 }],
      environment: { DB_HOST: db.dbInstanceEndpointAddress, BUCKET: uploads.bucketName },
    })
    const service = new ecs.FargateService(this, "Api", { cluster, taskDefinition: task, desiredCount: 2 })

    const alb = new elbv2.ApplicationLoadBalancer(this, "Alb", { vpc, internetFacing: true })
    alb.addListener("Http", { port: 80 }).addTargets("Api", { port: 80, targets: [service] })

    new cloudfront.Distribution(this, "Cdn", {
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(alb, { protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
    })
  }
}
