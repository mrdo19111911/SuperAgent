# Infrastructure as Code

Production-ready IaC patterns with Terraform, Pulumi, and state management best practices.

## Quick Start

```bash
# Terraform
cd infrastructure/environments/production
terraform init -backend-config="bucket=my-tf-state"
terraform plan -var-file=terraform.tfvars
terraform apply

# Pulumi
pulumi login s3://my-pulumi-state
pulumi stack select production
pulumi up
```

## What's Included

- **Terraform:** Complete module structure with VPC, EKS, RDS examples
- **Pulumi:** TypeScript components for AWS infrastructure
- **State Management:** Remote backends with locking
- **Security:** Encryption, IAM, secrets management
- **CI/CD:** GitHub Actions workflow templates

## Key Features

- Multi-environment configuration
- Reusable modules and components
- State locking with DynamoDB
- Encrypted remote state (S3/S3-compatible)
- Resource tagging and naming conventions
- Security hardening patterns

## Stack Support

- **Cloud Providers:** AWS, GCP, Azure
- **IaC Tools:** Terraform 1.6+, Pulumi 3.x
- **Languages:** HCL, TypeScript, Python, Go
- **Backends:** S3, Terraform Cloud, Pulumi Cloud

## References

- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/)
- [Pulumi Documentation](https://www.pulumi.com/docs/)
- [AWS Well-Architected](https://aws.amazon.com/architecture/well-architected/)
