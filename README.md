# arch-example-aws-containers

[日本語](#日本語) | [English](#english)

## 日本語

[Sketio Arch](https://arch.sketio.app) のパーサー検証用サンプルです。実際に動くアプリではなく、同じ AWS の構成を 3 通りの書き方で書いた見本です。

構成は、利用者から CloudFront、ALB、ECS（Fargate）のサービスへ進み、サービスは RDS（PostgreSQL）と S3 を使います。ALB、ECS、RDS は 1 つの VPC の中にあります。

| 書き方 | 場所 |
|---|---|
| Terraform（HCL） | `terraform/main.tf` |
| AWS CDK（TypeScript のソースだけ。`cdk.out` は含まない） | `cdk/` |
| AWS CloudFormation | `cloudformation/template.yaml` |

Terraform では、既定の provider を ap-northeast-1、CloudFront の provider を us-east-1 にしています（alias `us_east_1`）。CDK のスタックは ap-northeast-1 です。

ECS のタスク定義の環境変数に、RDS のホスト名（`DB_HOST`）と S3 のバケット名（`BUCKET`）を渡しています。パスワードはコードに書かず、RDS が Secrets Manager で管理します。

`.sketio.yml` で `ai.enabled: true` にしてあります。静的に読めないファイルは、Arch の AI が読んで補います。

ライセンスは MIT です。

## English

A sample for testing the parsers of [Sketio Arch](https://arch.sketio.app). It is not a working app; it is a reference showing the same AWS setup written in three ways.

The setup: users reach CloudFront, then an ALB, then an ECS (Fargate) service, and the service uses RDS (PostgreSQL) and S3. The ALB, ECS and RDS are in one VPC.

| Way of writing it | Where |
|---|---|
| Terraform (HCL) | `terraform/main.tf` |
| AWS CDK (TypeScript source only; no `cdk.out`) | `cdk/` |
| AWS CloudFormation | `cloudformation/template.yaml` |

In Terraform, the default provider is ap-northeast-1 and the CloudFront provider is us-east-1 (alias `us_east_1`). The CDK stack is in ap-northeast-1.

The ECS task definition passes the RDS host name (`DB_HOST`) and the S3 bucket name (`BUCKET`) as environment variables. No password is in the code; RDS manages it in Secrets Manager.

`.sketio.yml` sets `ai.enabled: true`, so Arch's AI reads the files the static parsers cannot.

MIT licensed.
